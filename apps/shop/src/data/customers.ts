import type { Customer } from './types';

/* 占位:由 wave-1 数据 agent 生成 ~30 位客户。 */

export const customers: Customer[] = [];

export function getCustomer(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}
