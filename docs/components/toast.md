# Toast <Badge type="tip" text="stable" /> <Badge type="info" text="v0.0.0" />

命令式轻提示,无需 Provider,任意处调用 toast() 即可弹出。

> **[在展示站中打开 Toast](https://magicood.github.io/magic-scope/#/toast)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

基于模块级 store + useSyncExternalStore:toast() 可在组件内外任意处调用,无需 Context。

Toaster 容器已在应用根全局挂载(portal 到 body,固定定位 + 安全区避让)。

支持五种语义变体、次级描述、行动按钮、自动消失(悬停 / 聚焦暂停计时)、常驻、同 id 替换更新,并解耦播报给屏幕阅读器(polite / assertive live region)。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/toast.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | — | 指定 id(重复 id 会替换并重置寿命,用于更新进行中的提示如「上传中→完成」)。默认自动生成。 |
| `variant` | `ToastVariant` | — | 语义变体。默认 default。 |
| `duration` | `number` | — | 自动消失时长(ms)。0 或 Infinity 表示常驻(需手动关闭)。默认 4000。 |
| `description` | `ReactNode` | — | 次级描述文字。 |
| `action` | `{ label: ReactNode; onClick: () => void }` | — | 行动按钮:点击后执行并关闭。 |
| `icon` | `ReactNode \| false` | — | 图标:不传按 variant 给默认图标(loading 显示旋转图标);传 ReactNode 覆盖;传 false 完全关闭图标列。 |
| `closeIcon` | `ReactNode` | — | 自定义关闭按钮内容(默认 ×)。 |
| `classNames` | `ToastClassNames` | — | 各部件细粒度 className。 |
| `position` | `"top-end" \| "top-start" \| "bottom-end" \| "bottom-start" \| "top-center" \| "bottom-center"` | `bottom-end` | 弹出位置。默认 bottom-end。 |
| `label` | `string` | — | 可访问的区域标签。默认走 i18n toaster.region(「通知」)。 |
| `max` | `number` | — | 同屏最多保留的活跃 toast 数,超出让最旧的退场。默认 5。 |
| `gap` | `string` | — | toast 之间的间距(CSS 长度,如 "0.75rem")。默认走 token --ms-space-3。 |
| `expand` | `boolean` | `true` | 是否展开堆叠(预留:为未来折叠态留口,当前恒展开)。默认 true。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onDismiss` | `(id: string, reason: ToastDismissReason) => void` | 任意关闭时触发(手动 / 自动 / action / 替换)。<br>· `id` — 被关闭的 toast id<br>· `reason` — 关闭来源:manual 手动 / auto 到期 / action 点行动钮 / replace 被同 id 顶替 |
| `onAutoClose` | `(id: string) => void` | 仅自动到期消失时触发(区分手动关闭)。<br>· `id` — 自动到期关闭的 toast id |
| `onClick` | `(id: string) => void` | 点击 toast 主体(非 action / 关闭钮)时触发,用于跳转 / 查看详情。<br>· `id` — 被点击的 toast id |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `toast` `notification` `toaster` `snackbar` `feedback` `aria-live` `promise` `tone` `i18n` |

::: details 需求原文 / 设计意图
补齐反馈体系:命令式通知。原创实现,对标 sonner/react-hot-toast 的架构但自研、不 wrap 第三方——模块级 store(useSyncExternalStore 订阅)让 toast() 脱离 React 树调用,&lt;Toaster /&gt; portal 渲染。涵盖自动消失 + 悬停/聚焦暂停、退场动画、aria-live(status/alert 分流)、行动按钮、6 向定位 + 安全区。延续设备适配契约(触控热区、hover 守卫、focus-visible、reduced-motion)。
:::
