import { scale } from '../primitive/scale';

/**
 * dark / light 主题共享的非颜色 token(尺寸 / 排版 / 动效)。
 * 明暗只切颜色,这些轴不变(随密度由 engine 用 calc 缩放,见 DESIGN.md §5.6)。
 */
export const sharedDimension = {
  radius: {
    sm: scale.radius.sm,
    md: scale.radius.md,
    lg: scale.radius.lg,
    full: scale.radius.full,
  },
  space: {
    0: scale.space[0],
    1: scale.space[1],
    2: scale.space[2],
    3: scale.space[3],
    4: scale.space[4],
    5: scale.space[5],
    6: scale.space[6],
    7: scale.space[7],
    8: scale.space[8],
    9: scale.space[9],
    10: scale.space[10],
    12: scale.space[12],
    16: scale.space[16],
  },
};

export const sharedTypography = {
  fontSans: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  fontDisplay: "'Cinzel', 'Cormorant Garamond', Georgia, serif",
  fontMono: "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace",
};

export const sharedMotion = {
  durationFast: scale.duration.fast,
  durationBase: scale.duration.base,
  easingStandard: scale.easing.standard,
  easingEmphasized: scale.easing.cast,
};
