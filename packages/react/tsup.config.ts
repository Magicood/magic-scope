import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/styles.css'],
  format: ['esm', 'cjs'],
  dts: { entry: 'src/index.ts' },
  clean: true,
  // 同 tokens:不随包发布 sourcemap(瘦身 + 干净 dist),dev 走 src。
  sourcemap: false,
  treeshake: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
});
