import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '..', '..', 'contracts', 'managed', 'private-membership-verification');
const dest = path.resolve(__dirname, '..', 'public', 'managed', 'private-membership-verification');

if (!fs.existsSync(src)) {
  console.warn('[copy-contract-assets] managed contract missing — run npm run compile first');
  process.exit(0);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`[copy-contract-assets] Copied ${src} -> ${dest}`);
