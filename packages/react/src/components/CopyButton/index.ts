// 显式导出:只导组件与其 props/类型。
// 逻辑层(writeClipboard / copyMessageKey)只内部用,且 writeClipboard 与 Code/logic 同名,
// 故不从 barrel 导出,避免撞名;需要时经 ./logic 直引。

export type { CopyButtonChildren, CopyButtonProps } from './CopyButton';
export { CopyButton } from './CopyButton';
