---
"@magic-scope/react": patch
---

视觉调淡:发光与浮层投影更克制

- 全局发光默认强度 `--ms-fx-glow` 由 `1` 降到 `0.6`(此前偏重);新增 `data-ms-fx="full"` 恢复满强度、`data-ms-fx="subtle"`(0.3)更淡,与 `off` 一并构成四档。
- 7 个浮层组件(Dialog/AlertDialog/Menu/Select/Popover/Toast/Tooltip)的立体黑投影降不透明度(0.7→0.45、0.6→0.4),几何不变,质感更轻。

聚焦环不受影响(保可达性)。注:暗主题底色深浅属 `@magic-scope/tokens` 主题层,不在本次范围。
