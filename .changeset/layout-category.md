---
"@magic-scope/react": minor
---

新增 layout 布局分类:Stack / Flex / Grid / Container / Center / AspectRatio

补齐第二个结构性分类(layout),全部多态 + **响应式断点对象** + 间距 token 化 + RTL 逻辑属性:

- **Stack**:一维堆叠(direction/gap/align/justify/wrap 均响应式)+ `divider` 子项间插 + inline;as/asChild;logic.ts。
- **Flex**:通用 flexbox(direction/align/justify/wrap/gap 响应式,行列 gap 可分)+ **Flex.Item**(grow/shrink/basis/order);logic.ts。
- **Grid**:CSS Grid(`columns` number/模板/响应式 + `minChildWidth` 自适应列 auto-fit + gap/align/autoFlow,均响应式)+ **Grid.Item**(colSpan/rowSpan/start,响应式)+ 容器查询模式;logic.ts。
- **Container**:定宽居中(size 档对齐断点 + fluid + 响应式 padding clamp + 安全区避让 + centered 动态视口高);logic.ts。
- **Center**:居中盒(axis/inline/gap/padding/minBlockSize,响应式);logic.ts。
- **AspectRatio**:宽高比盒(CSS aspect-ratio + 旧引擎 padding-top 兜底 + 子媒体铺满/object-fit,ratio 响应式);logic.ts。

**响应式机制**:断点对象(`{ base, sm, md, lg, xl, 2xl }`)由 logic.ts 纯函数解析成带断点后缀的 CSS 变量,CSS 用静态 `@media`/`@container` 级联回退链消费(对齐 device.css 断点常量)——体现「按能力适配、不枚举机型」的多端语义。全部 forwardRef、`...rest` 透传、asChild、内容边界、strict TS;纯解析逻辑 logic.ts 零 React(可平移 core)。+83 测试,全量 **642 无回归**,registry **48 组件**,dts strict 通过。
