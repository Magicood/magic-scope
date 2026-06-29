// 注:WeekStart 类型不在此 barrel 透出,避免与 DatePicker 同名导出在库根 index 撞名(TS2308);
// 需要时从 @magic-scope/react 已有的 DatePicker 处取同义 WeekStart,或直接用 0..6 字面量。
export type {
  CalendarCellInfo,
  CalendarClassNames,
  CalendarMode,
  CalendarProps,
  CalendarSize,
  DateTuple,
} from './Calendar';
export { Calendar } from './Calendar';
