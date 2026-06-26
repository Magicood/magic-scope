import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'form',
  name: 'Form',
  category: 'forms',
  summary: '表单子系统 + 零依赖校验引擎,订阅式切片 store 让打字只重渲单字段。',
  description:
    '自研、headless 引擎落在纯 TS(零 React,为将来抽 @magic-scope/core 留口):字段值与校验态进订阅式切片 store,大表单打字时表单根与兄弟字段零 re-render(细粒度 path 切片 + useSyncExternalStore)。\n校验双轨可叠加——内建 rules(零依赖、可 i18n)+ Standard Schema v1(不 import zod,zod/valibot/arktype 原生兼容);异步校验自带防抖与竞态取消。\n用显式适配器表把库内 10 个 value/onChange 形态不一的控件(Checkbox 用 checked、Slider/Rate 用数值、Select ref→button…)优雅注入,Field 自动连好 a11y(label↔control、aria-invalid/describedby/required、提交聚焦首错),校验失败态复用全库 tone 发光、错误文案 role=alert 滑入不抖布局。\n配合 useForm(命令式 FieldPath 类型安全)与 Form.Field/Submit/Reset/List/ErrorSummary 子部件使用。',
  controls: [
    {
      type: 'select',
      prop: 'layout',
      label: '布局 layout',
      default: 'vertical',
      options: [
        { value: 'vertical', label: 'vertical 垂直' },
        { value: 'horizontal', label: 'horizontal 水平' },
        { value: 'inline', label: 'inline 行内' },
      ],
    },
    {
      type: 'select',
      prop: 'labelAlign',
      label: 'label 对齐 labelAlign',
      default: 'start',
      options: [
        { value: 'start', label: 'start' },
        { value: 'end', label: 'end' },
      ],
    },
    { type: 'boolean', prop: 'disabled', label: '整表禁用 disabled', default: false },
    {
      type: 'text',
      prop: 'labelWidth',
      label: 'label 列宽 labelWidth(horizontal)',
      default: '6rem',
      placeholder: '如 6rem / 120',
    },
  ],
  spread: 'form',
};
