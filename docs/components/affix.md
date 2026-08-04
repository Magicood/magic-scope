# Affix <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

滚动吸附容器:滚到阈值时吸顶 / 吸底固定,等尺寸占位防跳动。

> **[在展示站中打开 Affix](https://magicood.github.io/magic-scope/#/affix)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖。把「该不该吸、吸成什么样」抽成框架无关的纯函数 computeAffix(给几何 + 偏移即出 affixed / mode / style),DOM 读 rect 的副作用、rAF 节流与状态留在薄壳,便于单测与平移 vue / core。

监听 getTarget(默认 window)的滚动 / resize:超过 offsetTop 吸顶、超过 offsetBottom 吸底(两者都给以 offsetTop 优先),脱流时渲染等尺寸 placeholder 杜绝布局抖动,跨态经 onChange(affixed) 通知。宽度跟随用 ResizeObserver(特性检测,缺失降级);classNames 暴露 root / content 槽位,ref 经 useImperativeHandle 暴露 measure() 供布局变化后主动重测。吸附是布局而非动效,不受 motion=off 影响。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `affix` `sticky` `scroll` `navigation` `pin` `fixed` |

::: details 需求原文 / 设计意图
把「吸附与否、吸成什么样」做成框架无关的纯函数 computeAffix(给几何 + 偏移即出 affixed/mode/style),DOM 读 rect 的副作用留在薄壳,便于单测与平移 vue/core。壳层监听 getTarget(默认 window)滚动/resize、rAF 节流,超 offsetTop 吸顶或超 offsetBottom 吸底,渲染等尺寸 placeholder 杜绝布局抖动,onChange(affixed) 通知跨态。坚持透明包裹不破坏内部语义;宽度跟随用 ResizeObserver(特性检测)且把降级行为如实备注。
:::
