---
"@magic-scope/react": patch
---

修复 Divider / Tabs / Anchor 三处连接件几何缺陷,并清掉 Form 一段永不生效的死 CSS

2026-08-04 修 Timeline 连线时做过一次全库连接件普查,这次把剩余项逐个在真浏览器里复现后清掉。三个 bug 同源:**「线」或「指示器」的某一条轴依赖了父级,而父级不一定给得出**。

**Divider `orientation="vertical"` 在多数父级里一条线都画不出来。** `.ms-divider--vertical` 用 `block-size: 100%` 撑高。百分比块高要父级块高确定才解析得出,父级 auto 高时退化成 `auto` —— 而渲染的是 `<hr>`(void 元素,永远没有子内容),于是块高 0,0 高度的边框一个像素都不画。更坑的是 `100%` 是 definite cross size,会**压制 flex 的 stretch**,所以「父级写 `align-items: stretch`」也救不回来。真浏览器实测六种父级(普通块级流 / flex+stretch / flex+center / flex 定高 / inline-flex 工具条 / grid 行),修前只有「祖先带确定高度」的两种画得出线,其余四种高度全是 0。现改为 `block-size: auto` + `align-self: stretch` + `min-block-size` 地板,六种父级全部正常。

- 新增可覆写自定义属性 `--ms-divider-min-length`(默认 `1em`):竖线在「父级撑不出高度」时的地板长度,典型场景是行内文字之间的分隔。
- 行为变化:在 grid 等父级里,竖线高度从百分比的循环解析结果改为跟随实际行高(实测 90px → 22.5px,后者才是该行真实内容高)。

**Tabs `variant="pill"` 的指示条两轴恒偏 4px。** `--ms-tabs-ind-pos` 是 JS 量的 `offsetLeft` / `offsetTop`,基准是 tablist 的 **padding box**;而指示器在位移轴上没写 `inset`,元素停在**静态位置**,静态位置落在 tablist 的 **content box**。pill 变体的 tablist 有 `padding: var(--ms-space-1)`,于是这段 padding 被算了两次 —— 实测横排 `deltaX`、竖排 `deltaY` 恒为 `+4.00px`。四个变体一并补上显式 `inset`(underline 变体眼下 tablist 无 padding 才没显形,但经 `classNames.list` 加 padding 立刻同病)。

**Anchor 墨条基准脆弱,消费方一给根加内边距就整体错位。** `.ms-anchor__ink` 锚了内联轴却没锚块轴,而块轴正是它 translate 的那一轴。实测给根加 `padding-block-start: 20px` 墨条偏 +20px、加 `border-block-start: 6px` 偏 +6px。CSS 补 `inset-block-start: 0` 之外,JS 侧的 `linkRect.top - navRect.top` 也减掉了 `nav.clientTop`,把基准从 border box 换算到 padding box —— 只改 CSS 的话 border 那种仍会偏。

**Form 删掉 `.ms-form__list` / `.ms-form__list-item` 两条死规则。** `Form.List` 是纯 render-prop(`<>{children(api)}</>`),不产出任何 DOM,库里没有任何元素带得上这两个类,全仓 grep 零命中。不给它加容器 `div`,因为那会给所有消费方凭空多一层 DOM。

**新增两条全库 CSS 静态契约**(`css-contract.test.ts`,共 8 条):零宽细线盒必须有不依赖父级的块轴地板(百分比高、`align-self: stretch` 都不算数);绝对定位沿某轴 translate 位移时该轴必须显式锚 `inset`。两条都按「注入红线声称守护的那个回归」逐变体验证过会红(共 11 个变体:原样回退 / 假修复 / 改 `auto` / 置零 / 搬到兄弟规则 / 换等价写法),全库 94 个 CSS 零误报。
