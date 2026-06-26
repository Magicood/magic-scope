// 显式导出:只透出组件与其类型,不从 barrel 透出 logic.ts 里会撞名的通用函数(computeToggle / resolveOpen…)。

export type {
  CollapsibleContentProps,
  CollapsibleProps,
  CollapsibleTone,
  CollapsibleTriggerProps,
} from './Collapsible';
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './Collapsible';
