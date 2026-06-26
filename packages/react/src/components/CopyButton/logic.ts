/**
 * CopyButton 纯逻辑层 —— 零 React 依赖,可平移 core(vue / web-component 共用同一套复制语义)。
 *
 * 两件事(都无副作用到 React):
 * 1. `writeClipboard`:跨环境写剪贴板。优先 navigator.clipboard.writeText(需安全上下文:
 *    https / localhost / file 等;非安全上下文该 API 通常不暴露),特性检测后回退到
 *    隐藏 textarea + document.execCommand('copy');无 DOM(SSR)安全返回 false,绝不抛。
 * 2. `copyAriaLabel`:按 copied 状态选 i18n key —— 组件层只负责把它接进 aria-label,
 *    文案怎么本地化由调用方的 t() 决定,逻辑层不写死中文。
 */

/** 复制态对应的 i18n 文案 key:未复制取 typography.copy,已复制取 typography.copied。 */
export function copyMessageKey(copied: boolean): 'typography.copy' | 'typography.copied' {
  return copied ? 'typography.copied' : 'typography.copy';
}

/**
 * 写文本到剪贴板。返回 Promise<boolean> —— 成功 true,失败 / 不可用 false(不抛)。
 *
 * - 优先异步 Clipboard API:需安全上下文(https / localhost)。非安全上下文(普通 http)
 *   下 `navigator.clipboard` 多半为 undefined,会自动落到 execCommand 兜底。
 * - 兜底:隐藏 textarea + `document.execCommand('copy')`(已弃用但兼容面广)。
 * - 无 DOM(SSR / 非浏览器):直接返回 false。
 */
export async function writeClipboard(text: string): Promise<boolean> {
  // 现代异步 API(需安全上下文)。包在 try 里:某些环境拒绝(权限/焦点)会 reject。
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
  if (typeof document === 'undefined') {
    return false;
  }
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
