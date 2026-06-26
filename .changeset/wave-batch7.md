---
"@magic-scope/react": minor
---

feat(react): 新增 5 个组件 —— Editable / TagInput / Dropdown / Collapsible / Toggle(90 组件)

- **Editable**(forms):行内编辑。点击/聚焦展示态切换成输入态,Enter / 失焦提交、Esc 取消;受控值 + 受控编辑态双通道,multiline 走 textarea,selectAllOnFocus / submitOnBlur / submitOnEnter 可调,renderPreview / renderEdit 留口(下放 ref + invalid)。commitValue / shouldSubmit 纯逻辑进 logic.ts。
- **TagInput**(forms):标签/令牌输入。回车 / 单字符或多字符分隔符成 tag、空输入 Backspace 删尾、← 进标签键盘导航、粘贴多 tag 切分;maxTags / allowDuplicates / validate / addOnBlur / editable,renderTag 留口(下放 ref + 注入 key)。normalizeTag / splitByDelimiters / canAdd 纯逻辑。IME 组合态 Enter 不误提交(复用 Textarea 范式)。
- **Dropdown**(navigation):下拉菜单。trigger + 自持 popover(CSS Anchor 定位)+ 复用 Menu 纯逻辑(flatten / typeahead / roving),items 数据驱动或 children 复合;checkbox/radio 项连续切换保持打开,click/hover 触发,submenu 一层,Tab 关闭交还 trigger 焦点。
- **Collapsible**(data-display):单项折叠原语(区别于 Accordion 的互斥分组)。Root + Trigger + Content,**常驻挂载 + inert 切换**(对齐 Accordion):收起不销毁子树(state / 输入 / 滚动 / 焦点保活)、展开收起两向动画都播,reduced-motion / [data-ms-motion=off] 降级。`forceMount` 因常驻挂载已成 no-op,标 `@deprecated` 保留以不破坏 API。
- **Toggle**(actions):双态切换按钮。单 pressed / unpressed 按钮(区别于 Switch / Segmented),aria-pressed 语义,复用 Button 的 variant × tone × size × shape,工具栏图标按钮场景;受控 / 非受控双通道。

每组件经对抗性评审 + 复现验证,确认并修复 16 个真实 bug(Editable 4 / TagInput 5 / Dropdown 4 / Collapsible 3,均补回归测试):含受控编辑虚假 onChange(HIGH)、IME 选词 Enter 误提交(HIGH)、收起销毁子树 / 动画不播(HIGH)等。lint / tsc / build / size / registry(90 校验通过)/ 全量测试 1892 全绿。
