---
"@magic-scope/react": patch
---

线上展示站暴露的四个真实浏览器 bug 修复(jsdom 测不出的一批,已补 CSS 静态契约红线):

- **Tooltip / Popover / HoverCard 恒落 (0,0) 左上角**:position-area 写了语法外的裸 `span-inline` / `span-block`(整跨轴的合法关键字是 `span-all`),浏览器把整条声明作废、浮层失去锚定。JS 侧 placementToArea 与 CSS 兜底值一并修正。
- **Flex 桌面端(≥48rem)direction / gap / align / justify 全部失效**:响应式解析变量在 @media 块里自引用(`--_x: var(--src-md, var(--_x))`),循环依赖令变量 guaranteed-invalid。改为每断点完整「本档 → 逐级低档 → 基线」源变量回退链;顺带修复 sm 档丢失基线 rowGap / columnGap 的次生缺陷。
- **Tour 引导卡钉死在视口顶端**:定位 clamp 的 `100%` 在 inset 属性里解析为容器(视口)尺寸而非卡片尺寸,上限恒为负、clamp 退化到最小值。改为 JS 实测卡片尺寸注入 `--ms-tour-card-w/h` 供 CSS clamp 使用。
- **多个 Toaster 并存时每条 toast 重复弹出**:store 是广播,现约定「最后挂载的容器生效」,先挂载者静默让位、后者卸载自动接回;dev 下并存告警。

新增全库 CSS 静态契约测试:禁止裸 span-inline/span-block、禁止自定义属性同名自引用。
