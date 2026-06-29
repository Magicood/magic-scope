import { useSyncExternalStore } from 'react';

export interface CartLine {
  id: string;
  name: string;
  /** 规格描述,如「250g · 中度 · 整豆」。 */
  variant: string;
  /** 单价(分)。 */
  price: number;
  qty: number;
  accent: string;
}

type Listener = () => void;

/** 极简全局购物车 store(模块级单例 + useSyncExternalStore 订阅)。 */
const lines = new Map<string, CartLine>();
const listeners = new Set<Listener>();
let snapshot: CartLine[] = [];

function emit(): void {
  snapshot = [...lines.values()];
  for (const l of listeners) l();
}

function subscribe(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function addToCart(item: Omit<CartLine, 'qty'>, qty = 1): void {
  const existing = lines.get(item.id);
  if (existing) {
    existing.qty += qty;
  } else {
    lines.set(item.id, { ...item, qty });
  }
  emit();
}

export function setQty(id: string, qty: number): void {
  const line = lines.get(id);
  if (!line) return;
  if (qty <= 0) {
    lines.delete(id);
  } else {
    line.qty = qty;
  }
  emit();
}

export function removeFromCart(id: string): void {
  lines.delete(id);
  emit();
}

export function clearCart(): void {
  lines.clear();
  emit();
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}

export function cartCount(items: CartLine[]): number {
  return items.reduce((sum, l) => sum + l.qty, 0);
}

export function cartSubtotal(items: CartLine[]): number {
  return items.reduce((sum, l) => sum + l.price * l.qty, 0);
}
