export * from './Grid';
// 仅 re-export Grid 专属类型与解析函数。通用名(Responsive / Breakpoint)不经 barrel 泄露,
// 避免与其它 layout 组件(Flex 等)在 components 顶层 barrel 撞名;需要者从 './logic' 深引。
export {
  type AlignValue,
  type DistributeValue,
  type GridLineValue,
  resolveColumns,
  resolveMinChildWidth,
  resolveSpace,
  resolveSpan,
  type SpaceValue,
} from './logic';
