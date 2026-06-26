---
"@magic-scope/react": minor
---

feat(react): 新增 4 个组件 —— Menubar / NavigationMenu / HoverCard / Calendar(94 组件)

- **Menubar**(navigation):应用菜单栏。横向顶级菜单触发器(文件/编辑/视图),复用 Menu 逻辑;完整 ARIA APG menubar 键盘(顶层 ←→ roving、↓/Enter 开、菜单内 ↑↓/Home/End/typeahead/Esc、子菜单 → 展开并落焦首项 + 独立 ↑↓/Enter/←/Esc 焦点环);受控 value=打开的菜单 id;disabled 顶级菜单 roving 正确跳过。
- **NavigationMenu**(navigation):网站导航 + mega-panel。横向触发器各带下拉 panel,共享 Viewport、hover-intent(openDelay/closeDelay/移入宽限)、键盘可达;复合(List/Item/Trigger/Content/Link/Viewport)或 items 数据驱动;Space 不被合成 click 关回、panel 内 Esc 可被 onEscapeKeyDown 拦截、Esc 单路径。
- **HoverCard**(overlay):悬停富预览卡。openDelay/closeDelay 延迟开关 + 指针移入卡内不关 + 焦点也触发(a11y);区别于 Tooltip(纯文字)/Popover(点击);触屏不暴露悬空 aria-describedby、无 Popover API 兜底关闭态主动 inert、非原生可聚焦 trigger 自动注入 tabindex。
- **Calendar**(data-display):独立月历(区别于 DatePicker 的输入+弹层)。6×7 月网格 + 翻月/翻年,单选/范围/多选三模式、disabledDate/min/max、weekStartsOn、Intl 本地化、renderCell/dateCellRender 留口;role=grid 键盘网格导航(←→↑↓/PageUp/Down/Home/End/Enter),翻页后焦点夹回可见月保持唯一 tabIndex=0。logic.ts 纯日期数学(零外库,覆盖闰年/跨月跨年/周起始等黄金边界)。

**破坏性提示**:`Calendar` / `CalendarProps` / `CalendarClassNames` 现由新的独立 Calendar 组件导出;DatePicker 内嵌的同名私有面板**不再从库根 barrel 导出**(它本是 DatePicker 内部实现,误对外导出会与新独立 Calendar 在库根撞名 TS2308)。如此前从 `@magic-scope/react` 取 `Calendar` 实为 DatePicker 内嵌面板,现等价取到功能更完整的独立 Calendar。

每组件纯算法进 logic.ts(可平移 core)+ 完整 a11y/键盘/受控/事件合并/classNames/内容边界。经对抗性评审确认并修复 16 个真实 bug(Menubar 5 / NavigationMenu 4 / HoverCard 3 / Calendar 4),均补回归测试。lint / tsc / build / size(react 上限随 4 个复杂组件增长 170→195KB)/ registry(94 校验通过)/ 全量测试 2117 全绿。
