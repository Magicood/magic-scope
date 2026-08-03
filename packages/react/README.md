# @magic-scope/react

> magic-scope 的 React 组件包 —— 魔法主题,自研、消费 `@magic-scope/tokens` 的 `--ms-*` 变量。

[![npm](https://img.shields.io/npm/v/@magic-scope/react.svg)](https://www.npmjs.com/package/@magic-scope/react)

94 个无障碍组件(9 大分类,覆盖表单 / 数据展示 / 浮层 / 导航 / 布局 / 文字排版等),平台原生底座(原生 `<dialog>` / Popover API / CSS Anchor Positioning),内建进场 / 滚动特效系统,光影与动效可参数化开关。

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

## 特效系统(Reveal)

进场 / 滚动特效随包内建,零第三方依赖,全部只动 `transform` / `opacity` / `filter` / `clip-path`(合成层友好):

```tsx
import { Reveal, RevealGroup, useReveal } from '@magic-scope/react';

<Reveal variant="up">滚动进视口时上滑进场</Reveal>
<Reveal variant="parallax" trigger="scrub">滚动驱动视差(原生 animation-timeline)</Reveal>
<RevealGroup variant="zoom-in" stagger={80}>
  {cards /* 整组错峰进场,单 IntersectionObserver 管理 */}
</RevealGroup>
```

- **29 种变体**:fade、四向 / 斜向飞入、zoom、flip、rotate、blur、clip / mask 四向幕布、text 逐行 / 逐词 / 逐字、shine 扫光、parallax 视差、progress 滚动进度
- **三种触发**:`view`(进视口)/ `mount`(挂载即播)/ `scrub`(滚动驱动)
- 自动尊重全局动效档位与 `prefers-reduced-motion`(降级为直接显示,内容永不丢失);`useReveal` 可单独拿 `inView` 门控 count-up / 图表描线等

## 文档

组件清单与实时预览见 [magic-scope 文档站](https://github.com/Magicood/magic-scope)。

## 溯源(随包)

每个组件的溯源元数据随包发布,读 `@magic-scope/react/registry.json` 即可查全部组件的来源、收录日期与需求:

```ts
const registry = require('@magic-scope/react/registry.json');
// ESM(Node 20+):import registry from '@magic-scope/react/registry.json' with { type: 'json' };
// registry[i] = { id, name, source: { type, app?, url?, capturedAt, requirements }, ... }
```

## 许可

MIT · 仓库 [magic-scope](https://github.com/Magicood/magic-scope)
