---
"@magic-scope/react": minor
---

组件补强 Wave 2:Dialog / Drawer / Popover / Tabs / Accordion / Breadcrumb(深度 + 光影动效 + 事件齐全)

浮层/导航类补厚,并把**事件覆盖**做透(原生 `...rest` 透传、内部处理器一律 `composeEventHandlers` 合并用户的、补齐语义回调):

- **Dialog**:复合子组件 Dialog.Header/Title/Description/Body/Footer(自动 aria-labelledby/describedby)+ size(sm/md/lg/full)+ placement + tone + classNames/panelProps/asChild;事件 `onOpenChange`/`onEscapeKeyDown`/`onPointerDownOutside`(可 preventDefault 拦截关闭)。
- **Drawer**:size 档 + Drawer.Footer 固定底栏 + header 整块槽 + tone;同套浮层事件 + 点遮罩 pointerdown+click 双判定防误关。
- **Popover**:placement 扩 12 向 + `arrow` 箭头 + `triggerAction`(click/hover/focus/manual)+ openDelay/closeDelay + tone;trigger 全事件 compose + ref 合并;`onEscapeKeyDown`/`onPointerDownOutside`;浮层 `...rest` 透传;logic.ts 纯函数。
- **Tabs**:tone + orientation(horizontal/vertical)+ size(随密度)+ 单滑块 indicator 平滑位移 + keepMounted + classNames;`onTabClick`/`onKeyDown`/`onClose`(可关闭标签)+ 根 `...rest`。
- **Accordion**:受控 value/`onValueChange`(single/multiple)+ collapsible + tone + 修 grid 过渡可达性;`onItemToggle`/根 `...rest`。
- **Breadcrumb**:i18n nav 文案 + `renderItem` render-prop(路由库集成)+ `onItemClick`(SPA 拦截)+ 折叠省略 + tone + 根 `...rest`。

接全库 tone 槽位、发光受 `--ms-fx-glow`、动效受 `prefers-reduced-motion`+`data-ms-motion` 降级。+47 测试(含事件 compose 验证),全量 295 无回归,dts strict 通过。向后兼容。
