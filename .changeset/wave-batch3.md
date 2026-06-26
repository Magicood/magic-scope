---
"@magic-scope/react": minor
---

feat(react): 新增 5 个组件 —— Transfer / TimePicker / Mentions / Carousel / FloatButton

- **Transfer**(data-display):双列穿梭框。按 targetKeys 切分两侧、搜索过滤、选中移动纯逻辑(可平移 core);两栏标题/搜索/全选/每项 Checkbox + 中间方向按钮;targetKeys 受控/非受控、oneWay、禁用项不计入全选。
- **TimePicker**(forms):时间选择。时/分/秒(+12h AM/PM)可滚动列、step、disabledHours/Minutes/Seconds、此刻/确定、parse/format/clamp 纯逻辑;复用浮层 + Anchor 定位;invalid 供 Form。
- **Mentions**(forms):@ 提及输入。基于 textarea + 光标前触发段检测(detectMention)、过滤、插入计算纯逻辑;前缀可配、异步 onSearch、键盘选择;v1 浮层锚控件下方。
- **Carousel**(data-display):轮播。autoplay(pauseOnHover)、dots、箭头、slide/fade、loop、拖拽切换、受控 activeIndex;非活动 slide inert+aria-hidden;reduced-motion 停自动播。
- **FloatButton**(navigation):悬浮按钮。单钮 + Group 可展开堆叠;icon/description/tooltip/badge/href、circle/square、primary、固定定位;Group aria-expanded + inert 收起。

每组件纯算法进 logic.ts(可平移 core)+ logic/组件测试(共 +155 用例)。
