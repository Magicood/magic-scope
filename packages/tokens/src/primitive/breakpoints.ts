/**
 * primitive 断点刻度(结构常量 · 与主题无关) —— 多端响应式的唯一真相源。
 *
 * 两套并存(见 DESIGN.md §5):
 * - `viewport`:页面骨架 / `matchMedia` 用的视口断点,标准语义名(sm/md/lg/xl/2xl)。
 * - `container`:组件内部响应式的容器断点,魔法名(sigil/rune/ward/glyph),配合
 *   `container-type: inline-size` + `@container` 让组件对父容器而非视口自适应。
 *
 * 注:CSS 的 `@media`/`@container` 条件里 `var()` 不生效,故构建期由 TS 常量展开为
 * 静态 CSS(对齐 DESIGN 附录 A「不引 PostCSS,构建期常量注入」);本文件即那份常量源。
 * 不放进 `ThemeContract` —— 断点是结构常量,进契约会让每个主题重复声明、且加键 = major break。
 */
export const breakpoints = {
  /** 视口断点(rem):仅页面级骨架 / matchMedia。480 / 768 / 1024 / 1280 / 1536 px。 */
  viewport: {
    sm: '30rem',
    md: '48rem',
    lg: '64rem',
    xl: '80rem',
    '2xl': '96rem',
  },
  /** 容器断点(rem):组件内部响应式默认。288 / 448 / 640 / 896 px。 */
  container: {
    sigil: '18rem',
    rune: '28rem',
    ward: '40rem',
    glyph: '56rem',
  },
} as const;

export type Breakpoints = typeof breakpoints;
