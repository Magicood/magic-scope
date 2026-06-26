// rateStep 已由 Rate.tsx 透出(避免与本处 re-export 撞名 TS2308),此处补齐其余纯逻辑导出。
export {
  clampRate,
  fillStateAt,
  type RateFillState,
  resolveClickValue,
  starOrdinal,
  stepValue,
  valueFromPointer,
} from './logic';
export * from './Rate';
