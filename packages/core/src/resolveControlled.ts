/**
 * 受控 / 非受控解析 —— 体检发现八处组件(Tabs/Popover/Popconfirm/Radio/Slider/Input/
 * NumberInput/Table)重复的模式,内核第一公共原语。
 * `controlled !== undefined` 即受控(值取 controlled),否则取内部 `internal`。
 * 注意:`false` / `0` / `''` 等 falsy 值只要不是 undefined 都算受控。
 */
export function resolveControlled<T>(
  controlled: T | undefined,
  internal: T,
): { value: T; isControlled: boolean } {
  const isControlled = controlled !== undefined;
  return { value: isControlled ? (controlled as T) : internal, isControlled };
}
