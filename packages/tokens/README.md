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

## 子入口

| 入口 | 内容 |
| --- | --- |
| `@magic-scope/tokens` | 主入口:运行时(`applyTheme` / `setTheme` / `setDensity` / `setMotion` / `setFx` …)、主题、契约 |
| `@magic-scope/tokens/contract` | `ThemeContract` 类型与颜色角色定义 |
| `@magic-scope/tokens/engine` | 主题 → CSS 变量的编译 / 注入 |
| `@magic-scope/tokens/themes` | 内置主题预设(`arcaneDark` / `arcaneLight`) |
| `@magic-scope/tokens/derive` | 从单一种子色派生完整主题 |
| `@magic-scope/tokens/css/arcane.css` | 预编译的奥术主题 CSS |

## 许可

MIT · 仓库 [magic-scope](https://github.com/Magicood/magic-scope)
