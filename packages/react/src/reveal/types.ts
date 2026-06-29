/** 进场/滚动特效变体 —— 与 reveal.css 的 data-ms-reveal 取值一一对应。 */
export type RevealVariant =
  | 'fade'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'up-left'
  | 'up-right'
  | 'down-left'
  | 'down-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip-x'
  | 'flip-y'
  | 'rotate'
  | 'blur'
  | 'clip-up'
  | 'clip-down'
  | 'clip-left'
  | 'clip-right'
  | 'mask-up'
  | 'mask-down'
  | 'mask-left'
  | 'mask-right'
  | 'shine'
  | 'parallax'
  | 'progress'
  | 'text-lines'
  | 'text-words'
  | 'text-chars';

/**
 * 触发模式:
 * - `view`(默认):进入视口时由单例 IntersectionObserver 触发(滚动 reveal);
 * - `mount`:挂载即播,不等视口(首屏 Hero 开场);
 * - `scrub`:滚动进度驱动,交给 CSS `animation-timeline`,不挂 observer(parallax/progress)。
 */
export type RevealTrigger = 'mount' | 'view' | 'scrub';
