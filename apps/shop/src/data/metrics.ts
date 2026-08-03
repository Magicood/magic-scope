/* ============================================================================
 * Arden 后台指标数据 —— 近 30 天营收走势 + 总览统计(Overview 页消费)。
 *
 * 形态说明:
 * - revenueSeries:2026-07-05 ~ 2026-08-03 共 30 个点,全部手写字面量;
 *   revenue 940 ~ 2905 平滑爬升,周末(周六/周日)明显回落,
 *   orders 与 revenue 大致同形(单均 ≈ 140);
 * - overviewStats:revenue30d / orders30d 为 series 手工加总
 *   (55550 / 395,已逐周核算),aov = 55550 ÷ 395 ≈ 140.6 → 四舍五入 141。
 * ========================================================================== */

export interface DailyPoint {
  date: string;
  revenue: number;
  orders: number;
}

export const revenueSeries: DailyPoint[] = [
  { date: '2026-07-05', revenue: 980, orders: 7 },
  { date: '2026-07-06', revenue: 1420, orders: 10 },
  { date: '2026-07-07', revenue: 1560, orders: 11 },
  { date: '2026-07-08', revenue: 1680, orders: 12 },
  { date: '2026-07-09', revenue: 1545, orders: 11 },
  { date: '2026-07-10', revenue: 1760, orders: 13 },
  { date: '2026-07-11', revenue: 1120, orders: 8 },
  { date: '2026-07-12', revenue: 940, orders: 6 },
  { date: '2026-07-13', revenue: 1610, orders: 12 },
  { date: '2026-07-14', revenue: 1780, orders: 13 },
  { date: '2026-07-15', revenue: 1935, orders: 14 },
  { date: '2026-07-16', revenue: 1820, orders: 13 },
  { date: '2026-07-17', revenue: 2040, orders: 15 },
  { date: '2026-07-18', revenue: 1260, orders: 9 },
  { date: '2026-07-19', revenue: 1080, orders: 7 },
  { date: '2026-07-20', revenue: 1890, orders: 14 },
  { date: '2026-07-21', revenue: 2110, orders: 15 },
  { date: '2026-07-22', revenue: 2260, orders: 16 },
  { date: '2026-07-23', revenue: 2180, orders: 16 },
  { date: '2026-07-24', revenue: 2350, orders: 17 },
  { date: '2026-07-25', revenue: 1440, orders: 10 },
  { date: '2026-07-26', revenue: 1310, orders: 9 },
  { date: '2026-07-27', revenue: 2420, orders: 17 },
  { date: '2026-07-28', revenue: 2585, orders: 18 },
  { date: '2026-07-29', revenue: 2730, orders: 19 },
  { date: '2026-07-30', revenue: 2660, orders: 19 },
  { date: '2026-07-31', revenue: 2875, orders: 20 },
  { date: '2026-08-01', revenue: 1720, orders: 12 },
  { date: '2026-08-02', revenue: 1585, orders: 11 },
  { date: '2026-08-03', revenue: 2905, orders: 21 },
];

export const overviewStats = {
  /** series 收入加总(逐周核算:10065 + 11385 + 13310 + 16300 + 4490)。 */
  revenue30d: 55550,
  /** series 订单加总(72 + 82 + 95 + 114 + 32)。 */
  orders30d: 395,
  /** 客单价 = 55550 ÷ 395 ≈ 140.6,四舍五入。 */
  aov: 141,
  repeatRate: 0.34,
  fulfillmentHours: 22,
  conversion: 0.021,
};
