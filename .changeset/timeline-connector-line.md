---
"@magic-scope/react": minor
---

修复 Timeline 连线:短条目下整条轴不可见,alternate 模式节点错位、reverse 模式连线归属反了

同一族的连接件几何缺陷,真浏览器实测确认四处:

- **连线断在条目间距处,短条目时高度直接为 0。** 条目间距原本写在 `.ms-timeline__item`(li)的 `padding-block-end` 上,而连线所在的节点列作为 flex 子项只 stretch 到 li 的**内容盒**,穿不过 padding。只有 `title` + `time`(无正文)时,连线算出来是 0 高 —— 整条时间线一条线都看不见;有正文时也只画到内容盒底,每两个节点之间缺 24px。现把间距移到 `.ms-timeline__content` 的 `padding-block-end`,节点列被拉满整条。
- **`mode="alternate"` 在 ≥32rem 容器下中轴完全不可见,且圆点/图标被推到最右缘。** 绝对定位的节点列只锚了内联轴、块轴放任 auto → 高度塌成圆点高度(20px),连线算出 -2px 被钳成 0;同时 `justify-content: center` 已经把节点居中,却又叠了一层 `inset-inline-start: 50%`,净效果是节点贴右边。现补 `inset-block: 0` 撑满整条、删掉多余的位移;该装饰层现在盖住整条,一并加 `pointer-events: none`,不再吞掉正文的点击与拖选。
- **`mode="alternate"` 的内容列没被锁在中轴一侧。** 基础规则的 `flex-grow: 1` 把内容撑满整行,`inline-size: calc(50% - 1.5rem)` 形同虚设 —— 左右分居只是靠 `text-align` 装出来的,长正文会直接横过中轴(轴线画出来后会被文字压住)。现连 `flex` 一起改写,内容列实打实锁在一侧、离中轴 1.5rem。
- **`reverse` 的连线归属整体反了。** `column-reverse` 下 DOM 末项才是视觉首项,而画不画由 `:not(:last-child)` 决定 —— 视觉最顶那条没有线、视觉最底那条挂一条悬空线。现按 reverse 镜像成对;虚线与 pending 的相邻规则同步镜像,pending 节点补上连线元素(reverse 时它是视觉首项,连线归它自己画)。

连带改进:

- 连线改为节点列(竖向 flex)里的伸缩子项,不再用「绝对定位 + 魔法偏移量」。高度自适应节点尺寸(圆点 18px / 图标 24px 都不用改数,原先图标会被连线压进圆底 4px),也不会再出现负高度被钳成 0 的整段消失;线宽改用库内的 `--ms-hairline`(与 Steps 的连接线同档;注意 Anchor 的轨道线用了 `max(1px, …)` 兜底,库内三条竖轨在 2dppx 屏上粗细尚未拉齐)。
- 新增 `--ms-tl-gap` 定制口:改一个变量即可调整全线疏密。
- 连线 / 内容 / 虚线相关选择器改用子组合器,嵌套 Timeline(把一个 Timeline 放进 `TimelineItem` 的 children)时外层规则不再串味到内层。

行为变更提示:

- 条目间距不再由 `.ms-timeline__item` 的 `padding-block-end` 产生 —— 若你按旧结构覆写过该 padding,请改为直接设 `--ms-tl-gap`。
- 反过来,**若你覆写过 `.ms-timeline__content` 的 padding**(尤其是 `padding` 简写、或给 content 加卡片式 background / border),间距现在寄生在这一层:简写会把间距连带抹掉,卡片会把间距吃进自己的盒子里。改用 `--ms-tl-gap` 调间距,或在覆写里显式补回 `padding-block-end`。
- `.ms-timeline__item` 的边框盒高度**没有变**(间距只是从 li 的 padding 搬进了 content 的 padding),给条目加 background / border / 圆角、以及 interactive 的 hover 高亮块,视觉盒子与原来一致。
- 触屏下可交互条目的热区由「`--ms-target-min` + 24px 间距」变为「总高 ≥ `--ms-target-min`」,仍满足最小热区要求。
- `reverse` 与 `alternate` 的视觉输出会发生可见变化(补上原本缺失的线、去掉悬空线、节点回到中轴)。
