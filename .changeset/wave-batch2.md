---
"@magic-scope/react": minor
---

feat(react): 新增 5 个组件 —— ColorPicker / Upload / Cascader / Splitter / Affix

- **ColorPicker**(forms):颜色选择器。色彩数学纯函数(hsv/rgb/hex/hsl 互转 + parseColor/formatColor,可平移 core)、饱和度-明度 2D 面板(拖拽+键盘)、hue/alpha 滑条、hex/rgb/hsl 格式切换、预设色板、EyeDropper 取色(特性检测)、复用 Popover。
- **Upload**(forms):文件上传。拖拽区 + 点击选择、fileList 受控/非受控、accept 双重过滤、beforeUpload、customRequest 可插拔(传输与编排分离)、进度/状态/重试/预览、listType text/picture。
- **Cascader**(forms):级联选择。级联多列菜单、findPath/路径标签纯逻辑、changeOnSelect、键盘列间导航、复用 Popover、复用 select.* i18n。
- **Splitter**(layout):可拖拽分栏。复合 Splitter + Splitter.Panel、ResizeObserver 测量、resizePanels 约束求解纯逻辑、gutter role=separator + 键盘 + 双击折叠、命令式 handle。
- **Affix**(navigation):滚动吸附。computeAffix 纯逻辑、占位防跳动、吸顶/吸底、ResizeObserver 宽度跟随、rAF 节流。

每组件纯算法进 logic.ts(可平移 core)+ logic/组件测试(共 +161 用例)。lint / tsc / build / size 全绿。
