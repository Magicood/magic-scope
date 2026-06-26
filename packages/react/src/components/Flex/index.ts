export * from './Flex';
// 不 `export * from './logic'`:logic 含通用名(Responsive / Breakpoint / isResponsiveObject 等),
// 经 components/index.ts barrel 会与其它 layout 组件(Container / Center / Grid / Stack)撞名报 TS2308。
// 需要 Flex 的纯逻辑(buildFlexVars / resolveGap 等)者,从 Flex/logic 子路径直接取用。
