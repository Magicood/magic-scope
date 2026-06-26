/**
 * i18n React 绑定 —— 极薄一层(Context + Provider + hook)。
 *
 * 纯数据/纯函数在 ./messages(框架无关、可平移 core);这里只负责把它接进 React:
 * - `MessagesProvider` 合并父级 + 覆盖,并把结果写进模块单例 `setActiveMessages`,
 *   让命令式 API(confirm/alert/toast)也能取到当前文案;
 * - `useMessages()` 返回稳定的 `t(key, vars?, fallback?)`。
 *
 * 将来 vue 用 provide/inject、angular 用 DI 各写一份等价绑定,messages 数据层不动。
 */

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';
import {
  defaultMessages,
  type MessageKey,
  type MessageVars,
  type PartialMessages,
  resetActiveMessages,
  resolveMessage,
  setActiveMessages,
} from './messages';

export * from './messages';

const MessagesContext = createContext<PartialMessages>(defaultMessages);

export interface MessagesProviderProps {
  /** 覆盖部分文案;未覆盖的回退父级 / 默认表。 */
  messages?: PartialMessages | undefined;
  children?: ReactNode;
}

/** 注入/覆盖文案。可嵌套(子 Provider 合并父级)。不传 messages 时透传父级。 */
export function MessagesProvider({ messages, children }: MessagesProviderProps) {
  const parent = useContext(MessagesContext);
  const merged = useMemo<PartialMessages>(
    () => (messages ? { ...parent, ...messages } : parent),
    [parent, messages],
  );
  // 把当前生效字典同步给模块单例,供 React 树之外的命令式 API 取文案
  useEffect(() => {
    setActiveMessages(merged);
    return () => resetActiveMessages();
  }, [merged]);
  return <MessagesContext.Provider value={merged}>{children}</MessagesContext.Provider>;
}

/** 文案取值器类型:`t(key, vars?, fallback?)`。 */
export type TranslateFn = (key: MessageKey, vars?: MessageVars, fallback?: string) => string;

/** 取当前生效的 `t(key, vars?, fallback?)`(随 Provider 变化,引用稳定)。 */
export function useMessages(): TranslateFn {
  const messages = useContext(MessagesContext);
  return useMemo<TranslateFn>(
    () => (key, vars, fallback) => resolveMessage(messages, key, vars, fallback),
    [messages],
  );
}
