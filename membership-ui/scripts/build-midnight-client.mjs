/**
 * Pre-bundles Midnight client code with Vite so Next.js does not have to
 * webpack WASM/CJS Midnight packages (which fails with "Default condition
 * should be last one"). The browser loads /midnight-client.js at runtime.
 */
import fs from 'node:fs';
import { build } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const contractDir = path.resolve(
  root,
  '..',
  'contract',
  'src',
  'managed',
  'private-membership-verification',
);
const outFile = path.resolve(root, 'public', 'midnight-client.js');

const findNodeModule = (subpath) => {
  const local = path.resolve(root, 'node_modules', subpath);
  if (fs.existsSync(local)) return local;
  const monorepoRoot = path.resolve(root, '..', 'node_modules', subpath);
  if (fs.existsSync(monorepoRoot)) return monorepoRoot;
  try {
    return require.resolve(subpath, { paths: [root, path.resolve(root, '..')] });
  } catch {
    return local;
  }
};

if (!fs.existsSync(contractDir)) {
  if (fs.existsSync(outFile) && process.env.ALLOW_STALE_MIDNIGHT_CLIENT === '1') {
    console.warn(
      '[build-midnight-client] managed contract missing — reusing existing public/midnight-client.js',
    );
    process.exit(0);
  }
  console.error(
    '[build-midnight-client] managed contract missing at',
    contractDir,
    '\nCommit contract/src/managed/private-membership-verification or run npm run compile first.',
  );
  process.exit(1);
}

await build({
  configFile: false,
  root,
  plugins: [
    wasm(),
    topLevelAwait(),
    nodePolyfills({ include: ['buffer', 'process', 'util', 'stream', 'events'] }),
  ],
  resolve: {
    // Managed contract lives outside membership-ui/; dynamically resolve deps
    // so hoisted packages in npm workspaces (e.g. CI / Vercel) resolve cleanly.
    alias: {
      '@contract': contractDir,
      '@midnight-ntwrk/compact-runtime': findNodeModule('@midnight-ntwrk/compact-runtime'),
      'object-inspect': path.resolve(root, 'lib/shims/object-inspect.js'),
      'cross-fetch': path.resolve(root, 'lib/shims/cross-fetch-offset-fix.ts'),
      'vite-plugin-node-polyfills/shims/buffer': findNodeModule(
        'vite-plugin-node-polyfills/shims/buffer/dist/index.js',
      ),
      'vite-plugin-node-polyfills/shims/global': findNodeModule(
        'vite-plugin-node-polyfills/shims/global/dist/index.js',
      ),
      'vite-plugin-node-polyfills/shims/process': findNodeModule(
        'vite-plugin-node-polyfills/shims/process/dist/index.js',
      ),
    },
  },
  build: {
    lib: {
      entry: path.resolve(root, 'lib/contract.ts'),
      name: 'MidnightMembershipClient',
      formats: ['es'],
      fileName: () => 'midnight-client.js',
    },
    outDir: path.resolve(root, 'public'),
    emptyOutDir: false,
    target: 'esnext',
    commonjsOptions: {
      include: [/node_modules/, /contract\/src\/managed/],
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});

console.log('[build-midnight-client] wrote public/midnight-client.js');
