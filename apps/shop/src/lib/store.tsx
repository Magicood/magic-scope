import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getProduct } from '../data/products';

/* ============================================================================
 * 购物车 store —— React context + localStorage,无第三方状态库。
 * 行以 productId+colorwayId 为键;抽屉开合也放这里(页头/详情页/任意处可触发)。
 * ========================================================================== */

export interface CartLine {
  productId: string;
  colorwayId: string;
  qty: number;
}

export interface CartLineDetail extends CartLine {
  name: string;
  colorwayLabel: string;
  unitPrice: number;
  lineTotal: number;
}

interface CartContextValue {
  lines: CartLine[];
  detailed: CartLineDetail[];
  count: number;
  subtotal: number;
  add: (productId: string, colorwayId: string, qty?: number) => void;
  setQty: (productId: string, colorwayId: string, qty: number) => void;
  remove: (productId: string, colorwayId: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'arden.cart';

function loadLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return parsed.filter((l) => getProduct(l.productId) != null && l.qty > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadLines);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* 持久化失败可忽略 */
    }
  }, [lines]);

  const add = useCallback((productId: string, colorwayId: string, qty = 1) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === productId && l.colorwayId === colorwayId);
      if (idx === -1) return [...prev, { productId, colorwayId, qty }];
      return prev.map((l, i) => (i === idx ? { ...l, qty: l.qty + qty } : l));
    });
  }, []);

  const setQty = useCallback((productId: string, colorwayId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.productId === productId && l.colorwayId === colorwayId))
        : prev.map((l) =>
            l.productId === productId && l.colorwayId === colorwayId ? { ...l, qty } : l,
          ),
    );
  }, []);

  const remove = useCallback((productId: string, colorwayId: string) => {
    setLines((prev) =>
      prev.filter((l) => !(l.productId === productId && l.colorwayId === colorwayId)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const detailed: CartLineDetail[] = lines.flatMap((l) => {
      const p = getProduct(l.productId);
      if (!p) return [];
      const colorway = p.colorways.find((c) => c.id === l.colorwayId);
      return [
        {
          ...l,
          name: p.name,
          colorwayLabel: colorway?.label ?? '',
          unitPrice: p.price,
          lineTotal: p.price * l.qty,
        },
      ];
    });
    const subtotal = detailed.reduce((sum, l) => sum + l.lineTotal, 0);
    const count = detailed.reduce((sum, l) => sum + l.qty, 0);
    return {
      lines,
      detailed,
      count,
      subtotal,
      add,
      setQty,
      remove,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
    };
  }, [lines, drawerOpen, add, setQty, remove, clear, openDrawer, closeDrawer]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart 必须在 CartProvider 内使用');
  return ctx;
}
