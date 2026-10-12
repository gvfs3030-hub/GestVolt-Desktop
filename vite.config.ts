import { defineConfig } from 'vite';
import path from 'node:path';

const root = process.cwd();

export default defineConfig({
  base: './',
  publicDir: 'public',
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    alias: [
      { find: /^react-native$/, replacement: path.join(root, 'desktop/shims/react-native.tsx') },
      { find: /^expo-sqlite$/, replacement: path.join(root, 'desktop/shims/sqlite.ts') },
      { find: /^expo-file-system\/legacy$/, replacement: path.join(root, 'desktop/shims/filesystem.ts') },
      { find: /^expo-sharing$/, replacement: path.join(root, 'desktop/shims/sharing.ts') },
      { find: /^expo-document-picker$/, replacement: path.join(root, 'desktop/shims/document-picker.ts') },
      { find: /^expo-secure-store$/, replacement: path.join(root, 'desktop/shims/secure-store.ts') },
      { find: /^expo-crypto$/, replacement: path.join(root, 'desktop/shims/crypto.ts') },
    ],
  },
  optimizeDeps: { include: ['react-native-web', 'sql.js'] },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    target: 'es2022',
  },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
});
