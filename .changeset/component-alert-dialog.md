---
"@magic-scope/react": minor
---

新增 AlertDialog 命令式确认/提示弹窗(confirm + alert)

`confirm(message, options)` 返回 `Promise<boolean>`(确认/取消·Esc·遮罩)、`alert(message, options)` 返回 `Promise<void>`,配 `<AlertDialogHost />` 渲染容器(模块级队列 + `useSyncExternalStore`,无需 Provider)。基于原生 `<dialog>` + `showModal()` 白嫖焦点陷阱/Esc/top-layer,`role=alertdialog` + `aria-labelledby/describedby`,danger 变体确认按钮染危险色且默认焦点落在取消(防误触销毁性操作),锁背景滚动、进出场动画、安全区、窄屏动作纵向排布、尊重 `prefers-reduced-motion`。与已有的声明式通用模态 Dialog 互补。含 7 个功能测试 + 文档 / playground 演示。
