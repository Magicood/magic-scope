import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // 让 demo / 适配器以「真实公开包名」import,既显示成用户实际写法,又从源码渲染。
  resolve: {
    alias: {
      '@magic-scope/react': fileURLToPath(
        new URL('../packages/react/src/index.ts', import.meta.url),
      ),
      '@magic-scope/tokens': fileURLToPath(
        new URL('../packages/tokens/src/index.ts', import.meta.url),
      ),
    },
  },
  server: { open: false },
});
