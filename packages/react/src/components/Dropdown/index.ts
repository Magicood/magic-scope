// 显式导出:只透出组件与其专有类型,纯逻辑里的通用函数名(placementToSide / placementToAlign 等)
// 与 Popover 的 barrel 同名,不从这里透出,避免 components/index.ts 聚合时撞名。

export type {
  DropdownClassNames,
  DropdownItem,
  DropdownPlacement,
  DropdownProps,
  DropdownTone,
  DropdownTriggerAction,
} from './Dropdown';
export { Dropdown } from './Dropdown';
