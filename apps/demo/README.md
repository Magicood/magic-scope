# Vela — `@magic-scope` 实战样板站

用 **`@magic-scope/react`(90 组件)+ `@magic-scope/tokens`(主题引擎)** 搭的一个**真实产品站**,
用来检验组件库在真实场景下的实战效果 —— 不是组件展示页,而是一个完整的 SaaS:

- **营销落地页**(`#/`):导航、Hero(含手搓产品预览面板)、客户 logo 墙、能力 bento 网格、成效指标带、
  四步工作流、客户证言、定价(月/年切换)、FAQ 折叠、CTA、页脚。
- **应用 Dashboard**(`#/app`):侧栏 + 顶栏外壳、KPI 卡(带火花线)、实时流量面积图、事件数据表(搜索 + 分页)、
  活动 Timeline、团队成员管理;⌘K 命令面板、外观设置抽屉、邀请 Dialog、Toast、移动端抽屉导航。

## 设计基调

优雅、克制、轻线条(Linear / Stripe / Vercel 那一脉)。深色奥术为默认主题,「魔法」只体现在精致的动效与
极克制的光影(极光背景、渐变图表、平滑过渡),**不堆中二文案**。

## 招牌:一键换肤

设置抽屉里可实时切换 **6 套配色家族 × 明暗 × 密度 × 动效 × 光影**,全部由 `@magic-scope/tokens` 的同一套
核心主题契约派生,用 View Transitions 平滑过渡 —— 直接演示库的多主题引擎能力。

## 如何引入组件库(真实消费者写法)

```ts
import { applyTheme, registerProperties, registerThemes } from '@magic-scope/tokens';
import { arcaneDark, presetThemes } from '@magic-scope/tokens/themes';
import { Button, Card /* … */ } from '@magic-scope/react';
import '@magic-scope/react/styles.css';

registerThemes(presetThemes);
registerProperties();
applyTheme(arcaneDark);
```

> 通过 pnpm workspace 直接吃 `packages/*` 的最新构建产物(dist),即「别人 npm 装到的形态」。

## 运行

```bash
pnpm --filter @magic-scope/demo-vela dev      # 开发(默认 http://localhost:5181)
pnpm --filter @magic-scope/demo-vela build    # 生产构建
```

依赖工作区包,首次需先在仓库根 `pnpm install` 并构建发布包:`pnpm -r build`。

## 结构

```
src/
├── main.tsx              # 主题引导 + 渲染
├── App.tsx               # 极简 hash 路由(营销页 / 应用)
├── data/content.ts       # 全站文案与 mock 数据的单一真相源
├── components/           # Reveal(滚动渐入)、Chart(手搓 SVG 图表)、Logo、icons
├── lib/                  # router、theme(换肤封装)
├── styles/               # app.css(设计层)、marketing.css、dashboard.css —— 只用 --ms-* token
├── marketing/            # 落地页各区块
└── dashboard/            # 应用 shell 与各面板
```
