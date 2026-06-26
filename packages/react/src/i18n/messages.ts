/**
 * i18n 文案字典 —— 纯数据 + 纯函数,零框架依赖。
 *
 * 这一层是**框架无关**的,将来可原样平移进 `packages/core`:
 * - `defaultMessages` 是纯数据(可 JSON 序列化、译者可直接改),不含任何逻辑;
 * - `formatMessage` / `resolveMessage` 是纯函数;
 * - `activeMessages` 模块单例供「React 树之外」的命令式 API(confirm/alert/toast)取文案,
 *   各框架的 Provider/Service 负责写入(见 i18n 的 React 绑定 index.tsx)。
 *
 * v1 仅支持 `{var}` 简单插值;复数(plural/ICU)延后,需要时按 `Intl.PluralRules` 扩展。
 */

/** 一条文案 = 字符串模板,支持 `{name}` 占位。纯数据,译者可改。 */
export type Message = string;
/** 插值变量。 */
export type MessageVars = Record<string, string | number>;

/** 全部文案 key。新增面向用户文案时在此登记,避免散落硬编码。 */
export type MessageKey =
  | 'input.clear'
  | 'input.password.show'
  | 'input.password.hide'
  | 'alert.close'
  | 'avatar.status.online'
  | 'avatar.status.offline'
  | 'avatar.status.busy'
  | 'avatar.status.away'
  | 'label.optional'
  | 'label.required'
  | 'typography.copy'
  | 'typography.copied'
  | 'typography.expand'
  | 'typography.collapse'
  | 'typography.permalink'
  | 'link.newWindow'
  | 'empty.description'
  | 'segmented.label'
  | 'select.placeholder'
  | 'select.empty'
  | 'select.loading'
  | 'select.search'
  | 'select.create'
  | 'select.removeTag'
  | 'select.selected'
  | 'table.empty'
  | 'table.selectAll'
  | 'table.selectRow'
  | 'table.selectionColumn'
  | 'numberInput.increment'
  | 'numberInput.decrement'
  | 'pagination.nav'
  | 'pagination.prev'
  | 'pagination.next'
  | 'pagination.page'
  | 'breadcrumb.nav'
  | 'dialog.close'
  | 'drawer.close'
  | 'alertDialog.confirm'
  | 'alertDialog.cancel'
  | 'popconfirm.confirm'
  | 'popconfirm.cancel'
  | 'table.expandRow'
  | 'table.collapseRow'
  | 'table.expandColumn'
  | 'tag.remove'
  | 'timeline.pending'
  | 'toast.close'
  | 'toaster.region'
  | 'spinner.label';

/** 完整字典:每个 key 都有值。 */
export type Messages = Record<MessageKey, Message>;
/**
 * 覆盖用的部分字典。索引签名**含 undefined**——这是 strict
 * (`noUncheckedIndexedAccess`)下合并 `{ ...parent, ...partial }` 能通过类型检查的关键:
 * 若用 `Partial<Messages>` 展开会得到 `{ [k]: Message | undefined }`,无法回赋 `Messages`(TS2322)。
 */
export type PartialMessages = { readonly [K in MessageKey]?: Message | undefined };

/** zh-CN 默认全集。纯数据。 */
export const defaultMessages: Messages = {
  'input.clear': '清除',
  'input.password.show': '显示密码',
  'input.password.hide': '隐藏密码',
  'alert.close': '关闭',
  'avatar.status.online': '在线',
  'avatar.status.offline': '离线',
  'avatar.status.busy': '忙碌',
  'avatar.status.away': '离开',
  'label.optional': '可选',
  'label.required': '必填',
  'typography.copy': '复制',
  'typography.copied': '已复制',
  'typography.expand': '展开',
  'typography.collapse': '收起',
  'typography.permalink': '永久链接',
  'link.newWindow': '(在新窗口打开)',
  'empty.description': '暂无数据',
  'segmented.label': '分段选择',
  'select.placeholder': '请选择…',
  'select.empty': '无匹配项',
  'select.loading': '加载中…',
  'select.search': '搜索…',
  'select.create': '创建 “{query}”',
  'select.removeTag': '移除 {label}',
  'select.selected': '已选 {count} 项',
  'table.empty': '暂无数据',
  'table.selectAll': '全选',
  'table.selectRow': '选择第 {index} 行',
  'table.selectionColumn': '选择',
  'numberInput.increment': '增加',
  'numberInput.decrement': '减少',
  'pagination.nav': '分页',
  'pagination.prev': '上一页',
  'pagination.next': '下一页',
  'pagination.page': '第 {page} 页',
  'breadcrumb.nav': '面包屑',
  'dialog.close': '关闭',
  'drawer.close': '关闭',
  'alertDialog.confirm': '确定',
  'alertDialog.cancel': '取消',
  'popconfirm.confirm': '确定',
  'popconfirm.cancel': '取消',
  'table.expandRow': '展开第 {index} 行',
  'table.collapseRow': '收起第 {index} 行',
  'table.expandColumn': '展开',
  'tag.remove': '移除',
  'timeline.pending': '进行中…',
  'toast.close': '关闭',
  'toaster.region': '通知',
  'spinner.label': '加载中',
};

const TEMPLATE = /\{(\w+)\}/g;

/** 把模板里的 `{name}` 替换为 `vars[name]`;缺变量原样保留。纯函数。 */
export const formatMessage = (template: Message, vars?: MessageVars): string =>
  vars === undefined
    ? template
    : template.replace(TEMPLATE, (match, name: string) =>
        name in vars ? String(vars[name]) : match,
      );

const isDev = (): boolean => {
  // 经 globalThis 取,避免裸 `process` 名依赖 @types/node;浏览器无 process 时安全回退 false
  const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env;
  return env ? env.NODE_ENV !== 'production' : false;
};

/**
 * 解析一条文案:在覆盖表里找 → 回退默认表 → 回退显式 `fallback`。纯函数(dev 警告除外)。
 * 缺失时不裸返回内部 key(避免点分串泄漏到 UI):dev 下 warn 帮助排查,最终回退 `fallback ?? key`。
 */
export const resolveMessage = (
  messages: PartialMessages,
  key: MessageKey,
  vars?: MessageVars,
  fallback?: string,
): string => {
  const template = messages[key] ?? defaultMessages[key] ?? fallback;
  if (template === undefined) {
    if (isDev()) console.warn(`[magic-scope i18n] 缺少文案 key: ${key}`);
    return fallback ?? key;
  }
  return formatMessage(template, vars);
};

/**
 * 模块单例「当前生效字典」。供 React 树之外的命令式 API 取文案。
 * 框架无关:任何框架的 Provider/Service 在挂载时 `setActiveMessages(merged)`、卸载时复位。
 */
let activeMessages: PartialMessages = defaultMessages;
export const getActiveMessages = (): PartialMessages => activeMessages;
export const setActiveMessages = (messages: PartialMessages): void => {
  activeMessages = messages;
};
export const resetActiveMessages = (): void => {
  activeMessages = defaultMessages;
};

/** 命令式 API 取文案的便捷封装(走模块单例,非 hook)。 */
export const translate = (key: MessageKey, vars?: MessageVars, fallback?: string): string =>
  resolveMessage(getActiveMessages(), key, vars, fallback);
