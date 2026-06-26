/**
 * Kbd 纯逻辑层 —— 不依赖 React,可原样平移进 packages/core。
 * 负责:把快捷键字符串/数组拆成「键」、把键名映射成平台符号、探测平台。
 * 这里只做字符串处理与查表,无任何副作用(平台探测除外,且做了 SSR 安全降级)。
 */

/** 目标平台。auto 在浏览器经 navigator 探测,SSR/未知一律回退到 win(无符号化)。 */
export type KbdPlatform = 'auto' | 'mac' | 'win';

/** 实际平台(auto 解析后的结果),只会是 mac 或 win。 */
export type ResolvedPlatform = 'mac' | 'win';

/** 一个键帽:原始键名 + 该平台下的展示文本 + 是否为修饰键。 */
export interface KbdToken {
  /** 归一化后的原始键名(小写,如 'cmd' / 'shift' / 'k')。 */
  readonly key: string;
  /** 当前平台下用于展示的文本(可能是符号 ⌘,也可能是原文 Cmd)。 */
  readonly label: string;
  /** 是否修饰键(cmd/ctrl/alt/shift/meta/super/win)。 */
  readonly modifier: boolean;
}

/** 键名别名 → 归一化键名。让 'command'/'cmd'/'meta'/'win' 等都收敛到统一键。 */
const KEY_ALIASES: Record<string, string> = {
  cmd: 'cmd',
  command: 'cmd',
  meta: 'cmd',
  super: 'cmd',
  win: 'cmd',
  windows: 'cmd',
  ctrl: 'ctrl',
  control: 'ctrl',
  alt: 'alt',
  option: 'alt',
  opt: 'alt',
  shift: 'shift',
  enter: 'enter',
  return: 'enter',
  esc: 'esc',
  escape: 'esc',
  del: 'del',
  delete: 'del',
  backspace: 'backspace',
  tab: 'tab',
  space: 'space',
  spacebar: 'space',
  up: 'up',
  arrowup: 'up',
  down: 'down',
  arrowdown: 'down',
  left: 'left',
  arrowleft: 'left',
  right: 'right',
  arrowright: 'right',
  pageup: 'pageup',
  pagedown: 'pagedown',
  home: 'home',
  end: 'end',
  capslock: 'capslock',
  plus: 'plus',
};

/** 哪些归一化键是修饰键。 */
const MODIFIER_KEYS = new Set(['cmd', 'ctrl', 'alt', 'shift']);

/** mac 下的符号映射(归一化键 → 符号)。未列出的走通用映射或原文。 */
const MAC_SYMBOLS: Record<string, string> = {
  cmd: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  shift: '⇧',
  enter: '⏎',
  esc: '⎋',
  del: '⌫',
  backspace: '⌫',
  tab: '⇥',
  capslock: '⇪',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  pageup: '⇞',
  pagedown: '⇟',
  home: '↖',
  end: '↘',
};

/** win/通用平台下的可读文本(归一化键 → 文本)。 */
const WIN_LABELS: Record<string, string> = {
  cmd: 'Ctrl',
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  esc: 'Esc',
  del: 'Del',
  backspace: 'Backspace',
  tab: 'Tab',
  capslock: 'Caps',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  pageup: 'PgUp',
  pagedown: 'PgDn',
  home: 'Home',
  end: 'End',
  space: 'Space',
  plus: '+',
};

/** 跨平台都用符号的键(方向键等),无论 mac/win 都展示符号。 */
const UNIVERSAL_LABELS: Record<string, string> = {
  space: '␣',
};

/**
 * 探测当前运行平台。浏览器读 navigator(优先 userAgentData,回退 platform/userAgent),
 * SSR 或探测失败一律回退 win(只影响符号化,不影响功能)。纯函数+无抛错。
 */
