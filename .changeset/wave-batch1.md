---
"@magic-scope/react": minor
---

feat(react): 新增 5 个组件 —— Statistic / PinInput / Anchor / Watermark / BackTop

- **Statistic**(data-display):数值统计展示。千分位 + precision 格式化(纯 logic)、prefix/suffix、trend 升降染色、loading 骨架、animateOnMount 入场滚动(尊重 reduced-motion)、role=img + 完整 aria-label。
- **PinInput**(forms):OTP/验证码分段输入。自动跳格、Backspace 回退、粘贴整串分填、←→/Home/End 导航、numeric/alphanumeric 过滤(纯 logic)、mask 密码点、invalid 染 danger、受控/非受控。
- **Anchor**(navigation):滚动锚点 scroll-spy。rAF 节流算 active(纯 logic resolveActiveLink)、墨条指示、平滑滚动(reduced-motion 瞬时)、嵌套锚点、active 链接 aria-current、受控/非受控。
- **Watermark**(layout):水印覆盖层。离屏 canvas(devicePixelRatio 清晰)绘制单元平铺、pointer-events:none 不挡交互、getContext null 降级安全、aria-hidden。
- **BackTop**(navigation):回到顶部浮钮。滚动超阈值淡入、rAF 缓动归顶(纯 logic 缓动)、reduced-motion 瞬时、隐藏态 aria-hidden + 不可聚焦。

每个组件纯算法进 logic.ts(可平移 core),配 logic 测试 + 组件测试(共 +120 用例)。lint / tsc / build / size 全绿。
