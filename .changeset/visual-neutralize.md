---
"@magic-scope/tokens": patch
---

主题视觉中性化(优雅简洁、轻线条方向):

- **arcane 默认主题底色去紫、中性化**:dark `#0A0710`→`#0A0A0B`(中性 zinc 深灰)、light `#FAF8FF`→`#FCFCFD`(中性近白),相邻 surface 档明度差收窄、不跳块。
- **边框统一为半透明 hairline**:arcane 与 `deriveTheme` 派生的 5 套配色族(frost/ember/verdant/solar/mono)的 `border`/`borderStrong` 全改为半透明白(dark)/半透明黑(light),取代偏亮的色调硬线。
- **品牌紫只保留在 primary / selection / focusRing / glow**;动画光影、过渡、状态色一律不动。
- **去中二命名**:`label` "深色奥术"→"深色"、"浅色奥术"→"浅色"、family "奥术"→"暮紫"。
- WCAG AA 全过(正文 fg-on-bg ≥ 4.5,次要 ≥ 3)。
