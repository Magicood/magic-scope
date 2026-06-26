/**
 * Result 纯逻辑(零 React)—— status → tone / 默认符文 / 默认标题 的映射与解析。
 * 抽到这里便于将来平移到其它框架(vue / web component),React 壳只做渲染。
 */

/** 结果状态:语义结果 4 档 + HTTP 异常 3 档。 */
export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';

/** 全库统一 6 tone 槽位的语义色调名(与 Button/Alert 同源)。 */
export type ResultTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/** 尺寸档,随 data-ms-density 缩放。 */
export type ResultSize = 'sm' | 'md' | 'lg';

/** status → tone:语义结果直接对应,HTTP 异常按性质归色(404 信息缺失=info、403 警告、500 危险)。 */
const STATUS_TONE: Record<ResultStatus, ResultTone> = {
  success: 'success',
  error: 'danger',
  info: 'info',
  warning: 'warning',
  '404': 'info',
  '403': 'warning',
  '500': 'danger',
};

/** status → 默认符文(可被 icon prop 覆盖;HTTP 异常默认用大号数字码,语义更直观)。 */
const STATUS_GLYPH: Record<ResultStatus, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
  '404': '404',
  '403': '403',
  '500': '500',
};

/**
 * status → 默认标题(中文字面量兜底,messages.ts 暂无 result.* key)。
 * 仅 HTTP 异常给默认标题(语义结果的标题应由调用方按业务给)。未列出的返回 undefined。
 */
const STATUS_DEFAULT_TITLE: Partial<Record<ResultStatus, string>> = {
  '404': '页面不存在',
  '403': '无权访问',
  '500': '服务器开小差了',
};

/** 取某 status 的默认 tone。 */
export const resolveTone = (status: ResultStatus): ResultTone => STATUS_TONE[status];

/** 取某 status 的默认符文。 */
export const resolveGlyph = (status: ResultStatus): string => STATUS_GLYPH[status];

/** 取某 status 的默认标题(无则 undefined)。 */
export const resolveDefaultTitle = (status: ResultStatus): string | undefined =>
  STATUS_DEFAULT_TITLE[status];

/** HTTP 异常码(默认符文是纯数字,样式上需缩小字号、加单等宽)。 */
export const isHttpStatus = (status: ResultStatus): boolean =>
  status === '404' || status === '403' || status === '500';
