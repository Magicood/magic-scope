/**
 * Affix 纯逻辑 —— 零 React 依赖,可平移进 core(vue / web-component 等共用同一吸附判定)。
 *
 * 「该不该吸、吸成什么样」是一个纯函数:给定被吸元素当前几何(rect)、滚动容器几何(containerRect)、
 * 当前滚动位置与吸顶 / 吸底偏移,推出 affixed / mode / 需要写到 DOM 的内联 style。
 * DOM 副作用(读 getBoundingClientRect、写 style、加 placeholder)留在组件壳层,这里只做计算,便于单测。
 */

/** 吸附模式:吸顶 / 吸底 / 不吸。 */
export type AffixMode = 'top' | 'bottom' | 'none';

/** 计算所需的几何最小契约(只取用到的字段,便于在测试里手搓)。 */
export interface AffixRect {
  /** 元素相对视口的上沿(getBoundingClientRect().top)。 */
  top: number;
  /** 元素相对视口的左沿(用于固定时对齐水平位置)。 */
  left: number;
  /** 元素宽度(固定后用它锁宽,防止脱离文档流后塌缩)。 */
  width: number;
  /** 元素高度(吸底判定与 placeholder 占位用)。 */
  height: number;
}

/** 滚动容器(window 时传视口矩形)相对视口的几何。 */
export interface AffixContainerRect {
  /** 容器视口上沿(window 容器为 0)。 */
  top: number;
  /** 容器视口左沿(window 容器为 0)。 */
  left: number;
  /** 容器视口宽度。 */
  width: number;
  /** 容器视口高度(window 容器为 innerHeight)。 */
  height: number;
}

/** computeAffix 入参。offsetTop / offsetBottom 至多给一个(都给以 offsetTop 优先,吸顶生效)。 */
export interface ComputeAffixInput {
  /** 被吸元素当前相对视口几何。 */
  rect: AffixRect;
  /** 滚动容器相对视口几何(window 容器为 {top:0,left:0,width:innerWidth,height:innerHeight})。 */
  containerRect: AffixContainerRect;
  /** 当前滚动位置(容器 scrollTop,仅用于触底/触顶语义判断;几何已用 rect 表达,可不依赖)。 */
  scrollTop: number;
  /** 距容器顶部多少 px 时吸顶(给了即启用吸顶)。 */
  offsetTop?: number | undefined;
  /** 距容器底部多少 px 时吸底(仅在未给 offsetTop 时生效)。 */
  offsetBottom?: number | undefined;
}

/** 固定时写到元素上的内联样式(组件直接 spread 进 style)。 */
export interface AffixStyle {
  /** 'fixed' 表示已吸附脱流;undefined 表示不吸(交还文档流)。 */
  position?: 'fixed' | undefined;
  /** 吸顶时的 top(px)。 */
  top?: number | undefined;
  /** 吸底时的 bottom 等价 top(以 fixed 相对视口换算,见实现)。 */
  bottom?: number | undefined;
  /** 固定后锁定的宽度(px)。 */
  width?: number | undefined;
  /** 固定后锁定的左沿(px,相对视口)。 */
  left?: number | undefined;
}

/** computeAffix 结果。 */
export interface AffixResult {
  /** 是否处于吸附态。 */
  affixed: boolean;
  /** 吸附模式。 */
  mode: AffixMode;
  /** 需写到被吸元素的内联样式(不吸为空对象)。 */
  style: AffixStyle;
}

/** 未吸附时的结果常量(交还文档流)。 */
const NOT_AFFIXED: AffixResult = { affixed: false, mode: 'none', style: {} };

/**
 * computeAffix —— 吸附判定纯函数。
 *
 * 吸顶(给了 offsetTop):元素上沿相对容器顶的距离 = rect.top - containerRect.top,
 * 一旦 <= offsetTop,说明它将滚出/触及吸附线,固定到「容器顶 + offsetTop」处(window 容器即视口 offsetTop)。
 *
 * 吸底(未给 offsetTop、给了 offsetBottom):元素下沿相对容器底的距离
 * = containerBottom - rect.bottom,一旦 <= offsetBottom,固定到「容器底 - offsetBottom - 元素高」处。
 *
 * 固定后用 fixed 定位,锁定 width / left(相对视口),并把 top 折算到视口坐标系:
 * 吸顶 fixedTop = containerRect.top + offsetTop;吸底 fixedTop = containerBottom - offsetBottom - height。
 * 同时给出语义化的 bottom(吸底场景便于样式层使用)。
 */
export function computeAffix(input: ComputeAffixInput): AffixResult {
  const { rect, containerRect, offsetTop, offsetBottom } = input;
  const containerTop = containerRect.top;
  const containerBottom = containerRect.top + containerRect.height;

  // 吸顶优先:offsetTop 显式给出(含 0)即启用
  if (offsetTop !== undefined) {
    const distanceToTop = rect.top - containerTop;
    if (distanceToTop <= offsetTop) {
      const fixedTop = containerTop + offsetTop;
      return {
        affixed: true,
        mode: 'top',
        style: {
          position: 'fixed',
          top: fixedTop,
          left: rect.left,
          width: rect.width,
        },
      };
    }
    return NOT_AFFIXED;
  }

  // 吸底:仅当未给 offsetTop 且给了 offsetBottom
  if (offsetBottom !== undefined) {
    const elementBottom = rect.top + rect.height;
    const distanceToBottom = containerBottom - elementBottom;
    if (distanceToBottom <= offsetBottom) {
      const fixedTop = containerBottom - offsetBottom - rect.height;
      return {
        affixed: true,
        mode: 'bottom',
        style: {
          position: 'fixed',
          top: fixedTop,
          bottom: offsetBottom,
          left: rect.left,
          width: rect.width,
        },
      };
    }
    return NOT_AFFIXED;
  }

  // 既没 offsetTop 也没 offsetBottom:默认吸顶到 0
  const distanceToTop = rect.top - containerTop;
  if (distanceToTop <= 0) {
    return {
      affixed: true,
      mode: 'top',
      style: {
        position: 'fixed',
        top: containerTop,
        left: rect.left,
        width: rect.width,
      },
    };
  }
  return NOT_AFFIXED;
}

/**
 * 读取滚动容器(Window 或元素)当前的 scrollTop;对 Window 取 scrollY/pageYOffset,SSR/缺失安全归 0。
 * 与 BackTop 同款语义,壳层用它取 scrollTop 喂给 computeAffix(纯几何已够,scrollTop 仅作语义补充)。
 */
export function getScrollTop(target: Window | HTMLElement): number {
  if ('document' in target) {
    return target.scrollY ?? target.pageYOffset ?? target.document?.documentElement?.scrollTop ?? 0;
  }
  return target.scrollTop;
}
