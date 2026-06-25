---
"@magic-scope/react": minor
---

新增 Toast 命令式通知(toast + Toaster)

模块级 store + `toast()` 函数(可在组件外任意处调用,无需 Provider)+ `<Toaster />` 渲染容器(`useSyncExternalStore` 订阅、portal 到 body、6 向定位、安全区避让)。变体 `default/success/warning/danger/info`(快捷方法 `toast.success/error/warning/info`),自动消失 + 悬停/聚焦暂停、可手动关闭(`toast.dismiss(id)`)、可带描述与行动按钮;`danger/warning` 用 `role=alert`、其余 `role=status`;进出场动画(`@starting-style` + 退场标记)、尊重 `prefers-reduced-motion`、触控热区达标。对标 sonner 架构但自研、不 wrap 第三方。含 9 个功能测试 + 文档 / playground 演示。
