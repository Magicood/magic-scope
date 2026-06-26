import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'upload',
  name: 'Upload',
  category: 'forms',
  summary: '文件上传:虚线拖拽区 + 点击触发,把「上传编排」与「真实传输」彻底解耦。',
  description:
    '自研、零依赖,只负责「选文件 → 客户端准入(accept / maxCount / beforeUpload)→ 维护每条 status / percent / list 的 UI 编排」,组件本身不内置任何 XHR/fetch —— 真正的网络传输由用户的 customRequest 提供,通过注入的 onProgress / onSuccess / onError 把进度与结果回灌。\n两条入口并存:拖拽区(dragover 高亮 / dragleave 还原 / drop 收文件)+ 点击触发隐藏 input[type=file];受控(fileList + onChange)/ 非受控(defaultFileList)双模式;每条文件含名 / 体积 / 进度条 / 状态图标 / 删除 / 失败重试 / 预览,listType 文本行或图片缩略。tone 经全库 resolver 驱动触发区高亮与进度发光,a11y 上触发区 role=button + 键盘 Enter/Space 可达。',
  controls: [
    {
      type: 'select',
      prop: 'listType',
      label: '列表形态 listType',
      default: 'text',
      options: [
        { value: 'text', label: 'text 文本行' },
        { value: 'picture', label: 'picture 图片缩略' },
      ],
    },
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
    { type: 'boolean', prop: 'multiple', label: '允许多选 multiple', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    {
      type: 'number',
      prop: 'maxCount',
      label: '最大条数 maxCount',
      default: 0,
      min: 0,
      max: 9,
      step: 1,
    },
    {
      type: 'text',
      prop: 'accept',
      label: '接受类型 accept',
      default: '',
      placeholder: '如 image/* 或 .png,.pdf',
    },
  ],
  spread: 'div',
};
