import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// 真实消费者视角:以发布包名 import @magic-scope/react|tokens(pnpm workspace 解析到 dist)。
export default defineConfig({
  plugins: [react()],
  server: { open: false, port: 5182 },
});
