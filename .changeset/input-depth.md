---
"@magic-scope/react": minor
---

Input 深度化:旗舰输入框接入 tone 系统 + 完整框内/框外能力

继 Button 之后第二个深度旗舰,对齐「生产可用、非最小版」标准:

- **框内 affix**:`prefix` / `suffix` 放图标或文字(货币符、单位、状态点)。
- **框外拼接**:`addonBefore` / `addonAfter` 连续控件段(如 `https://` … `.com`、协议选择器),自动合并圆角与边界、消除重复描边。
- **clearable**:有值时显示清除钮,一键清空并聚焦;受控(经原生 setter 派发 input 事件通知父级)/ 非受控皆可。
- **type=password**:自动加明文切换钮(👁 / 🙈),`aria-label` 随状态变化。
- **showCount**:配合 `maxLength` 显示 `当前/上限`,随输入实时更新。
- **tone 聚焦发光环**:读全库 tone 槽位(`--ms-c` / `--ms-c-glow`),`invalid` 自动切 danger;三档 `size` 随 `data-ms-density` 缩放(把密度管线接活)。
- DOM 重构为「容器框 `.ms-input` + 裸输入 `.ms-input__field`」:**React 组件 API 向后兼容**(`size`/`invalid` 用法零改动),仅静态 class 用法的内部结构有变。原 2 测试更新 + 共 9 个测试全过。
