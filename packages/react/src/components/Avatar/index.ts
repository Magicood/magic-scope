export * from './Avatar';
// 纯逻辑(getInitials/toneFromName 等)对消费方公开,便于自定义占位策略;
// AvatarTone 已由 ./Avatar re-export,这里不再重复导出避免冲突。
export { AVATAR_COLOR_POOL, getInitials, hashString, toneFromName } from './logic';
