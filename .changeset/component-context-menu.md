---
"@magic-scope/react": minor
---

新增 ContextMenu 右键菜单组件

右键(contextmenu)在包裹区域内弹出,定位在光标处(越界自动夹回视口),portal 到 body;点选 / 点外 / Esc / 滚动关闭;↑↓ / Home / End / Enter 键盘可达,`role=menu/menuitem`,支持 `disabled` / `danger` 项。菜单项结构与 Menu 一致、复用 `.ms-menu__item` 视觉。区别于点击锚定展开的 Menu。含 4 个功能测试 + playground 演示。
