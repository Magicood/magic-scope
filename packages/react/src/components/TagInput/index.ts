// 显式导出:只透出组件与其公共类型,不把 logic.ts 的通用函数名(canAdd / normalizeTag…)漏出 barrel。
export {
  type RenderTagContext,
  TagInput,
  type TagInputClassNames,
  type TagInputProps,
  type TagInputSize,
  type TagInputTone,
} from './TagInput';
