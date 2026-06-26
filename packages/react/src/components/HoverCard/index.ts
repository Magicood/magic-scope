// 显式导出:只透出 HoverCard 复合组件、其 props 与 placement 类型。
// 不 re-export logic.ts 里会与全库撞名的通用函数(placementToArea / normalizePlacement /
// resolveOpen / isCoarseNoHover 等),避免聚合 barrel 重名冲突。
export {
  HoverCard,
  type HoverCardClassNames,
  HoverCardContent,
  type HoverCardContentProps,
  type HoverCardPlacement,
  type HoverCardProps,
  type HoverCardSide,
  type HoverCardTone,
  HoverCardTrigger,
  type HoverCardTriggerProps,
} from './HoverCard';
