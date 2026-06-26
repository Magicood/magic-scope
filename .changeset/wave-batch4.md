---
"@magic-scope/react": minor
---

feat(react): 新增 5 个组件 —— Tour / AutoComplete / Image / Mark / VisuallyHidden

- **Tour**(feedback):引导漫游。spotlight 镂空高亮(box-shadow spread 挖洞,目标可点透)+ 引导卡(上一步/下一步/跳过/完成 + 步数 i18n)、惰性目标 rAF 跟随、Esc/←→ 键盘、焦点管理、受控 open/current、命令式 TourHandle(goTo/next/prev/close)。
- **AutoComplete**(forms):自动完成。自由文本输入 + 建议补全(filterOptions 纯逻辑)、filterOption 关内置过滤接远程、onSearch/onSelect、allowClear、invalid 供 Form、combobox a11y、键盘选择;值即输入串。
- **Image**(data-display):图片。懒加载、skeleton 占位、fallback 链兜底、错误态 i18n;点击灯箱预览(缩放/旋转/还原工具栏 + 键盘 +/-/r/Esc、锁滚动 + 焦点管理)、object-fit、rounded;预览变换状态机纯逻辑。
- **Mark**(typography):文本高亮。splitByMatches 纯逻辑(多词/重叠区间合并、正则元字符转义、保留原文大小写)、命中包 `<mark>` + tone 软底高亮、多态 as。
- **VisuallyHidden**(utility):无障碍隐藏。标准 sr-only(clip 而非 display:none,保留无障碍树)、focusable 变体(skip-link 模式聚焦还原)、多态 as / asChild。

含 logic 的纯算法可平移 core;共 +150 测试。lint / tsc / build / size 全绿。
