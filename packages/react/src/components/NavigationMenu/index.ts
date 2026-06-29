// 显式导出:只透出组件与其专有类型。
// 纯逻辑里的通用函数名(nextEnabledIndex / edgeEnabledIndex / reduceActive / planHoverIntent 等)
// 与其它组件 barrel 可能撞名,不从这里透出,避免 components/index.ts 聚合时冲突。

export type {
  NavigationMenuClassNames,
  NavigationMenuContentProps,
  NavigationMenuItemProps,
  NavigationMenuLinkProps,
  NavigationMenuProps,
  NavigationMenuTone,
  NavigationMenuTriggerProps,
  NavigationMenuViewportAlign,
  NavigationMenuViewportProps,
  NavMenuItem,
  NavMenuLink,
} from './NavigationMenu';
export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from './NavigationMenu';
