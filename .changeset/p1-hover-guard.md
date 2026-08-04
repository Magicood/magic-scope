---
"@magic-scope/react": patch
---

P1 设备适配:装饰性 :hover 全量包进 @media (hover: hover),消触屏 sticky-hover

- 全库排查 65 个含 `:hover` 的组件 CSS,把所有**装饰性** hover 规则(约 75 条,涉及 40+ 组件)统一包进 `@media (hover: hover)` 守卫:触屏(`hover: none`)不再出现「点完保持 hover 态」的粘滞高亮;桌面具备 hover 能力,逐像素不变。
- `:hover` 与 `:focus-visible` / `:focus-within` / `--active` 合写的规则(Menu / Dropdown / Menubar / NavigationMenu / Cascader / Toolbar / Button 组 / Heading 等)一律**拆分**:hover 进守卫,焦点 / 程序高亮留守卫外,键盘与触屏可达性不丢。
- 功能性 hover 有意不守卫:Marquee 悬停暂停(触屏 tap 粘滞暂停是可接受替代交互,已注释);Heading 锚点与 Code 复制钮的悬停浮现由既有 `@media (hover: none)` 常驻可见规则兜底。
- `[data-ms-fx="off"]` / `[data-ms-motion="off"]` / `prefers-reduced-motion` 的中和规则保持原位(基础规则被守卫后触屏自然 no-op)。
