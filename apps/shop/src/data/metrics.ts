/* 占位:由 wave-1 数据 agent 生成后台总览指标与近 30 天走势。 */

export interface DailyPoint {
  date: string;
  revenue: number;
  orders: number;
}

export const revenueSeries: DailyPoint[] = [];

export const overviewStats = {
  revenue30d: 0,
  orders30d: 0,
  aov: 0,
  repeatRate: 0,
  fulfillmentHours: 0,
  conversion: 0,
};
