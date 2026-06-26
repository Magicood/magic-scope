import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  // 同 tokens/react:不随包发布 sourcemap(瘦身 + 干净 dist),dev 走 src。
  sourcemap: false,
  treeshake: true,
});
