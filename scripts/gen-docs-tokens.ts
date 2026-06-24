/**
 * 生成 docs 用的主题变量 css(由 @magic-scope/tokens 的引擎 compile,不手写)。
 * docs:dev / docs:build 前自动跑;产物 docs/.vitepress/theme/tokens.css 不入 git。
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { arcaneDark, arcaneLight, compileThemeToCss } from '../packages/tokens/src/index';

const dark = compileThemeToCss(arcaneDark, { selector: '.ms-demo' });
const light = compileThemeToCss(arcaneLight, { selector: '.ms-demo[data-ms-scheme="light"]' });

const out = join(import.meta.dirname, '..', 'docs', '.vitepress', 'theme', 'tokens.css');
writeFileSync(out, `/* 由 pnpm gen:docs-tokens 生成,勿手改 */\n${dark}\n${light}`);
console.log(`docs tokens.css 已生成 → ${out}`);
