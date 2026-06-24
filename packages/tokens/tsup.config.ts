import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    contract: 'src/contract/index.ts',
    engine: 'src/engine/index.ts',
    themes: 'src/themes/index.ts',
    derive: 'src/derive/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // 构建后:用引擎把 Arcane 预设 compile 成静态 CSS(含 @property),供 SSR / 纯 CSS 消费。
  async onSuccess() {
    const { arcaneDark, arcaneLight, compileThemeToCss, getPropertyDefinitions } = await import(
      './dist/index.js'
    );
    const css = [
      '/* @magic-scope/tokens — Arcane 预设静态 CSS(含 @property)。由 tsup 构建生成,勿手改。 */',
      getPropertyDefinitions(),
      compileThemeToCss(arcaneDark, {
        selector: ':root, [data-ms-theme="arcane"][data-ms-scheme="dark"]',
      }),
      compileThemeToCss(arcaneLight),
    ].join('\n\n');
    mkdirSync(join('dist', 'css'), { recursive: true });
    writeFileSync(join('dist', 'css', 'arcane.css'), `${css}\n`);
    console.log('  ✓ dist/css/arcane.css 已生成');
  },
});
