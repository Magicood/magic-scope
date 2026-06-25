---
"@magic-scope/react": minor
---

新增 Slider 滑块组件

基于原生 `input[type=range]` 的数值滑块,遵循「原生优先」:白嫖可访问的 slider 语义(`role=slider` + `aria-valuenow/min/max`、方向键 / Home / End),`appearance:none` + `::-webkit-slider-*` / `::-moz-range-*` 自绘轨道 / 填充 / 发光滑块(填充用 WebKit 渐变 + Firefox 原生 progress)。支持受控与非受控、`min/max/step`、`sm/md/lg` 三档、可选数值显示(`showValue` / `formatValue`);设备适配开箱即用(触控放大滑块 + `--ms-target-min` 行高、hover 守卫、`focus-visible` 发光环、`prefers-reduced-motion`)。含 7 个功能测试 + 文档 / playground 演示。
