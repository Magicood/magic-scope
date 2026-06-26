/**
 * Link 纯逻辑 —— 零 React 依赖,可平移进 packages/core。
 *
 * 把「外链安全属性派生」「禁用态属性派生」「rel 合并去重」这些与渲染无关的决策抽成纯函数,
 * 既便于单测,也为后续 vue / web-component 壳复用同一套语义(多框架对等)。
 */

/** 外链默认 rel 安全令牌:防 reverse-tabnabbing + 不泄露 referrer。 */
export const EXTERNAL_REL_TOKENS = ['noopener', 'noreferrer'] as const;

/**
 * 合并 rel:把外链安全令牌并入用户已写的 rel,去重且保序(用户原有令牌在前)。
 * 用户已显式写了某令牌时不重复追加。返回 undefined 表示无需设置 rel。
 */
export function mergeRel(
  userRel: string | undefined,
  addTokens: readonly string[],
): string | undefined {
  const existing = userRel ? userRel.split(/\s+/).filter(Boolean) : [];
  const seen = new Set(existing);
  const merged = [...existing];
  for (const token of addTokens) {
    if (!seen.has(token)) {
      seen.add(token);
      merged.push(token);
    }
  }
  return merged.length > 0 ? merged.join(' ') : undefined;
}

/** 外链补全的属性(target / rel),供组件合并到根 <a> 上;不覆盖用户显式给的 target。 */
export interface ExternalAnchorProps {
  target: string | undefined;
  rel: string | undefined;
}

/**
 * 派生外链属性:external 时补 target=_blank(用户已显式给 target 则尊重用户)与安全 rel。
 * 非外链时只把用户 rel 原样回传(不强加任何令牌)。
 */
export function resolveExternalProps(
  external: boolean,
  userTarget: string | undefined,
  userRel: string | undefined,
): ExternalAnchorProps {
  if (!external) {
    return { target: userTarget, rel: userRel };
  }
  return {
    target: userTarget ?? '_blank',
    rel: mergeRel(userRel, EXTERNAL_REL_TOKENS),
  };
}

/** 禁用态在 <a> 上需要落地的属性(<a> 无原生 disabled,用 ARIA + 去交互模拟)。 */
export interface DisabledAnchorProps {
  /** 去掉 href —— 没有 href 的 <a> 不可点击、不参与 Tab 序、无链接角色。 */
  href: string | undefined;
  'aria-disabled': true;
  /** 强制移出 Tab 序(防用户传入正 tabIndex)。 */
  tabIndex: -1;
  role: 'link';
}

/**
 * 禁用态属性:<a> 没有原生 disabled,用「去 href + aria-disabled + tabIndex=-1」综合模拟。
 * 保留 role=link 让读屏仍报为(被禁用的)链接,而非退化成纯文本。
 */
export function resolveDisabledProps(): DisabledAnchorProps {
  return {
    href: undefined,
    'aria-disabled': true,
    tabIndex: -1,
    role: 'link',
  };
}
