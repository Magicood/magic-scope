---
"@magic-scope/react": minor
---

组件补强 Wave 4:Menu / Checkbox / Radio / Slider / NumberInput / Textarea(深度 + 事件 + 修 onBlur/aria 回归)

菜单 + 表单控件补厚,事件全量 compose:

- **Menu**:MenuItem 联合扩展(separator/group/icon/shortcut/checked 选中态/href 链接)+ 组合式 API(Menu.Item/Separator/Group/Trigger)+ renderItem + tone + placement/offset + typeahead;事件 `onOpenChange`(受控/非受控)/`onSelect`/项级 `onClick`/`onEscapeKeyDown`/`onPointerDownOutside`;trigger 全事件+ref compose;浮层 `...rest`;logic.ts 纯函数。
- **Checkbox**:tone + size + **CheckboxGroup**(多选组)+ description 槽 + 密度;`onCheckedChange` + onChange compose + 根 label `...rest` + inputProps 通道。
- **Radio**:tone(RadioGroup 下发)+ 密度 + **card 卡片变体** + RadioGroup options 数据驱动;`onValueChange(value, event)` + 根 label 事件透传 + onChange compose。
- **Slider**:tone + **marks 刻度** + **showTooltip 跟随气泡** + 密度;**`onChangeEnd`/`onValueCommit`**(松手落定值)+ `onDragStart`/`onDragEnd`。
- **NumberInput**:i18n 步进 aria + invalid/tone + prefix/suffix + 密度 + long-press 连续步进;`onStep`/`onPressEnter` + **修复 onBlur 被 ...props 覆盖夹取逻辑的 bug**(改 composeEventHandlers 合并)。
- **Textarea**:tone + showCount + **autosize** + 降级;`onPressEnter`。

附带修复:Checkbox 改 extends label 后 `aria-label` 同时落在 label 与 input 上导致可访问名重复(破坏 Table 全选查询)——已 destructure 剔除,只留 input。接 tone 槽位、发光/动效双降级。+72 测试,全量 403 无回归,dts strict 通过。向后兼容(Select/Radio onChange 等签名增强,原测试相应更新)。
