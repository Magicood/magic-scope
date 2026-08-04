/* ============================================================================
 * Arden 数据模型 —— 买家端与商家控制台共用的领域类型。
 * mock 数据即"后端":products/orders/customers 三份静态数据源,页面只读或本地态改。
 * ========================================================================== */

export type CategoryId = 'ceramics' | 'lighting' | 'textiles' | 'objects';

export interface Category {
  id: CategoryId;
  label: string;
  blurb: string;
}

/** 艺术化商品视觉的规格 —— 不用位图,由 ProductVisual 以分层渐变 + 形体 + 颗粒噪点绘制。 */
export interface ProductVisualSpec {
  /** 色场底色(浅调)。 */
  field: string;
  /** 色场次色(与底色做柔和渐变)。 */
  tint: string;
  /** 形体主色(器物本体)。 */
  body: string;
  /** 形体暗部色(塑造体积)。 */
  shade: string;
  /** 形体构图:球体/拱形/圆柱/叠盘/织物卷/浅盘。 */
  shape: 'sphere' | 'arch' | 'cylinder' | 'stack' | 'roll' | 'disc';
}

export interface Colorway {
  id: string;
  label: string;
  /** 色板圆点的 CSS 颜色。 */
  swatch: string;
}

export type ProductBadge = 'new' | 'bestseller' | 'limited';

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  /** 单价(美元,整数)。 */
  price: number;
  /** 划线价(可选,少数在售促销)。 */
  compareAt?: number;
  /** 一句话卖点(列表卡与详情页头)。 */
  tagline: string;
  /** 详情页正文(2-3 句,克制的品牌文案)。 */
  description: string;
  /** 材质 / 尺寸等规格要点。 */
  details: string[];
  /** 养护说明。 */
  care: string[];
  colorways: Colorway[];
  visual: ProductVisualSpec;
  rating: number;
  reviews: number;
  stock: number;
  badges?: ProductBadge[];
  /** 首页精选位。 */
  featured?: boolean;
}

/* ----------------------------- 订单(双端共用) ---------------------------- */

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'fulfilled'
  | 'shipped'
  | 'delivered'
  | 'refunded'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  colorwayId: string;
  qty: number;
  /** 下单时单价快照。 */
  unitPrice: number;
}

export interface OrderEvent {
  at: string;
  label: string;
  done: boolean;
}

export interface Order {
  id: string;
  /** 展示编号,如 AR-1042。 */
  number: string;
  customerId: string;
  placedAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingMethod: 'standard' | 'express';
  destination: string;
  /** 物流 / 履约时间线(买家端 Timeline 与后台详情共用)。 */
  timeline: OrderEvent[];
  note?: string;
}

/* --------------------------------- 客户 ---------------------------------- */

export type CustomerTier = 'new' | 'member' | 'vip';

export interface Customer {
  id: string;
  name: string;
  email: string;
  location: string;
  joinedAt: string;
  orders: number;
  spent: number;
  tier: CustomerTier;
  marketingOptIn: boolean;
}