export const detectPlatform = (): ResolvedPlatform => {
  if (typeof navigator === 'undefined') return 'win';
  // 新 API:navigator.userAgentData.platform(实验性,做可选链保护)
  const uaData = (navigator as { userAgentData?: { platform?: string } }).userAgentData;
  const hint = uaData?.platform ?? navigator.platform ?? navigator.userAgent ?? '';
  return /mac|iphone|ipad|ipod/i.test(hint) ? 'mac' : 'win';
};

/** 把 platform prop(可能是 auto)解析成确定平台。 */
export const resolvePlatform = (platform: KbdPlatform): ResolvedPlatform =>
  platform === 'auto' ? detectPlatform() : platform;

/**
 * 把单个原始键名归一化为统一键名。
 * 修饰键别名收敛(command→cmd 等);普通可见字符保留原样(小写)。
 */
export const normalizeKey = (raw: string): string => {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  return KEY_ALIASES[lower] ?? lower;
};

/**
 * 把快捷键(字符串如 'cmd+shift+k',或数组如 ['cmd','k'])拆成键名数组。
 * 字符串以 '+' 分隔;为支持「加号键」本身,先把字面量 'plus' 当独立键、
 * 并允许两端空白。空段过滤掉。
 */
export const splitKeys = (keys: string | readonly string[]): string[] => {
  const list = Array.isArray(keys)
    ? (keys as readonly string[])
    : String(keys)
        // 把 ' + ' 这种带空格的连接符也切开;末尾/开头的 '+' 视为加号键
        .split('+')
        .map((s) => (s.trim() === '' ? 'plus' : s));
  return list.map((s) => s.trim()).filter((s) => s.length > 0);
};

/**
 * 给定一个归一化键与解析后的平台,返回展示文本。
 * mac 优先符号表;通用符号表(方向/空格)其次;win 文本表再次;都没有则首字母大写原文。
 */
export const labelForKey = (normalized: string, platform: ResolvedPlatform): string => {
  if (UNIVERSAL_LABELS[normalized]) return UNIVERSAL_LABELS[normalized] as string;
  if (platform === 'mac' && MAC_SYMBOLS[normalized]) return MAC_SYMBOLS[normalized] as string;
  if (WIN_LABELS[normalized]) return WIN_LABELS[normalized] as string;
  // 单个可见字符 → 大写(k → K);多字符未知键 → 首字母大写(f1 → F1)
  if (normalized.length === 1) return normalized.toUpperCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

/**
 * 主解析器:把快捷键解析成一组带展示文本的 token。
 * 这是组件渲染多键帽的唯一数据来源,完全纯函数(平台已解析后传入)。
 */
export const parseKbd = (
  keys: string | readonly string[],
  platform: ResolvedPlatform,
): KbdToken[] =>
  splitKeys(keys).map((raw) => {
    const key = normalizeKey(raw);
    return {
      key,
      label: labelForKey(key, platform),
      modifier: MODIFIER_KEYS.has(key),
    };
  });

/**
 * 把 token 串成给屏幕阅读器/aria-label 用的可读序列,
 * 始终用平台无关的全词(Command/Shift/K),避免读屏念出无意义符号。
 */
const ARIA_WORDS: Record<string, string> = {
  cmd: 'Command',
  ctrl: 'Control',
  alt: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  esc: 'Escape',
  del: 'Delete',
  backspace: 'Backspace',
  tab: 'Tab',
  space: 'Space',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  pageup: 'Page Up',
  pagedown: 'Page Down',
  home: 'Home',
  end: 'End',
  capslock: 'Caps Lock',
  plus: 'Plus',
};

/** 生成无障碍可读串(如 'Command Shift K'),用于 aria-label 兜底。 */
export const ariaLabelForTokens = (tokens: readonly KbdToken[]): string =>
  tokens
    .map((tk) => ARIA_WORDS[tk.key] ?? (tk.key.length === 1 ? tk.key.toUpperCase() : tk.key))
    .join(' ');
