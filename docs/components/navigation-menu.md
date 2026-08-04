# NavigationMenu <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

网站导航菜单,横向一排导航项,每项可是纯链接或带下拉 panel(mega-menu)的触发器;同一时刻至多一个 panel 打开,带平滑过渡。

> **[在展示站中打开 NavigationMenu](https://magicood.github.io/magic-scope/#/navigation-menu)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

站点级导航(区别于命令菜单 Menubar / Menu):页头横向一排导航项,有的是纯跳转链接(可标 aria-current=page),有的点开是 mega-menu 放富内容或链接网格。

同一时刻至多一个 panel 打开,切换平滑过渡;hover 用户从触发器移到 panel 途中不误关(open / close 延迟 + 穿越宽限的 hover-intent);键盘 ←→ 横向 roving、↓/Enter 打开并进入、Esc 关闭回触发器。

语义区别于 menu:外层 nav 地标、触发器 button、链接是真链接。受控 / 非受控(value / onValueChange),共享 Viewport 单浮层容器随 active panel 过渡。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `NavMenuItem[]` | — | 数据驱动的导航项(与 children 二选一,优先 items)。 |
| `children` | `ReactNode` | — | 复合用法:塞 &lt;NavigationMenu.List&gt; 等子组件。仅在不传 items 时生效。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生 hover / active / 发光配色。默认 primary。 |
| `value` | `string \| null` | — | 受控:当前打开 panel 的项 value(null = 全关)。传入即受控,需配合 onValueChange。 |
| `defaultValue` | `string \| null` | `null` | 非受控初始打开项。默认 null(全关)。 |
| `openDelay` | `number` | `200` | 指针 hover 到打开 panel 的延时(ms,防一扫而过)。默认 200。 |
| `closeDelay` | `number` | `300` | 指针离开到关闭 panel 的宽限延时(ms,防触发器↔panel 穿越误关)。默认 300。 |
| `hoverable` | `boolean` | `true` | 是否启用 hover 打开。默认 true。关掉则仅点击 / 键盘可开(无障碍 / 触屏更稳)。 |
| `viewport` | `boolean` | `true` | 是否用共享 Viewport(单一浮层容器,尺寸 / 位置随 active panel 平滑过渡,Radix 风格)。<br>默认 true。关掉则每个 panel 各自就地展开(更易做超宽 mega-menu 满宽布局)。 |
| `viewportAlign` | `"center" \| "end" \| "start"` | `start` | Viewport 相对触发器行的对齐。默认 start。 |
| `offset` | `number` | `8` | panel 与触发器行的间距(px)。默认 8。 |
| `aria-label` | `string` | — | 外层 &lt;nav&gt; 的可访问名(屏读「导航地标」标签)。不传则走字典 navigationMenu.nav(默认「主导航」)。 |
| `className` | `string` | — | 外层附加 className(作用于 &lt;nav&gt;)。 |
| `classNames` | `NavigationMenuClassNames` | — | 各部件细粒度 className 槽位。 |
| `disabled` | `boolean` | — | 是否禁用。 |
| `active` | `boolean` | — | 是否当前页(渲染 aria-current=page + active 态)。 |
| `asChild` | `boolean` | `false` | asChild:渲染为子元素(如框架 Router 的 &lt;Link&gt;),把属性 / ref compose 进去。 |
| `asTrigger` | `boolean` | `false` | 内部用:作为顶层导航项的链接(承接横向 roving 焦点注册与键盘)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onValueChange` | `(value: string \| null) => void` | 打开项变化回调(受控 / 非受控双通道都触发)。<br>· `value` — 变化后处于打开态的项 value;全部关闭时为 null。 |
| `onEscapeKeyDown` | `(event: KeyboardEvent<HTMLElement>) => void` | Esc 关闭 panel 前回调,可 `preventDefault()` 拦截阻止关闭。<br>无论焦点在触发器还是 panel 内,Esc 都统一走根级全局监听并先调用本回调(单一路径),<br>因此 `preventDefault()` 在两种焦点位置下都能拦截关闭(行为一致)。<br>注:回调收到的是把原生 KeyboardEvent 适配后的事件对象,仅保证 `key` / `preventDefault()` /<br>`defaultPrevented` / `nativeEvent` 可用;不要依赖 React 合成事件的池化或 currentTarget。<br>· `event` — 触发关闭的 Esc 键盘事件,可 `preventDefault()` 拦截。 |

## 兼容性备注

透明披露的已知边界与契约(来自 `component.json` 的 `source.notes`):

几处诚实备注:(1) Viewport 的尺寸/位置过渡用纯 CSS(transform + position-area),不测量 DOM,因此 SSR 安全、无首帧布局抖动;代价是极端超宽 panel 在窄视口靠 max-inline-size + 内部滚动兜底,而非 JS 动态测宽。(2) 定位用 CSS Anchor Positioning,@supports not (anchor-name) 降级为 fixed 居顶,保证不支持的浏览器仍可用。(3) hover-intent 状态机(active 单值不变式 + open/close 延迟 + switch 即切)是零 React 纯逻辑,放 logic.ts 可平移其它框架。(4) 数据驱动(items)与复合(children)二选一;复合自定义 panel 内容时,键盘移入 panel 后的遍历交给原生 Tab,组件只负责把焦点送进 panel 第一个可聚焦元素。(5) hover 仅对 pointerType=mouse/pen 生效,触屏(coarse)走点击避免误开。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | inspired · 受外部启发重做 |
| 收录日期 | 2026-06-26 |
| 来源链接 | <https://www.radix-ui.com/primitives/docs/components/navigation-menu> |
| 标签 | `navigation-menu` `navigation` `mega-menu` `menu` `navbar` `header` `dropdown` `hover-intent` `keyboard` `a11y` |

::: details 需求原文 / 设计意图
需要一个『站点级导航』组件,而不是命令菜单(Menubar/Menu)。设计意图:页头横向一排导航项,有的就是纯跳转链接(可标当前页 aria-current=page),有的点开是 mega-menu——放富内容或链接网格做信息架构入口。核心约束:同一时刻至多一个 panel 打开,切换要平滑过渡(不能闪);鼠标用户靠 hover 操作时,指针从触发器移到下拉 panel 的途中会短暂离开触发器热区,绝不能因此误关(需要 open/close 延迟 + 穿越宽限的 hover-intent);键盘用户要能 Tab 在触发器/链接间走、← → 横向 roving、↓/Enter/Space 打开 panel 并把焦点送进去、panel 内自然 Tab 遍历、Esc 关闭并回焦触发器。语义上必须区别于 menu:外层是 nav 地标、触发器是 button(aria-expanded/aria-controls)、panel 用 id 关联并回指触发器、链接是真链接而非 menuitem——因为这是导航不是命令。受控/非受控(value/onValueChange)。共享 Viewport(单浮层容器,尺寸/位置随 active panel 过渡)是 Radix 的标志性体验,要对齐。
:::
