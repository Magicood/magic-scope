import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// 真实消费者视角:直接以发布包名 import @magic-scope/react|tokens(pnpm workspace 解析到 dist)。
// 不做 source alias —— 这样跑的就是「别人 npm 装到的形态」,能真实检验组件库实战效果。
export default defineConfig({
  plugins: [react()],
  server: { open: false, port: 5181 },
});
