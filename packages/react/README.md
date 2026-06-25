# @magic-scope/react

> magic-scope 的 React 组件包 —— 魔法主题,自研、消费 `@magic-scope/tokens` 的 `--ms-*` 变量。

[![npm](https://img.shields.io/npm/v/@magic-scope/react.svg)](https://www.npmjs.com/package/@magic-scope/react)

26 个无障碍组件,平台原生底座(原生 `<dialog>` / Popover API / CSS Anchor Positioning),光影与动效可参数化开关。

## 安装

```bash
pnpm add @magic-scope/react @magic-scope/tokens
# peer: react >= 18, react-dom >= 18
```

## 用法

```tsx
import { applyTheme, registerProperties } from '@magic-scope/tokens';
import { arcaneDark } from '@magic-scope/tokens/themes';
import { Button } from '@magic-scope/react';
import '@magic-scope/react/styles.css'; // 一次性引入全部组件样式

registerProperties();
applyTheme(arcaneDark);

export function App() {
  return <Button variant="solid">Cast</Button>;
}
```

> 两件事缺一不可:引入 `@magic-scope/react/styles.css`,并用 `@magic-scope/tokens` 注入主题变量 —— 否则组件拿不到配色。

## 文档

组件清单与实时预览见 [magic-scope 文档站](https://github.com/Magicood/magic-scope)。

## 许可

MIT · 仓库 [magic-scope](https://github.com/Magicood/magic-scope)
