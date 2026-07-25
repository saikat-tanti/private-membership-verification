import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    VITE_NETWORK: process.env.VITE_NETWORK ?? 'undeployed',
    VITE_CONTRACT_ADDRESS: process.env.VITE_CONTRACT_ADDRESS ?? '',
    VITE_PROOF_SERVER_URL: process.env.VITE_PROOF_SERVER_URL ?? 'http://localhost:6300',
    VITE_INDEXER_URI: process.env.VITE_INDEXER_URI ?? '',
    VITE_INDEXER_WS_URI: process.env.VITE_INDEXER_WS_URI ?? '',
  },
  // Pin app root so Next does not treat the monorepo parent lockfile as workspace root.
  turbopack: {
    root: __dirname,
    resolveAlias: {
      '@contract': path.resolve(
        __dirname,
        '..',
        'contracts',
        'managed',
        'private-membership-verification',
      ),
    },
  },
  // Midnight ZK client is prebundled to public/midnight-client.js (see scripts/).
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@contract': path.resolve(
        __dirname,
        '..',
        'contracts',
        'managed',
        'private-membership-verification',
      ),
    };
    return config;
  },
};

export default nextConfig;
