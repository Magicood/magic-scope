---
"@magic-scope/react": patch
---

修复 Button 内容边界:超长文案不再撑破按钮/容器

`.ms-button` 原本 `white-space: nowrap` 却无宽度上限、label 也无溢出处理,粘入超长无空格字符串时会把按钮无限撑宽、漫出容器甚至破坏整页布局。现加 `max-inline-size: 100%` 封顶到容器宽,`.ms-button__content` / `.ms-button__label` 加 `min-inline-size: 0` 使其在 flex 中可收缩,label 单行 `text-overflow: ellipsis` 截断。任意对抗性内容都被收在组件边界内。
