import type { Order } from './types';

/* 占位:由 wave-1 数据 agent 生成 ~45 条真实感订单(供后台 Table 与买家跟踪页)。 */

export const orders: Order[] = [];

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id || o.number === id);
}

/** 买家端订单跟踪演示用的固定订单(结算完成后跳转至此)。 */
export const DEMO_ORDER_ID = 'ar-2001';
