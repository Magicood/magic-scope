---
"@magic-scope/react": patch
---

Tree 修复 `showLine` 完全失效,并改为「每层一条」的层级引导线

`showLine` 此前是个 100% 无效的公开 prop —— 一条引导线都画不出来。真浏览器实测 `.ms-tree__indent` 尺寸是 `22x0` / `44x0`,**高度全是 0**。根因两层叠加:

1. 引导线画在 `.ms-tree__indent` 的 `border-inline-start` 上,但这是个空元素、只声明了 `inline-size`;父级 `.ms-tree__node` 是 `align-items: center`,flex 子项默认不拉伸,空盒块高因此为 0 —— 0 高度的边框一个像素都不绘制。
2. 就算撑起高度,单条 border 也只有一条边,画不出「每个祖先层级一条」,深层节点拿不到自己父级那条导轨;而且该规则对 `level=0` 同样生效,根节点行会冒出一条本不该有的竖线。

现在改为 `align-self: stretch` 撑起块轴 + 平铺背景渐变绘制导轨:平铺周期 = 一级缩进,相位 = 行内 flex gap + 箭头半宽,于是每条导轨正好落在对应祖先展开箭头的中心;缩进盒宽 = `level × 缩进`,根节点宽 0 天然被裁成不画,不必再写 `level=0` 排除规则。相位额外夹了 `min(…, 缩进 − 线宽)`,保证「每层恰好一条」在任意缩进与密度下都成立(缩进窄到装不下相位时,导轨退化为贴紧该层左沿)。

行为变化,升级请注意:

- 引导线由**虚线改为实线**(此前从未渲染出任何像素,所以没有实际视觉回归)。
- 去掉了 `margin-inline-start`,**开关 `showLine` 不再把整棵树推 12px**(11px margin + 1px 边框),布局不再抖动。
- 新增可覆写自定义属性:`--ms-tree-line`(导轨颜色)、`--ms-tree-toggle`(箭头边长)、`--ms-tree-gap`(行内间距)。后两者同时被箭头与行内 gap 消费,导轨对齐与真实几何共用同一真相源,改一处不会错位。

RTL:平铺背景与长度型 `background-position` 都是物理轴(不像原来的 `border-inline-start` 自带方向感知),故补了一条 `:dir(rtl)` 规则从右边缘起算、渐变同时反向;不补的话每条会偏 `|2×相位 − 缩进|`(默认 md 即 6px)。

**兼容性备注(透明写明,勿藏)**:这是本库**首次**使用 `:dir()` 选择器 —— 此前的 RTL 写法只用 `direction` 属性。`:dir()` 的基线是 **Chrome 120+ / Edge 120+ / Safari 16.4+ / Firefox 49+**,符合本项目的 evergreen 策略;低于该基线的浏览器只是 RTL 下导轨相位不翻(每条偏 `|2×相位 − 缩进|`,默认 md 即 6px),LTR 与其余功能不受影响,属可接受的优雅降级。需要覆盖更老浏览器的使用方,可自行加一条 `[dir="rtl"] .ms-tree--line .ms-tree__indent { … }` 兜底。

同时新增全库 CSS 静态契约的**第 6 条**红线(`css-contract.test.ts`):**靠内联轴边框画竖线的盒子必须有块轴高度**。它跨规则合并同一目标元素的声明后判定 —— 逐条规则看永远看不出这个 bug(`.ms-tree__indent` 只写宽、`.ms-tree--line .ms-tree__indent` 只写边框,单看都合法)。判据与其余红线一致,走真实 CSS 解析(`./testing/cssRules` 的 `parseCssRules` / `targetCompound`),不用正则切块。实测全库 100 个 CSS 命中 0 条;把修复前的 `Tree.css` 放回去则精确报出 `components/Tree/Tree.css:59 .ms-tree__indent`,而不做跨规则合并的朴素版一条都抓不到。

验收:Playwright 真浏览器 + 逐像素解码截图,确认导轨落在 `x=14` / `x=36`(正是 level0 / level1 展开箭头中心)、根节点行只有箭头字形无导轨、导轨整行等高且跨行连续;RTL 下同样逐像素确认落在 `x=385.5 / 363.5 / 341.5`,与镜像后的箭头中心逐条对齐。并参数化扫过 md/sm/lg、密度 0.5/0.8/1.25、缩进 0.5rem/3rem、根字号 20px,每层条数与对齐均正确。
