---
"@magic-scope/react": minor
---

feat(react): 新增 5 个组件 —— Command / ScrollArea / Toolbar / CopyButton / Marquee

- **Command**(navigation):命令面板(⌘K)。filterItems(子串/模糊 + 命中高亮区间)/ groupAndFlatten / nextEnabledIndex 纯逻辑;复合 Command + Input/List/Group/Item/Empty/Separator + Command.Dialog(复用 Dialog 成 ⌘K 模态);键盘跳过禁用/组头、aria-activedescendant combobox/listbox。
- **ScrollArea**(layout):自定义滚动区。原生滚动 + 自绘 thumb(computeThumb/scrollPosFromThumb 纯逻辑),type auto/always/hover/scroll、可拖拽、ResizeObserver 测量、scrollbar role + aria-valuenow。
- **Toolbar**(actions):工具栏。role=toolbar + roving tabindex(←→/↑↓ 移焦),Button/Separator/Group/ToggleGroup/ToggleItem/Link;ToggleGroup single/multiple 受控。
- **CopyButton**(actions):复制按钮。clipboard 写入(execCommand 降级)+ 复制/已复制反馈态(typography.copy/copied)、aria-live 播报;复用 Button + Tooltip、render-prop。
- **Marquee**(data-display):无限跑马灯。children 克隆首尾相接 + CSS transform 无缝循环,四方向、speed/duration、pauseOnHover、gradient 两端淡出(mask)、reduced-motion 静止。

每组件纯算法进 logic.ts（可平移 core）+ logic/组件测试（共 +161 用例）。lint / tsc / build / size 全绿。
