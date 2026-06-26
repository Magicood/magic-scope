---
"@magic-scope/react": minor
---

新增 typography 文字排版分类 + Text 旗舰核心

文字排版作为独立结构性分类(`category: "typography"`,与 layout 并列)启动,Text 为旗舰核心:

- **Text 多态文字原语**:`as`(多态标签)+ `asChild`(Slot 合并到子),把可控文字属性收成 props——字族(sans/serif/mono/display)、流式字号档、字重(语义档 + 数值可变字体)、斜体、tone 着色、对齐、行高、字距、transform、下划线/删除线、单行 `truncate`(头/尾)+ 多行 `lineClamp`、折行 `wrap`(balance/pretty)、`whitespace`、`breakWord`、`hyphens`、`dir`、数字变体(`numeric` tabular 等宽)、`smallCaps`、`selectable`、`writingMode`(竖排),以及**魔法文字**:`gradient`(tone 渐变 / aurora 流光)、`glow`(辉光)、`stroke`(描边),与**魔法动效** `animate`:`reveal`/`blur-in`(入场)+ `shimmer`/`pulse`/`flow`(持续)——全复用 tone/fx/动效档,受 `data-ms-motion` 与 `prefers-reduced-motion` 调制、一键降级且入场态降级后直接呈现不卡隐藏。
- **留口充分**:`...rest` 透传所有原生属性与事件;`className`/`style` 与计算值合并(用户优先);`forwardRef` 到渲染元素;冷门属性走 `style`/`className` 逃生舱。
- **透明备注**:`text-wrap`/`-webkit-line-clamp`/`background-clip:text`/`hyphens`/`-webkit-text-stroke` 等兼容性逐条标在 prop TSDoc,渐变文字 `@supports` 回退实色不裸奔。
- **共享尺度 `typography.css`**:`--ms-type-step-*`(流式 clamp 字阶)/`--ms-leading-*`(补 snug=1.4)/`--ms-tracking-*`(新增字距轴)/`--ms-font-serif`(系统 serif 栈),挂 `ms.tokens` 层,组件内兜底——待架构线接入正式 type scale 后改引用即可,组件不破。
- `::selection` 接通契约现成的 selection/onSelection 角色。9 个测试,全量 187 无回归,dts strict 通过。

设计经穷尽属性目录(85 项)+ 主流库调研 + 完整性对抗校验。Kbd/Label 维持现 category 不折叠。
