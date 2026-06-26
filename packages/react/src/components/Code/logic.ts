/**
 * Code 的纯逻辑层 —— 零 React 依赖,可平移 core。
 *
 * 两件事:
 * 1. `codeTextFromChildren`:从 React children(可能含嵌套节点)抽出纯文本,
 *    作为复制到剪贴板的内容(用户没显式给 copyText 时的兜底)。
 * 2. `writeClipboard`:跨环境写剪贴板,优先 navigator.clipboard,回退 execCommand,
 *    SSR / 无 DOM 时安全返回 false(绝不抛)。
 */

/** 从任意 React children 递归抽取可见文本。数字/字符串拼接,其它(布尔/null)忽略。 */
export function codeTextFromChildren(children: unknown): string {
  if (children == null || children === false || children === true) return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    let out = '';
    for (const child of children) out += codeTextFromChildren(child);
    return out;
  }
  // React 元素:从 props.children 继续下钻
  if (typeof children === 'object') {
    const props = (children as { props?: { children?: unknown } }).props;
    if (props && 'children' in props) return codeTextFromChildren(props.children);
  }
  return '';
}

/**
 * 写文本到剪贴板。返回 Promise<boolean> —— 成功 true,失败/不可用 false(不抛)。
 * 优先异步 Clipboard API(需安全上下文);回退到 textarea + execCommand('copy');
 * 无 DOM(SSR)直接 false。
 */
export async function writeClipboard(text: string): Promise<boolean> {
  // 现代异步 API(需 https / localhost)
  try {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 落到下面的 execCommand 兜底
  }

  // 兜底:隐藏 textarea + execCommand('copy')
  if (typeof document === 'undefined') return false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
