/**
 * Upload 纯逻辑 —— 零 React 依赖,可平移进 core。
 *
 * 上传这件事拆成两块:**编排状态**(每条文件的 status/percent/list)与**真正的网络传输**。
 * 本文件只负责前者的纯算法 —— File 规范化、accept 匹配、体积格式化、状态流转,
 * 全部是无副作用的纯函数,组件(及将来 vue/core)只把它们接进自己的状态/DOM。
 * 真正的 XHR/fetch 不在这里,也不在组件里,而是由用户的 customRequest 提供(诚实备注见组件)。
 */

/** 单条上传文件的状态机。 */
export type UploadFileStatus = 'pending' | 'uploading' | 'done' | 'error' | 'removed';

/**
 * 一条上传文件的视图模型(列表的最小契约)。
 * `raw` 留存原始 File 以便 customRequest 真正读取/上传;受控传入时可省略(仅展示既有文件)。
 */
export interface UploadFile {
  /** 唯一标识(组件内生成或受控传入),用于 React key 与增删定位。 */
  uid: string;
  /** 文件名(展示用,默认取 File.name)。 */
  name: string;
  /** 字节数(展示用,默认取 File.size)。 */
  size: number;
  /** MIME 类型(默认取 File.type)。 */
  type: string;
  /** 状态机当前值。 */
  status: UploadFileStatus;
  /** 上传进度 0–100。 */
  percent: number;
  /** 上传完成后的可访问 URL / 预览地址(picture 列表的缩略图、文本列表的下载链接)。 */
  url?: string | undefined;
  /** 原始 File 对象;受控展示既有文件时可缺省。 */
  raw?: File | undefined;
  /** 失败原因(展示用)。 */
  error?: string | undefined;
}

/** 自增计数器:配合时间戳生成稳定且不碰撞的 uid(纯函数靠闭包持有种子)。 */
let uidSeed = 0;

/** 生成一个进程内唯一的 uid(不依赖 crypto,SSR/测试都稳定可用)。 */
export function makeUid(): string {
  uidSeed += 1;
  return `ms-upload-${Date.now().toString(36)}-${uidSeed.toString(36)}`;
}

/**
 * 把原生 File 规范化为 UploadFile(初始 pending / 0%)。
 * 允许覆写部分字段(如受控注入既有 url / 指定 status)。
 */
export function wrapFile(file: File, overrides?: Partial<UploadFile>): UploadFile {
  return {
    uid: makeUid(),
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'pending',
    percent: 0,
    raw: file,
    ...overrides,
  };
}

/**
 * 判断一个文件是否匹配 `accept` 串(对齐原生 input accept 语义,逗号分隔多条):
 * - 扩展名:`.png`(大小写不敏感,匹配文件名后缀);
 * - MIME 通配:`image/*`(匹配大类);
 * - 精确 MIME:`application/pdf`。
 * `accept` 为空 / 未给时一律放行。
 */
export function isAccepted(file: { name: string; type: string }, accept?: string): boolean {
  const spec = accept?.trim();
  if (!spec) {
    return true;
  }
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  const tokens = spec
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) {
    return true;
  }
  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return name.endsWith(token);
    }
    if (token.endsWith('/*')) {
      const group = token.slice(0, token.indexOf('/'));
      return mime.startsWith(`${group}/`);
    }
    return mime === token;
  });
}

/** 体积单位阶梯(1024 进制)。 */
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

/**
 * 把字节数格式化为可读字符串(1024 进制,保留至多 `fractionDigits` 位小数,去尾零)。
 * 负数 / NaN 归零;0 → `0 B`。
 */
export function formatFileSize(bytes: number, fractionDigits = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), SIZE_UNITS.length - 1);
  const unit = SIZE_UNITS[exp] ?? 'B';
  const value = bytes / 1024 ** exp;
  // B 不带小数;其余按位数四舍五入后去掉尾随 0。
  const fixed = exp === 0 ? String(Math.round(value)) : value.toFixed(fractionDigits);
  const trimmed = fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed;
  return `${trimmed} ${unit}`;
}

/**
 * 状态流转的合法迁移表(只声明「允许」的迁移,组件据此推进/拦截非法跳转)。
 * pending → uploading → done | error;error → uploading(重试);任意 → removed。
 */
const TRANSITIONS: Record<UploadFileStatus, readonly UploadFileStatus[]> = {
  pending: ['uploading', 'removed'],
  uploading: ['done', 'error', 'removed'],
  done: ['removed'],
  error: ['uploading', 'removed'],
  removed: [],
};

/** 当前状态是否允许迁移到 `next`。 */
export function canTransition(from: UploadFileStatus, next: UploadFileStatus): boolean {
  return TRANSITIONS[from].includes(next);
}

/**
 * 求下一个状态:合法则返回 `next`,非法则原样返回 `from`(不抛错,便于组件无脑调用)。
 * 这是组件推进每条文件状态机的唯一入口,保证不出现 done→uploading 这类越级跳变。
 */
export function nextStatus(from: UploadFileStatus, next: UploadFileStatus): UploadFileStatus {
  return canTransition(from, next) ? next : from;
}

/** 进度夹取到 0–100 的整数区间(customRequest 回报的 percent 可能越界 / 带小数)。 */
export function clampPercent(percent: number): number {
  if (!Number.isFinite(percent)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(percent)));
}

/** 在列表里按 uid 用 `patch` 局部更新某条(返回新数组,不改原数组)。 */
export function patchFile(
  list: readonly UploadFile[],
  uid: string,
  patch: Partial<UploadFile>,
): UploadFile[] {
  return list.map((f) => (f.uid === uid ? { ...f, ...patch } : f));
}

/** 在列表里按 uid 移除某条(返回新数组)。 */
export function removeFile(list: readonly UploadFile[], uid: string): UploadFile[] {
  return list.filter((f) => f.uid !== uid);
}

/**
 * 受 `maxCount` 约束地接纳新文件:返回 `{ accepted, rejected }`。
 * `maxCount <= 0` / 未给视为不限。已占用 `current` 个名额时,只接纳剩余名额数量的新文件。
 */
export function applyMaxCount<T>(
  current: number,
  incoming: readonly T[],
  maxCount?: number,
): { accepted: T[]; rejected: T[] } {
  if (maxCount === undefined || maxCount <= 0) {
    return { accepted: [...incoming], rejected: [] };
  }
  const remaining = Math.max(0, maxCount - current);
  return {
    accepted: incoming.slice(0, remaining),
    rejected: incoming.slice(remaining),
  };
}
