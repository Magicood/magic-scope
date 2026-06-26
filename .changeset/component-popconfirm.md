---
"@magic-scope/react": minor
---

新增 Popconfirm 气泡确认组件

锚定在元素旁的轻量确认气泡(非全屏模态)。复用 Popover(原生 Popover API + CSS Anchor Positioning,点外 / Esc 关闭),内建确认 / 取消按钮流;支持 `title` / `description`、`confirmText` / `cancelText`、`danger` 变体(确认按钮染危险色)、`placement`。常用于列表内联删除确认;区别于全屏的 `confirm()` 与装任意内容的 Popover。含 4 个功能测试 + playground 演示。
