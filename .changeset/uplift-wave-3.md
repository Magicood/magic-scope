---
"@magic-scope/react": minor
---

组件补强 Wave 3:Select / Popconfirm / Tooltip / Pagination(复杂组件深度 + 事件齐全)

复杂浮层/数据组件补厚,事件契约做到生产级:

- **Select**:接 tone + i18n;**clearable / loading / 空态 / searchable(内联搜索过滤)/ multiple(多选 tag)**;renderOption/renderValue 槽 + option icon/description + classNames 部件定制;事件 `onOpenChange`(受控/非受控)/`onClose`(带关闭原因)/`onEscapeKeyDown`/`onPointerDownOutside`(可拦截)/`onHighlightChange`/`onSelect`/`onClear`/`onSearch`/`onFocus`/`onBlur`;`...rest` 透传 trigger;logic.ts 纯函数。
- **Popconfirm**:i18n 文案 + tone + icon 槽;**异步 `onConfirm`(返回 Promise → 按钮 loading、resolve 才关、reject 保持打开)**;受控 open/`onOpenChange`;`onEscapeKeyDown`/`onPointerDownOutside` 可拦截;confirmButtonProps/cancelButtonProps 透传;改用内部 Button 组件。
- **Tooltip**:placement 扩 12 向 + `arrow` 箭头 + offset + tone + disabled;受控 open/`onOpenChange`/defaultOpen;openDelay/closeDelay 拆分;trigger 全事件 compose;气泡 `...rest` 透传;logic.ts。
- **Pagination**:i18n + tone + size(随密度)+ simple 变体 + showTotal + 跳页输入 + 每页条数;`renderItem` 槽;事件 `onPageSizeChange`/`onChange(page,pageSize)`/`onQuickJump`/`onItemClick`;页码按钮 onClick 经 composeEventHandlers 合并用户的;logic.ts。

接 tone 槽位、发光受 `--ms-fx-glow`、动效 `prefers-reduced-motion`+`data-ms-motion` 双降级。+36 测试,全量 331 无回归,dts strict 通过。向后兼容(Select onChange 改 `(value, option)` 双参,原测试相应更新)。
