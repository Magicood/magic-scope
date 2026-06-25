---
"@magic-scope/react": minor
---

P1:浮层窄屏底部抽屉(bottom sheet)变体

Dialog / Select / Menu 在窄屏(≤sm 30rem)转为底部抽屉:贴底、满宽、仅上圆角、自底滑入,根治窄屏锚定浮层的出界、密集误点与定位错位。桌面 / 宽屏维持原居中卡片 / 锚定下拉,逐像素不变。Select / Menu 通过覆盖 CSS Anchor Positioning 实现,底部安全区(`--ms-safe-bottom`)已避让。
