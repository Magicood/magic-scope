import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'back-top',
  name: 'BackTop',
  category: 'navigation',
  summary: '回到顶部浮钮:滚过阈值淡入,点击缓动滚回顶部,接 tone 色调与密度缩放。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。固定定位(fixed)右下,right/bottom 可调并叠加安全区。\n监听滚动容器(默认 window,可传 target=()=>HTMLElement|Window 指向内部滚动容器),scrollTop 超过 visibilityHeight(默认 400)才淡入,否则淡出并移出 tab 序 + aria-hidden,避免不可见时被键盘/读屏命中。\n点击用 requestAnimationFrame + easeInOutCubic 缓动滚回顶部(可调 duration);prefers-reduced-motion 或 data-ms-motion="off" 时降级为瞬时归顶。回顶与用户 onClick 经 composeEventHandlers 合并,用户可 preventDefault 阻断回顶。tone 7 色只读全库槽位、circle/square 形状、尺寸随 data-ms-density 缩放、focus-visible 发光环。',
  controls: [
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary' },
        { value: 'accent', label: 'accent' },
        { value: 'success', label: 'success' },
        { value: 'warning', label: 'warning' },
        { value: 'danger', label: 'danger' },
        { value: 'info', label: 'info' },
        { value: 'neutral', label: 'neutral' },
      ],
    },
    {
      type: 'select',
      prop: 'shape',
      label: '形状 shape',
      default: 'circle',
      options: [
        { value: 'circle', label: 'circle 圆形' },
        { value: 'square', label: 'square 方形' },
      ],
    },
    {
      type: 'number',
      prop: 'visibilityHeight',
      label: '显示阈值 visibilityHeight',
      default: 80,
      min: 0,
      max: 400,
      step: 20,
    },
    {
      type: 'number',
      prop: 'duration',
      label: '回顶时长 duration(ms)',
      default: 450,
      min: 0,
      max: 1200,
      step: 50,
    },
  ],
  spread: 'button',
};
