---
"@magic-scope/react": minor
---

新增 NumberInput 数字步进输入组件

− / 原生 `input[type=number]`(spinbutton 语义、方向键步进) / ＋ 合为一个描边控件,隐藏原生 spinner。内部以「显示文本」管理,规避受控数字框打不出小数点 / 中间态的经典问题;步进与失焦时夹取到 `[min,max]`,到达边界自动禁用对应步进按钮。支持受控(`value`)与非受控(`defaultValue`)、`min/max/step`、`sm/md/lg`、清空回调 `null`;设备适配开箱即用(触控热区 `--ms-target-min` + 加宽步进按钮、`focus-within` 发光、hover 守卫、sm 字号 ≥16px 防 iOS 缩放、`prefers-reduced-motion`)。含 10 个功能测试 + 文档 / playground 演示。
