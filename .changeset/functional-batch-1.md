---
"@magic-scope/react": minor
---

新增 6 个功能组件:Segmented / Empty / Result / Rate / Descriptions / Steps

高频功能件,接 tone/光影/动效降级/密度/留口/事件:

- **Segmented**:分段控制器(options 数据驱动 + 滑块 indicator 平滑跨段 + 受控 value/onChange + 键盘导航 + tone + size + block);logic.ts。
- **Empty**:空状态(内置极简插画 SVG / 预设 / 自定义 / 关闭 + i18n 默认文案 + tone 着色 + size + asChild + 操作区槽);logic.ts。
- **Result**:结果页(7 态 success/error/info/warning/404/403/500,各派生默认图标+配色 + title/subtitle/extra 槽 + tone + asChild);logic.ts。
- **Rate**:评分(受控 + count + allowHalf 半星 + allowClear + 自定义 character + 键盘步进 + hover 预览 + readOnly/disabled + tone 金色 + tooltips + role=slider a11y);logic.ts。
- **Descriptions**:描述列表(items/Descriptions.Item 双入口 + 响应式 columns + span 跨列 + bordered + layout horizontal/vertical + tone + size);logic.ts。
- **Steps**:步骤条向导(items/Steps.Step + 受控 current + onChange 跳步 + status 派生 tone + direction + progressDot + size);logic.ts。

全部:forwardRef、`...rest` 透传、composeEventHandlers、classNames 部件映射、内容边界、动效双降级、strict TS、纯逻辑 logic.ts。i18n 字典补 `empty.description`。+63 测试,全量 **705 无回归**,registry **54 组件**,dts strict 通过。
