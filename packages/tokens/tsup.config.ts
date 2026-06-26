import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
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
  // 不随包发布 sourcemap:消费者用编译产物、本仓库 dev 走 src,
  // 既瘦身 tarball 又避免悬空的 sourceMappingURL 注释。
  sourcemap: false,
  treeshake: true,
  // 构建后:用引擎把 Arcane 预设 compile 成静态 CSS(含 @property),供 SSR / 纯 CSS 消费。
  async onSuccess() {
    // 用运行时解析的绝对 file URL 动态 import 构建产物,避免 esbuild 在编译本 config 时
    // 就静态解析 './dist/index.js'(此刻 dist 尚未生成 → 干净环境 / CI 首次 build 必败)。
    const distUrl = pathToFileURL(resolve('dist/index.js')).href;
    const { arcaneDark, arcaneLight, compileThemeToCss, getPropertyDefinitions } = await import(
      distUrl
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
