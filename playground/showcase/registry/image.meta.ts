import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'image',
  name: 'Image',
  category: 'data',
  summary: '图片,原生懒加载 + 加载骨架 + 失败兜底链,内建点击预览灯箱(缩放/旋转/还原)。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n用原生 loading=lazy 做进视口懒加载,加载中给脉冲骨架避免布局跳动;主图加载失败时沿 fallbackSrc 链逐级降级,全部失败再落到错误占位态。支持 width/height、object-fit(cover/contain/fill/none/scale-down)与圆角档(含 full 圆形)。开启 preview 后图片可点击/回车放大进全屏灯箱,带缩放/旋转/还原/关闭工具栏,键盘 Esc 关、+/- 缩放、r 旋转、0 还原,开合支持受控。变换状态机与来源回退解析抽成零依赖纯函数,便于单测与跨框架平移。',
  controls: [
    {
      type: 'select',
      prop: 'fit',
      label: '填充 fit',
      default: 'cover',
      options: [
        { value: 'cover', label: 'cover 覆盖' },
        { value: 'contain', label: 'contain 适应' },
        { value: 'fill', label: 'fill 拉伸' },
        { value: 'none', label: 'none 原尺寸' },
        { value: 'scale-down', label: 'scale-down 缩小适应' },
      ],
    },
    {
      type: 'select',
      prop: 'rounded',
      label: '圆角 rounded',
      default: 'none',
      options: [
        { value: 'none', label: 'none 无' },
        { value: 'sm', label: 'sm' },
        { value: 'md', label: 'md' },
        { value: 'lg', label: 'lg' },
        { value: 'xl', label: 'xl' },
        { value: 'full', label: 'full 圆形' },
      ],
    },
    {
      type: 'select',
      prop: 'decoding',
      label: '解码 decoding',
      default: 'async',
      options: [
        { value: 'async', label: 'async 异步' },
        { value: 'sync', label: 'sync 同步' },
        { value: 'auto', label: 'auto 自动' },
      ],
    },
    { type: 'boolean', prop: 'preview', label: '点击预览 preview', default: false },
    { type: 'boolean', prop: 'lazy', label: '懒加载 lazy', default: true },
  ],
  spread: 'img',
};
