# ConfigProvider <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

全局配置上下文:一处统一设置全库设计开关(密度 / 动效 / 发光 / 色调),经 data-ms-&#42; 沿 CSS 级联下发。

> **[在展示站中打开 ConfigProvider](https://magicood.github.io/magic-scope/#/config-provider)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

基础设施组件,本身无视觉形态。把分散的设计开关收到一处:density(密度档)/ motion(动效总闸)/ fx(装饰发光总闸)/ tone(默认色调),架构为 CSS-first——经根元素的 data-ms-&#42; 属性沿 CSS 级联下发,后代组件读祖先属性即生效,不靠 JS prop 逐层钻透;同一套 data 属性可平移 vue / web component。

可嵌套就近覆盖,可只设部分开关(未设的继承祖先 / 用根基线);额外 createContext + useConfig() 暴露 density/size/tone 默认值供少数需 JS 默认值的组件兜底。messages 经内部 MessagesProvider 合并下发文案、locale 写到根 lang;留口 as 多态根 / asChild Slot 把开关挂到已有节点,forwardRef 与原生属性透传,透明包裹不破坏文档语义。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `density` | `"compact" \| "comfortable" \| "spacious"` | — | 密度档 → data-ms-density,沿级联缩放控件高度与间距。同时进 context 供 JS 读默认。 |
| `motion` | `"off" \| "on" \| "full" \| "subtle" \| "reduced"` | — | 动效总闸 → data-ms-motion(on=full / subtle / reduced=subtle / off)。off 时全库动效停。 |
| `fx` | `"off" \| "on" \| "full" \| "subtle"` | — | 装饰发光总闸 → data-ms-fx(on=full / subtle / off)。off 时装饰发光消失(聚焦环不受影响)。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 默认语义色调。落 data-ms-tone(供 CSS 选择器)并进 context 供组件 tone 缺省兜底。<br>注意:不渲染 ms-tone-{tone} 类(那是实例级 tone 槽位激活,应由各组件按自身 tone 决定)。 |
| `size` | `"sm" \| "md" \| "lg"` | — | 默认控件尺寸档,纯经 context 下发(无对应 CSS data 属性),供组件 size 缺省兜底。 |
| `messages` | `PartialMessages` | — | 文案覆盖。给出时内部用 i18n 的 MessagesProvider 包裹 children 下发(可与父级文案合并)。<br>不传则不额外套 Provider(透传父级文案)。 |
| `locale` | `string` | — | 语言标记,写到根元素 lang(便于 hyphens / 字体回退 / 读屏语种)。不做内置文案切换。 |
| `as` | `ElementType` | — | 多态根标签(默认 div)。语义场景可换 section / main 等。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并把 data-ms-&#42; 与 props 合并上去(Slot 模式)。<br>用于「不想多包一层 div、直接把全局开关挂到已有根节点(如布局容器 / &lt;html&gt; 镜像)」的场景。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `config` `provider` `context` `global` `theme` `density` `motion` `fx` `tone` `locale` `i18n` `css-cascade` `data-attribute` `as-child` `polymorphic` `utility` |

::: details 需求原文 / 设计意图
需要一个全库级的配置入口:把分散的设计开关(密度、动效强度、装饰发光、默认色调、默认尺寸、文案/语种)收到一处统一设置,避免每个组件各传一遍。架构定为 CSS-first——视觉开关经 data-ms-density/data-ms-motion/data-ms-fx/data-ms-tone 属性沿 CSS 级联下发,组件读祖先属性即可生效(消费 device.css/effects.css 已定义的 token),不再靠 JS prop 逐层钻透;这与项目「多框架对等、适配契约框架无关」的硬性约定一致(同一套 data 属性可平移到 vue/web component)。需支持嵌套就近覆盖与只设部分开关。少数组件需在渲染逻辑里读默认值(如 size 缺省兜底全局默认),故额外 createContext + useConfig() 暴露 density/size/tone——诚实定位:这是 JS 默认值通道,不是视觉开关的下发通道,绝大多数视觉开关靠 CSS data 属性。messages 经内部 MessagesProvider 合并下发(import 复用,不改共享 i18n)。留口:as 多态 / asChild Slot(把开关直接挂到布局根/html 镜像,免多包一层 div)、forwardRef、原生属性透传、className/style 合并;a11y 上默认透明包裹(div + display:contents)不引入额外盒子、不强加 role。把可抽取的「props→data 属性」纯映射放 logic.ts 便于平移其它框架。
:::
