import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'config-provider',
  name: 'ConfigProvider',
  category: 'composite',
  summary:
    '全局配置上下文:一处统一设置全库设计开关(密度 / 动效 / 发光 / 色调),经 data-ms-* 沿 CSS 级联下发。',
  description:
    '基础设施组件,本身无视觉形态。把分散的设计开关收到一处:density(密度档)/ motion(动效总闸)/ fx(装饰发光总闸)/ tone(默认色调),架构为 CSS-first——经根元素的 data-ms-* 属性沿 CSS 级联下发,后代组件读祖先属性即生效,不靠 JS prop 逐层钻透;同一套 data 属性可平移 vue / web component。\n可嵌套就近覆盖,可只设部分开关(未设的继承祖先 / 用根基线);额外 createContext + useConfig() 暴露 density/size/tone 默认值供少数需 JS 默认值的组件兜底。messages 经内部 MessagesProvider 合并下发文案、locale 写到根 lang;留口 as 多态根 / asChild Slot 把开关挂到已有节点,forwardRef 与原生属性透传,透明包裹不破坏文档语义。',
  controls: [
    {
      type: 'select',
      prop: 'density',
      label: '密度 density',
      default: 'comfortable',
      options: [
        { value: 'comfortable', label: 'comfortable 舒适' },
        { value: 'compact', label: 'compact 紧凑' },
        { value: 'spacious', label: 'spacious 宽松' },
      ],
    },
    {
      type: 'select',
      prop: 'motion',
      label: '动效 motion',
      default: 'on',
      options: [
        { value: 'on', label: 'on 满强度' },
        { value: 'subtle', label: 'subtle 克制' },
        { value: 'off', label: 'off 关闭' },
      ],
    },
    {
      type: 'select',
      prop: 'fx',
      label: '发光 fx',
      default: 'on',
      options: [
        { value: 'on', label: 'on 满强度' },
        { value: 'subtle', label: 'subtle 克制' },
        { value: 'off', label: 'off 关闭' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '默认色调 tone',
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
      type: 'text',
      prop: 'locale',
      label: '语言 locale(写到根 lang)',
      default: 'zh-CN',
      placeholder: 'zh-CN / en / ja…',
    },
  ],
  spread: 'div',
};
