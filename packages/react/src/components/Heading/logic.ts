/**
 * Heading 纯逻辑 —— 零 React 依赖(框架无关,将来可平移 core)。
 *
 * 只放「不依赖 React/DOM」的派生:语义标签解析、anchor id 的 slug 化、
 * variant → 默认排版档的映射。组件壳只做渲染与留口合并。
 */

import type { ReactNode } from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
/** 视觉档(与语义 level 解耦,MUI 式):display 巨标题 / title 标题 / subtitle 副标题 / overline 上标签 / caption 说明。 */
export type HeadingVariant = 'display' | 'title' | 'subtitle' | 'overline' | 'caption';

/** level → 语义标签名(h1–h6)。 */
export const levelTag = (level: HeadingLevel): 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' =>
  `h${level}` as const;

/**
 * 把 ReactNode 拍平成纯文本(用于无显式 id 时从标题内容派生 anchor id)。
 * 只处理 string/number 与可枚举 children;函数/元素属性不深挖(SSR 安全、零 DOM 依赖)。
 */
export const nodeToText = (node: ReactNode): string => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join('');
  if (typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return props ? nodeToText(props.children) : '';
  }
  return '';
};

/**
 * slug 化:生成 URL/锚点友好的 id。
 * - 统一小写、空白与下划线转连字符;
 * - 去掉无法进 id 的标点,但**保留 CJK 等 Unicode 字母**(中文标题也能有可读锚点);
 * - 折叠连续连字符、去首尾连字符。
 */
export const slugify = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    // 仅去掉「非字母数字、非连字符」的字符;\p{L}\p{N} 覆盖 CJK/重音等 Unicode
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * 解析最终 anchor id:
 * - 显式 `id`(原生属性)优先;
 * - 否则 anchor 为字符串 → 直接当 id(已是作者指定 slug);
 * - 否则从标题文本派生 slug;空文本回退 undefined(不强造无意义 id)。
 */
export const resolveAnchorId = (
  explicitId: string | undefined,
  anchor: boolean | string | undefined,
  children: ReactNode,
): string | undefined => {
  if (explicitId) return explicitId;
  if (typeof anchor === 'string') return anchor.trim() || undefined;
  if (anchor) {
    const slug = slugify(nodeToText(children));
    return slug || undefined;
  }
  return undefined;
};
