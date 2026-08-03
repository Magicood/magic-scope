---
"@magic-scope/react": patch
---

修复 Reveal 的 parallax / progress(trigger="scrub")变体恒 opacity:0 隐身:scrub 路径不写 data-ms-inview,而 CSS 初态选择器把所有变体都设为隐藏、keyframes 又不动 opacity,导致这两个滚动驱动变体在所有浏览器上永不可见。现已将 scrub 族排除出隐藏初态(它们本就不是进场特效,无隐藏态),并补 CSS 契约回归测试。
