---
"@magic-scope/react": minor
---

P1 设备适配:浮层窄触屏底部抽屉(bottom sheet)形态

Dialog / Select / Menu 在窄触屏(`max-width: 30rem` 且 `pointer: coarse`)转为底部抽屉:贴底、满宽、仅上圆角、自底滑入(`@starting-style` 首帧过渡),根治窄屏锚定浮层的出界、密集误点与居中卡片的局促。

- **Dialog**:非 `full` 变体转 sheet,面板限高露出遮罩;`full` 变体照旧铺满。
- **Select / Menu**:覆盖 CSS Anchor Positioning 与降级定位为贴底 sheet,长列表限高内滚(`60svh` 封顶),底部安全区(`--ms-safe-bottom`)已避让;Menu 的 placement 方位间距在 sheet 形态归零。
- 触发条件带 `pointer: coarse`:桌面窄窗口(精确指针)与宽屏维持原居中卡片 / 锚定下拉,逐像素不变;`prefers-reduced-motion` / `data-ms-motion="off"` 下滑入退化为瞬时切换。
