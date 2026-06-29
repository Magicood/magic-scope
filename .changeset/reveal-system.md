---
"@magic-scope/react": minor
---

新增**进场 / 滚动特效系统**(对标现代 web 动效编排):

- **`<Reveal>` / `<RevealGroup>` / `useReveal()`** 三层 API —— 18 种特效:fade、四向飞入(up/down/left/right)、双轴复合、zoom-in/out、flip-x/y 翻转、rotate、blur 聚焦、clip 四向幕布、mask 四向遮罩、text 逐行/逐词/逐字、shine 扫光、parallax 视差、progress 滚动进度。三种触发:`view`(滚动进视口)/ `mount`(挂载即播)/ `scrub`(滚动驱动)。
- **框架无关 CSS 契约** `reveal.css`(`data-ms-reveal` 声明 + `data-ms-inview` 状态机,transition 跑、无 FOUC),Vue / WC 可直接复用。
- **受三轴自动调制**:位移 / 缩放 / 模糊乘 `--ms-motion-scale`、时长引 `--ms-dur-*`、扫光乘 `--ms-fx-glow`;"动效 全/弱/关" + `prefers-reduced-motion` 零改动一键管住,关档瞬时直显、无障碍兜底。
- **性能**:单例 IntersectionObserver(按参数分桶,全站 1–3 实例);stagger 用 CSS `--i` 零 JS timer;只动 transform/opacity/filter/clip-path;scrub 走原生 `animation-timeline` 不上 scroll 监听。
- **搭配**:包裹任意组件,或 `asChild` 零额外 DOM 层。
