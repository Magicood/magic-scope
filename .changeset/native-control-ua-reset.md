---
"@magic-scope/react": patch
---

修复:组件不再依赖宿主页的 CSS reset(Button ghost/outline/link 在裸页面渲染成灰色药丸)

`.ms-button` 基座只重置了 `border`,没重置 `<button>` 的 UA 默认背景;`solid` / `soft` 各自设了 background,而 `ghost` / `outline` / `link` 只设 `color`。结果在**没有全局 reset 的宿主页**(未接 Tailwind preflight / normalize)里,这三个变体拿到 Chrome 的 ButtonFace 底色(浅色模式 `rgb(239,239,239)`、深色模式 `rgb(107,107,107)`),看起来像灰色药丸而非透明底。已在真浏览器复现并验证修复。

本次把「不依赖宿主 reset」拉成全库不变量:

- `.ms-button` 基座补 `background-color: transparent`(solid / soft 变体照常覆盖),一处根治三个变体。
- 全库审计 100 个原生控件渲染点,补齐另外 27 处 UA 默认值泄漏:
  - `.ms-tabs__close`(可关闭标签页的关闭钮)此前连 UA 的灰底、2px outset 边框、内边距一起漏出,补 `padding` / `border` / `background` / `font` / `color`;
  - 25 个原生控件基座补 `font: inherit`(原生 `button` / `input` **不继承**页面字体,裸宿主页会退回系统字体 13.33px):Alert / Carousel / Code / ColorPicker / Dialog / Drawer / Image / Input / NumberInput / Paragraph / PinInput / Slider / Steps / Table / Tabs / TagInput / Toast / Tour / Tree / Upload 的关闭·步进·工具钮等;
  - 5 个无文字内容的控件补 `color: inherit`,使「可见原生控件必须自带 background / border / font / color」成为零豁免的统一契约(a11y 用的视觉隐藏 input 自动豁免)。
- 新增 CI 红线 `css-contract.test.ts`:静态解析每个组件 TSX 里直接渲染的原生控件及其类名,回查 CSS 基态规则是否显式重置了这四项,漏一个就红。
- `@layer ms.reset` 明确定位为**故意留空**的使用方扩展点(组件库不该替宿主页 reset 别人的 `button`),README / 多端适配文档同步补上宿主 reset 兼容性说明。
