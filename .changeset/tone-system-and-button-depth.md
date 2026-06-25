---
"@magic-scope/react": minor
---

差异化地基:全库 tone 系统 + 教科书级 Button(深度化第一刀)

针对「组件停在最小版、无差异化优势」的反馈,落地深度化样板:

- **tone resolver(支点)**:新增 `tone.css`,`.ms-tone-{primary|accent|success|warning|danger|info|neutral}` 把当前语义色统一映射到 6 个槽位(`--ms-c` / `--ms-c-hover` / `--ms-c-active` / `--ms-on-c` / `--ms-c-soft` / `--ms-c-glow`),全部 `color-mix` 派生自已有角色、零硬编码色。组件只读槽位,换肤改一处全库联动——这是别人(各组件各写语义色)结构上学不来的护城河。
- **Button 重构为旗舰深度组件**:`tone`(6 色)× `variant`(solid/soft/outline/ghost/link)× `size`(**随 `data-ms-density` 缩放,把此前 0 引用的密度管线接活**)+ `loading`(旋转环 + `aria-busy` + 保持宽度防抖动 + 禁用)、`leftIcon`/`rightIcon`/`iconOnly`、`fullWidth`、`shape`(pill/square)、实例级 `glow`(off/hover/always)、`asChild`(渲染为 `<a>`/路由 Link 保留样式)。
- **新增 `ButtonGroup`**:吸附相邻按钮(共享边界、圆角只留两端)。
- 向后兼容:旧 `variant`/`size` 用法零改动,原 3 个测试 + 6 个新深度测试全过。
