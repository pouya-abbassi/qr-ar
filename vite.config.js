import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    compression({
      algorithm: 'gzip',
      deleteOriginalAssets: false,
      threshold: 10240,
      include: /\.(js|css|html|json|svg|xml)$/i,
    }),
    compression({
      algorithm: 'brotliCompress',
      deleteOriginalAssets: false,
      threshold: 10240,
      include: /\.(js|css|html|json|svg|xml)$/i,
    }),
  ],
});
