/**
 * 事件 / ref 合并工具 —— 留口与 compose 的基建。纯函数,零框架耦合到组件外。
 *
 * 解决审计揪出的「组件在根/子元素挂了 onClick/onKeyDown 等却直接覆盖、丢掉用户处理器」问题:
 * 所有组件统一用 composeEventHandlers 把「用户传入的处理器」与「组件内部处理器」合并(先用户、再内部),
 * 用户在自己的处理器里 preventDefault 即可阻断内部行为(Radix 范式)。
 */
import type { MutableRefObject, Ref, RefCallback } from 'react';

/**
 * 合并事件处理器:先调用户的,未 `preventDefault` 再调组件内部的。
 * 用于组件根/子元素上「自己要挂处理器又要保留用户处理器」的场景。
 */
export function composeEventHandlers<E extends { defaultPrevented?: boolean }>(
  theirHandler: ((event: E) => void) | undefined,
  ourHandler: ((event: E) => void) | undefined,
  options: { checkDefaultPrevented?: boolean } = {},
): (event: E) => void {
  const { checkDefaultPrevented = true } = options;
  return (event: E) => {
    theirHandler?.(event);
    if (!checkDefaultPrevented || !event.defaultPrevented) {
      ourHandler?.(event);
    }
  };
}

type PossibleRef<T> = Ref<T> | undefined;

/** 给一个 ref(对象 ref 或回调 ref)赋值。 */
export function setRef<T>(ref: PossibleRef<T>, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref != null) (ref as MutableRefObject<T | null>).current = value;
}

/** 把多个 ref 合并成一个回调 ref(asChild 时把外部 ref 与子元素自身 ref 都接上)。 */
export function composeRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) setRef(ref, node);
  };
}

const isEventHandlerKey = (key: string): boolean => /^on[A-Z]/.test(key);

/**
 * 合并 asChild 的「组件 props」与「子元素 props」:
 * - `on*` 事件处理器:两边都有则 compose(子元素的先、组件的后,未 preventDefault 才执行组件的);
 * - `className`:拼接;`style`:合并(子元素优先);
 * - 其它属性:子元素优先(保留子元素自带的 href / type 等)。
 * 配合 composeRefs 处理 ref,即可正确实现 Slot 行为。
 */
export function mergeAsChildProps(
  parentProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...parentProps };
  for (const key of Object.keys(childProps)) {
    const childValue = childProps[key];
    const parentValue = parentProps[key];
    if (
      isEventHandlerKey(key) &&
      typeof childValue === 'function' &&
      typeof parentValue === 'function'
    ) {
      merged[key] = composeEventHandlers(
        childValue as (event: { defaultPrevented?: boolean }) => void,
        parentValue as (event: { defaultPrevented?: boolean }) => void,
      );
    } else if (key === 'className') {
      merged[key] = [parentValue, childValue].filter(Boolean).join(' ');
    } else if (key === 'style') {
      merged[key] = {
        ...(parentValue as object | undefined),
        ...(childValue as object | undefined),
      };
    } else {
      merged[key] = childValue;
    }
  }
  return merged;
}
