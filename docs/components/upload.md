# Upload <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

文件上传:虚线拖拽区 + 点击触发,把「上传编排」与「真实传输」彻底解耦。

> **[在展示站中打开 Upload](https://magicood.github.io/magic-scope/#/upload)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,只负责「选文件 → 客户端准入(accept / maxCount / beforeUpload)→ 维护每条 status / percent / list 的 UI 编排」,组件本身不内置任何 XHR/fetch —— 真正的网络传输由用户的 customRequest 提供,通过注入的 onProgress / onSuccess / onError 把进度与结果回灌。

两条入口并存:拖拽区(dragover 高亮 / dragleave 还原 / drop 收文件)+ 点击触发隐藏 input&#91;type=file];受控(fileList + onChange)/ 非受控(defaultFileList)双模式;每条文件含名 / 体积 / 进度条 / 状态图标 / 删除 / 失败重试 / 预览,listType 文本行或图片缩略。tone 经全库 resolver 驱动触发区高亮与进度发光,a11y 上触发区 role=button + 键盘 Enter/Space 可达。

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
| 标签 | `upload` `file` `drag-and-drop` `dropzone` `progress` `form` `controlled` `customRequest` |

::: details 需求原文 / 设计意图
需要一个把「上传编排」与「真实网络传输」彻底解耦的上传组件:组件只负责选文件、客户端准入(accept/maxCount/beforeUpload)、以及维护每条文件 status/percent/list 的 UI 编排,绝不内置 XHR/fetch;真正的传输由用户的 customRequest 提供并通过 onProgress/onSuccess/onError 回灌。可抽取的纯算法(File 规范化 wrapFile、accept 匹配 isAccepted、体积格式化 formatFileSize、状态机 nextStatus、maxCount 截断、列表增删 patch)下沉到零 React 的 logic.ts 以便平移多框架;交互上要同时满足拖拽(dragover 高亮/dragleave 还原/drop)与点击两条入口,a11y 上触发区用 role=button + 键盘可达、每条操作按钮带 aria-label。
:::
