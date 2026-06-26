---
"@magic-scope/react": minor
---

组件补强 Wave 6(收官):Spinner / Skeleton / Table / Toast / AlertDialog —— 全 33 组件生产级

末批 + 命令式/数据组件补厚:

- **Spinner**:variant(ring/dots/bars)+ tone(currentColor 跟随)+ 可见 label(labelPlacement)+ 动效全局降级 + i18n。
- **Skeleton**:animation 四档(shimmer/pulse/wave/none)+ lines 多行 + width/height 便捷 + **内容感知 loading+children** + SkeletonText/SkeletonGroup + asChild + logic.ts。
- **Table**:i18n + tone + 魔法动效(行 stagger 进场 / 排序脉冲 / loading 遮罩模糊 / 选中行 inset glow)+ **可展开行**(expandable 受控)+ **列固定 fixed left/right** + size 三档 + summary/footer 汇总行 + 密度;留口 `...rest`/classNames/tableProps;事件 **`onRowClick`/`onRow`(事件工厂)/`onRowDoubleClick`/`onRowContextMenu`/`onExpandedChange`/`onSelect`/`onSelectAll`**(全经 composeEventHandlers 合并、选择/展开按钮 stopPropagation 防误触);useTableExpand 纯逻辑。
- **Toast**:变体读 tone 槽位 + i18n + ToastOptions(icon/closeIcon/classNames/**onDismiss/onAutoClose/onClick**)+ **`toast.promise`**(loading→success/danger 同 id 替换)+ Toaster max/duration/expand props。
- **AlertDialog**:命令式默认文案走 `translate` 单例(i18n)+ variant 扩成完整 tone + ConfirmOptions icon/confirmLoading + PromptOptions inputType/validate + 选项级 `onConfirm`/`onCancel`/`onValueChange`/`onEscapeKeyDown`/`onPointerDownOutside`。

i18n 字典补 `table.expandRow`/`collapseRow`/`expandColumn`。+42 测试,全量 **494 无回归**,dts strict 通过。

**至此 33 个现存组件 + 旗舰 Button/Input/Text 全部达生产级深度**:统一 tone 槽位、光影(`--ms-fx-glow`)/动效(`data-ms-motion`+`prefers-reduced-motion`)双降级、密度(`--ms-density-scale`)、i18n 字典、留口(插槽/asChild/render-prop/classNames)、事件齐全(`...rest` 透传 + composeEventHandlers 合并 + 领域回调)、内容边界。
