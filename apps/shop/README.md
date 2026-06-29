# Daybreak — `@magic-scope` 电商实战样板站

用 **`@magic-scope/react`(94 组件)+ `@magic-scope/tokens`(主题引擎)** 搭的一个**真实电商店铺**:精品咖啡烘焙品牌 **Daybreak**。
和 `apps/demo`(深色 SaaS dashboard)是**完全不同的类型与审美**,用来从「零售/购物」场景再次检验组件库的实战效果。

## 形态:浅色暖色零售风

- **浅色、暖、通透**(精品食品零售那一脉:Aesop / Apple Store / 高端食品品牌),与 SaaS 的深色冷调反差最大。
- **编辑式 serif 标题 + 干净 sans 正文**(消费方把 `--ms-font-display` 设为衬线,中文用宋体)。
- 默认主题:`solarLight`(曦光浅色,呼应「Daybreak 昼起」)。「魔法」体现在精致动效、晨光暖背景与渐变,**不堆促销腔/中二**。
- 无实拍图:商品视觉(咖啡袋 / 器具)是**手搓 SVG**,按 `product.accent` 与烘焙度上色。

## 覆盖的真实购物流程

- **首页**:Hero、信任条(Marquee)、本周精选、分类入口、品牌理念(Statistic)、每月订阅 CTA、顾客评价(Rate/Avatar)、邮件订阅。
- **商品列表 `#/shop`**:左侧筛选(分类/烘焙度 Checkbox、价格 Slider、风味 checkable Tag)+ 排序 Select + 商品网格,实时过滤、Empty 空态。
- **商品详情 `#/product/<id>`**:面包屑、Carousel 图廊、Rate、规格 Segmented(联动价格)、研磨度 Select、数量 NumberInput、加入购物车 / 立即购买、Tabs(描述/风味/冲煮/评价)、相关推荐。
- **购物车 Drawer**:行项目、NumberInput 改量、移除、小计、免运费提示。
- **结账 `#/checkout`**:Steps(配送→支付→完成)、表单(Input/Textarea/Label)、支付 RadioGroup、订单摘要、Result 成功页。

涉及 Button/Card/Badge/Tag/Rate/Carousel/Segmented/Select/NumberInput/Slider/Checkbox/Tabs/Steps/Breadcrumb/Drawer/Dialog/Radio/Result/Empty/Marquee/Avatar/Statistic/Toast 等。

## 引入方式(真实消费者写法)

```ts
import { applyTheme, registerProperties, registerThemes } from '@magic-scope/tokens';
import { presetThemes, solarLight } from '@magic-scope/tokens/themes';
import { Button, Card /* … */ } from '@magic-scope/react';
import '@magic-scope/react/styles.css';

registerThemes(presetThemes);
registerProperties();
applyTheme(solarLight);
```

> 通过 pnpm workspace 直接吃 `packages/*` 的最新构建产物(dist)。

## 运行

```bash
pnpm --filter @magic-scope/demo-shop dev      # 开发(默认 http://localhost:5182)
pnpm --filter @magic-scope/demo-shop build    # 生产构建
```

首次需在仓库根 `pnpm install` 并 `pnpm -r build` 构建发布包。

## 结构

```
src/
├── main.tsx              # 主题引导(solarLight)+ 渲染
├── App.tsx               # hash 路由(首页/列表/详情/结账)+ Header/Footer/Toaster
├── data/catalog.ts       # 商品、评价、文案、价格的单一真相源(价格用「分」)
├── lib/                  # router、cart(全局购物车 store)
├── components/           # SiteHeader/CartDrawer/Hero/ProductCard/ProductVisual/Reveal/Logo/icons
├── sections/             # 首页各区块
├── pages/                # Home / Shop / ProductPage / Checkout
└── styles/               # app.css(设计层)、shop.css —— 只用 --ms-* token
```
