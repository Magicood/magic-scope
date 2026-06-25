---
"@magic-scope/react": patch
---

P1:装饰性 :hover 包 @media (hover: hover),消触屏 sticky-hover

全库 20 个组件的装饰性 `:hover` 规则统一包进 `@media (hover: hover)`,触屏(`hover: none`)不再触发「点完保持 hover 态」的 sticky-hover;桌面具备 hover 能力,逐像素不变。Menu 项的 `:hover` 与 `:focus-visible` 拆分,确保键盘聚焦高亮在触屏仍可达。
