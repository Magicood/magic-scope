# @magic-scope/tokens

> magic-scope 的设计 token 与主题引擎 —— 魔法主题,深色奥术(Arcane)为默认预设。

[![npm](https://img.shields.io/npm/v/@magic-scope/tokens.svg)](https://www.npmjs.com/package/@magic-scope/tokens)

高度可配置的多主题引擎:核心契约(`ThemeContract`)→ OKLCH 派生 → `--ms-*` CSS 变量。一套契约派生明暗双模,运行时可一键切换主题 / 密度 / 动效 / 光效。

## 安装

```bash
pnpm add @magic-scope/tokens
```

## 用法

```ts
import { applyTheme, registerProperties, setTheme } from '@magic-scope/tokens';
import { arcaneDark } from '@magic-scope/tokens/themes';

registerProperties();   // 注册 @property(可选,启用更平滑的过渡)
applyTheme(arcaneDark); // 把主题注入为 --ms-* CSS 变量

// 运行时一键切换:
setTheme('arcane', 'light');
```

也可直接引入预编译 CSS(无需 JS 运行时):

```ts
import '@magic-scope/tokens/css/arcane.css';
```

## 内置主题:6 家族 × 明暗 = 12 套预设

| 家族 | 气质 | 导出 |
| --- | --- | --- |
| `arcane` 奥术 | 紫罗兰主色,默认 | `arcaneDark` / `arcaneLight` |
| `frost` 霜蓝 | 青蓝 + 品红点缀,冷调 | `frostDark` / `frostLight` |
| `ember` 余烬 | 暖橙 | `emberDark` / `emberLight` |
| `verdant` 苍翠 | 绿 | `verdantDark` / `verdantLight` |
| `solar` 曦光 | 金黄 | `solarDark` / `solarLight` |
| `mono` 墨白 | 无彩中性 | `monoDark` / `monoLight` |

全部由 `deriveTheme` 从少量 seed 派生(零硬编码色值)。`presetFamilies` 提供 `{ name, label }` 清单,可直接渲染主题选择器;`registerThemes(presetThemes)` 一次注册全部,之后 `setTheme('frost', 'dark')` 即切。

四轴运行时切换(均落到根元素 `data-ms-*` 属性,可用 View Transitions 平滑过渡):

```ts
setTheme('ember', 'light'); // 主题 × 明暗
setDensity('compact');      // 密度:comfortable / compact / spacious
setMotion('subtle');        // 动效:full / subtle / off
setFx('off');               // 光影:full / subtle / off
```

SSR / 静态页防闪烁(首帧前从 localStorage 恢复四轴):

```tsx
<script dangerouslySetInnerHTML={{ __html: getNoFlashScript() }} />
```

## 子入口

| 入口 | 内容 |
| --- | --- |
| `@magic-scope/tokens` | 主入口:运行时(`applyTheme` / `setTheme` / `setDensity` / `setMotion` / `setFx` …)、主题、契约 |
| `@magic-scope/tokens/contract` | `ThemeContract` 类型与颜色角色定义 |
| `@magic-scope/tokens/engine` | 主题 → CSS 变量的编译 / 注入 |
| `@magic-scope/tokens/themes` | 内置主题预设(6 家族 12 套 + `presetFamilies` / `presetThemes`) |
| `@magic-scope/tokens/derive` | 从单一种子色派生完整主题 |
| `@magic-scope/tokens/css/arcane.css` | 预编译的奥术主题 CSS |

## 许可

MIT · 仓库 [magic-scope](https://github.com/Magicood/magic-scope)
