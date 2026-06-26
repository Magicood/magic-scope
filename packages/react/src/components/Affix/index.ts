export type {
  AffixClassNames,
  AffixHandle,
  AffixMode,
  AffixProps,
  AffixTarget,
} from './Affix';
export { Affix } from './Affix';
// 注:getScrollTop 是内部副本助手,不从本桶导出(BackTop 已导出同名,经全库 barrel 会撞名);
// 需要时从 BackTop 取或各自内部用。这里仅导出 Affix 专有的纯算法 computeAffix 与其类型。
export {
  type AffixContainerRect,
  type AffixRect,
  type AffixResult,
  type AffixStyle,
  type ComputeAffixInput,
  computeAffix,
} from './logic';
