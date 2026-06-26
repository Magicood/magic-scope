// 显式导出:只透出组件与其专有类型。纯逻辑里的通用函数名(nextTriggerIndex / adjacentMenu /
// resolveMenubarKey 等)不从这里透出,避免 components/index.ts 聚合时与其它组件 barrel 撞名。

export type {
  MenubarClassNames,
  MenubarItem,
  MenubarMenuPlacement,
  MenubarMenuProps,
  MenubarProps,
  MenubarTone,
} from './Menubar';
export { Menubar, MenubarMenu } from './Menubar';
