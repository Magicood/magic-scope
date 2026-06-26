---
"@magic-scope/react": patch
---

docs(react): 事件回调 prop 全量补 `@param` JSDoc

为全库组件的**自有事件回调**(onChange / onSelect / onCheck / onValueChange / onOpenChange / customRequest 等)逐个补 `@param <name> <说明>`,文档化每个回调参数的语义。配合展示站的 `extract-props.ts` 扩展,事件卡可逐参数渲染「name: type — 说明」。消费方在 IDE 悬停 / .d.ts 也能看到每个参数说明。

覆盖 ~34 个组件(Form/DatePicker/Tree/Select/Table/Tabs/Menu/ContextMenu/Pagination/Popover/Dialog/Drawer/AlertDialog/Slider/NumberInput/Cascader/ColorPicker/Upload/Splitter/Affix … 含命令式 *Options 接口里的回调)。纯 JSDoc 注释,不改任何类型/逻辑/签名。
