export {
  AutoComplete,
  type AutoCompleteClassNames,
  type AutoCompleteOption,
  type AutoCompleteOptionGroup,
  type AutoCompleteOptions,
  type AutoCompleteProps,
  type AutoCompleteSize,
  type AutoCompleteTone,
} from './AutoComplete';
// 纯逻辑(filterOptions / defaultFilter / findEnabledIndex / optionText)与类型 AutoCompleteOptionLike
// 不在此 barrel 顶层再导出:它们是过滤/导航实现细节(已被 logic.test 覆盖),
// 且 filterOptions 名称与 Mentions 的同名导出会在全库 components/index.ts 撞名。
// 需要复用时按深路径 import from '.../AutoComplete/logic'。
