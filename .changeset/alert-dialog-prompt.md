---
"@magic-scope/react": minor
---

AlertDialog 新增 prompt():命令式输入弹窗

`prompt(message, options)` 返回 `Promise<string | null>`(确认返回输入值 / 取消·Esc·遮罩返回 null),与 confirm/alert 共用同一 `<AlertDialogHost />` 队列与原生 `<dialog>`。内建输入框(复用 `ms-input`)、打开即聚焦并全选、Enter 提交;支持 `placeholder` / `defaultValue` / `title` / `confirmText` / `cancelText`。补齐 confirm / alert / prompt 三件套。
