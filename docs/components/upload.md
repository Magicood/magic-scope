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
| `fileList` | `UploadFile[]` | — | 受控文件列表。传入即受控,增删/状态推进只通过 onChange 反映,组件不持有内部副本。 |
| `defaultFileList` | `UploadFile[]` | — | 非受控初始列表。 |
| `multiple` | `boolean` | `false` | 允许多选。默认 false。 |
| `accept` | `string` | — | 原生 accept 串(逗号分隔扩展名 / MIME / 通配),同时用于客户端过滤。 |
| `maxCount` | `number` | — | 最大条数(含已有)。超出的新文件被拒。&lt;=0 / 未给视为不限。 |
| `disabled` | `boolean` | `false` | 禁用整个组件。 |
| `listType` | `"picture" \| "text"` | `text` | 列表形态:文本行 / 图片缩略(picture 用 url 显缩略图)。默认 text。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生触发区高亮 / 进度发光。默认 primary。 |
| `beforeUpload` | `((file: File, fileList: File[]) => boolean \| File \| Promise<boolean \| File>) \| undefined` | — | 添加前钩子:返回 false 阻止该文件入列;返回新的 File 则替换(如压缩 / 改名);<br>返回 Promise 同理(异步校验)。不实现网络,只做准入与改写。 |
| `customRequest` | `((option: UploadRequestOption) => void)` | — | 自定义上传实现(可插拔):组件把 file + 三个状态回调交给你,你用 XHR/fetch 真正传,<br>并在合适时机调用 onProgress / onSuccess / onError。&#42;&#42;组件本身不内置任何网络请求&#42;&#42;——<br>不提供 customRequest 时,文件停在 pending(仅做选择/校验/展示)。 |
| `triggerText` | `ReactNode` | — | 触发区主文案(覆盖 i18n upload.trigger)。 |
| `hint` | `ReactNode` | — | 触发区提示文案(覆盖 i18n upload.hint)。 |
| `children` | `ReactNode` | — | 触发区自定义内容(完全替换默认图标+文案);受控的拖拽/点击仍由根接管。 |
| `classNames` | `UploadClassNames` | — | 各部件细粒度 className 槽位。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(fileList: UploadFile[]) => void` | 列表变化回调(增删、状态/进度推进都会触发,入参为最新整表)。<br>· `fileList` — 变化后的最新文件整表(含各条最新 status / percent / url)。 |
| `onPreview` | `(file: UploadFile) => void` | 点击列表项预览图标 / 缩略图时回调(组件不内置 lightbox,交由用户)。<br>· `file` — 被点击预览的那条文件视图模型。 |
| `onRemove` | `(file: UploadFile) => void` | 删除某条时回调(在列表更新之前)。<br>· `file` — 即将被删除的那条文件视图模型(此时尚未从列表移除)。 |

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
