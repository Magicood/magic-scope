/**
 * Paragraph 纯逻辑层 —— 零 React 依赖,可平移进 core 与其它框架壳。
 *
 * 这里只放「能从 props 推导出的纯函数」与「与剪贴板交互的命令式 helper」:
 * - 省略/展开配置的归一化(布尔速记 → 完整结构);
 * - 复制配置的归一化;
 * - copyText():封装 navigator.clipboard,带 execCommand 降级,返回是否成功。
 * 组件层只负责 state(已展开?已复制?)与渲染,逻辑判定全交给这里,便于单测。
 */

/** 省略行为的规范化结构(组件内部消费的形态)。 */
export interface ResolvedEllipsis {
  /** 截断到几行(>=1)。 */
  rows: number;
  /** 是否提供「展开 / 收起」切换。 */
  expandable: boolean;
  /** 末尾省略符号(默认浏览器自带的 …,这里仅当用户显式给出时附加)。 */
  symbol: string | undefined;
}

/** 省略 prop:`true` = 单行省略速记;对象 = 多行 + 可选展开。 */
export type EllipsisProp =
  | boolean
  | {
      /** 截断到几行(默认 1)。 */
      rows?: number | undefined;
      /** 是否可展开/收起(默认 false)。 */
      expandable?: boolean | undefined;
      /** 自定义省略符号(如 "… 更多")。 */
      symbol?: string | undefined;
    };

/**
 * 归一化省略配置:false/缺省 → null(不截断);true → 单行;对象 → 取值兜底。
 * rows 至少为 1(防 0/负数把内容压没)。
 */
export function resolveEllipsis(ellipsis: EllipsisProp | undefined): ResolvedEllipsis | null {
  if (ellipsis == null || ellipsis === false) return null;
  if (ellipsis === true) return { rows: 1, expandable: false, symbol: undefined };
  const rows = ellipsis.rows == null ? 1 : Math.max(1, Math.floor(ellipsis.rows));
  return {
    rows,
    expandable: ellipsis.expandable ?? false,
    symbol: ellipsis.symbol,
  };
}

/** 复制配置的规范化结构。 */
export interface ResolvedCopyable {
  /** 要复制的文本(显式给出则用它,否则组件回退取自身 textContent)。 */
  text: string | undefined;
  /** 复制成功回调(拿到最终复制的文本)。 */
  onCopy: ((text: string) => void) | undefined;
}

/** 复制 prop:`true` = 复制自身文本;对象 = 自定义文本 / 回调。 */
export type CopyableProp =
  | boolean
  | {
      /** 覆盖要复制的文本(默认复制段落自身可见文本)。 */
      text?: string | undefined;
      /** 复制成功后的回调。 */
      onCopy?: ((text: string) => void) | undefined;
    };

/** 归一化复制配置:false/缺省 → null(不显示复制按钮)。 */
export function resolveCopyable(copyable: CopyableProp | undefined): ResolvedCopyable | null {
  if (copyable == null || copyable === false) return null;
  if (copyable === true) return { text: undefined, onCopy: undefined };
  return { text: copyable.text, onCopy: copyable.onCopy };
}

/**
 * 把文本写入剪贴板。优先 navigator.clipboard(异步、安全上下文),
 * 不可用时降级 document.execCommand('copy')(老环境 / 非安全上下文 / jsdom)。
 * 返回是否复制成功。纯命令式、与框架无关。
 */
export async function copyText(text: string): Promise<boolean> {
  const nav = (globalThis as { navigator?: Navigator }).navigator;
  if (nav?.clipboard?.writeText) {
    try {
      await nav.clipboard.writeText(text);
      return true;
    } catch {
      // 落到 execCommand 降级
    }
  }
  return legacyCopy(text);
}

/** execCommand 降级:挂一个临时 textarea、选中、copy、移除。 */
function legacyCopy(text: string): boolean {
  const doc = (globalThis as { document?: Document }).document;
  if (!doc?.body || typeof doc.execCommand !== 'function') return false;
  const ta = doc.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  ta.style.pointerEvents = 'none';
  doc.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = doc.execCommand('copy');
  } catch {
    ok = false;
  }
  doc.body.removeChild(ta);
  return ok;
}
