export type { PanelConstraint } from './logic';
// 仅暴露分栏专用纯算法;clamp / resolveLength / sizesToPercents 是通用小工具,
// 名字易与其它组件(如 ColorPicker 的 clamp)在 components 桶文件 `export *` 处撞名,故不经公共面再导出,
// 需要时从 '@magic-scope/react/components/Splitter/logic' 直接引。
export { normalizeSizes, resizePanels } from './logic';
export type {
  SplitterClassNames,
  SplitterHandle,
  SplitterLength,
  SplitterOrientation,
  SplitterPanelProps,
  SplitterProps,
  SplitterResizeDetail,
} from './Splitter';
export { Splitter, SplitterPanel } from './Splitter';
