---
"@magic-scope/react": minor
---

feat(react): 新增 3 个组件 —— ConfigProvider / Prose / Spin(v2 收尾批)

- **ConfigProvider**(utility):全局配置上下文。density/motion/fx/tone/size 在一处统一设置,经 data-ms-* 属性沿 CSS 级联下发(CSS-first,组件读祖先属性即生效);可选 messages 内部套 MessagesProvider 下发 i18n 文案;display:contents 透明根不破坏布局;useConfig hook 供需 JS 默认值的场景;多态 as / asChild。
- **Prose**(typography):富文本/HTML 内容容器排版。给 markdown/CMS 渲染内容套全库排版(h1-h6/p/ul/ol/blockquote/code/pre/a/table/kbd/hr/figure…),:where() 零特异度便于覆写、消费 --ms-* token、随密度缩放、tone 着色;超长 code/表格横向滚动不撑破。
- **Spin**(feedback):加载遮罩。包裹内容,spinning 时盖半透明遮罩 + 居中符文(内容不卸载、保留布局);delay 防闪烁(shouldShow 纯逻辑)、tip/size/indicator/fullscreen/bare;遮罩 role=status + aria-live、内容 inert 防交互;reduced-motion 降级。

含 logic 的纯算法可平移 core;共 +52 测试。lint / tsc / build / size 全绿。**至此组件库达 80 个组件。**
