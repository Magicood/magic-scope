/* ============================================================================
 * Daybreak 商品目录与文案单一真相源。
 * 语气:温暖、考究、克制(精品食品零售那一脉),不堆形容词、不中二。
 * 价格用「分」存,展示时用 formatPrice 转 ¥。
 * ========================================================================== */

export const brand = {
  name: 'Daybreak',
  zh: '昼起咖啡',
  tagline: '为每一个清晨,认真烘一炉好豆',
  intro:
    '我们与产地小农直接合作,小批量当日烘焙,只在风味最好的窗口期把豆子寄到你手中。从单品到拼配,从器具到订阅,陪你把每天的第一杯做好。',
} as const;

export type Category = 'single' | 'blend' | 'gear' | 'subscription';
export type Roast = 'light' | 'medium' | 'medium-dark' | 'dark';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: Category;
  type: 'bean' | 'gear';
  origin?: string;
  roast?: Roast;
  price: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  flavors: string[];
  blurb: string;
  description: string;
  /** 视觉强调色(用于手绘咖啡袋 / 器具卡渐变,非主题色)。 */
  accent: string;
  badge?: string;
  bestSeller?: boolean;
}

export const ROAST_LABEL: Record<Roast, string> = {
  light: '浅烘',
  medium: '中烘',
  'medium-dark': '中深烘',
  dark: '深烘',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  single: '单品豆',
  blend: '拼配豆',
  gear: '冲煮器具',
  subscription: '订阅',
};

export const products: Product[] = [
  {
    id: 'yirgacheffe',
    name: '耶加雪菲 · 科契尔',
    subtitle: '埃塞俄比亚 · 水洗',
    category: 'single',
    type: 'bean',
    origin: '埃塞俄比亚',
    roast: 'light',
    price: 8800,
    rating: 4.9,
    reviewCount: 214,
    flavors: ['柑橘', '茉莉', '蜂蜜'],
    blurb: '明亮的柑橘酸质,尾段是清透的茉莉花香。',
    description:
      '来自科契尔产区海拔 2000 米的小农批次,水洗处理。浅烘保留了它标志性的柑橘明亮度与花香,温度下降后甜感更突出,是手冲入门到进阶都很难出错的一支。',
    accent: '#c8923f',
    badge: '本周精选',
    bestSeller: true,
  },
  {
    id: 'huila',
    name: '薇拉 · 粉红波旁',
    subtitle: '哥伦比亚 · 日晒',
    category: 'single',
    type: 'bean',
    origin: '哥伦比亚',
    roast: 'medium',
    price: 9600,
    rating: 4.8,
    reviewCount: 156,
    flavors: ['红糖', '热带水果', '可可'],
    blurb: '日晒带来饱满的发酵果香与圆润红糖甜。',
    description:
      '粉红波旁品种,日晒处理放大了热带水果的层次。中烘让它在保留果香的同时多了一层可可与红糖的厚实,牛奶也很好搭。',
    accent: '#b15c3a',
    bestSeller: true,
  },
  {
    id: 'kenya-aa',
    name: '肯尼亚 AA · 涅里',
    subtitle: '肯尼亚 · 水洗',
    category: 'single',
    type: 'bean',
    origin: '肯尼亚',
    roast: 'medium',
    price: 10200,
    rating: 4.7,
    reviewCount: 98,
    flavors: ['黑加仑', '番茄', '焦糖'],
    blurb: '浓郁的黑加仑酸甜,结构扎实有重量。',
    description:
      '涅里产区 AA 级豆,以鲜明的黑加仑与莓果调性著称。酸质强而有结构,适合喜欢「有存在感」的那杯人。',
    accent: '#8e3b34',
  },
  {
    id: 'geisha',
    name: '翡翠庄园 · 瑰夏',
    subtitle: '巴拿马 · 水洗',
    category: 'single',
    type: 'bean',
    origin: '巴拿马',
    roast: 'light',
    price: 28800,
    rating: 5.0,
    reviewCount: 47,
    flavors: ['佛手柑', '白桃', '蜜糖'],
    blurb: '传奇瑰夏,干净通透的花果香一路绵延。',
    description:
      '限量微批次,巴拿马翡翠庄园瑰夏。极浅烘焙,佛手柑与白桃的香气清晰而绵长,冷却后蜜糖甜感包裹整个口腔。适合用它好好犒劳一个慢下来的早晨。',
    accent: '#caa24a',
    badge: '限量微批次',
  },
  {
    id: 'house-blend',
    name: '晨光拼配',
    subtitle: '招牌每日豆',
    category: 'blend',
    type: 'bean',
    origin: '拼配',
    roast: 'medium',
    price: 6800,
    compareAt: 7800,
    rating: 4.8,
    reviewCount: 432,
    flavors: ['坚果', '焦糖', '可可'],
    blurb: '坚果与焦糖的平衡甜感,手冲意式都顺手。',
    description:
      '我们最受欢迎的日常豆,中美洲与南美豆的均衡拼配。坚果、焦糖、可可的圆润甜感,黑着喝顺、加奶也稳,是大多数人桌上那罐「随手就能冲」的豆子。',
    accent: '#9a6536',
    bestSeller: true,
  },
  {
    id: 'midnight',
    name: '暗夜浓缩',
    subtitle: '意式拼配',
    category: 'blend',
    type: 'bean',
    origin: '拼配',
    roast: 'dark',
    price: 7200,
    rating: 4.6,
    reviewCount: 287,
    flavors: ['黑巧', '烤杏仁', '糖蜜'],
    blurb: '为意式而生,浓郁油脂与厚实的黑巧尾韵。',
    description:
      '深烘意式拼配,萃取出厚实的克丽玛与黑巧、糖蜜的醇厚。无论是浓缩还是奶咖,都能稳稳压住牛奶,给你一杯有重量的咖啡。',
    accent: '#4f3322',
  },
  {
    id: 'decaf',
    name: '安睡低因',
    subtitle: '瑞士水处理',
    category: 'blend',
    type: 'bean',
    origin: '拼配',
    roast: 'medium-dark',
    price: 7600,
    rating: 4.7,
    reviewCount: 121,
    flavors: ['焦糖', '红枣', '可可'],
    blurb: '99.9% 脱因,却不丢风味的安心之选。',
    description:
      '采用瑞士水处理脱因,保留了焦糖与红枣的甜厚。下午或睡前想来一杯又不想被咖啡因打扰时,它是最体贴的那一支。',
    accent: '#6b4a36',
  },
  {
    id: 'v60',
    name: 'V60 手冲滤杯',
    subtitle: '陶瓷 · 02 号',
    category: 'gear',
    type: 'gear',
    price: 12800,
    rating: 4.9,
    reviewCount: 176,
    flavors: ['锥形', '螺旋导流', '陶瓷'],
    blurb: '经典锥形滤杯,流速稳定、上手友好。',
    description:
      '陶瓷材质保温更好,经典锥形与螺旋肋骨设计让萃取均匀稳定。配套滤纸即可开冲,是大多数人手冲旅程的起点。',
    accent: '#7d8c6b',
  },
  {
    id: 'grinder',
    name: '手摇磨豆机',
    subtitle: '不锈钢锥刀',
    category: 'gear',
    type: 'gear',
    price: 36800,
    compareAt: 42800,
    rating: 4.8,
    reviewCount: 89,
    flavors: ['锥刀', '可调档', '便携'],
    blurb: '现磨现冲,均匀度与便携兼顾。',
    description:
      '不锈钢锥形磨芯,外置可调档位,从手冲到意式都能覆盖。机身紧凑,在家、出差都能现磨那一杯新鲜。',
    accent: '#5f6f7d',
  },
  {
    id: 'kettle',
    name: '细口手冲壶',
    subtitle: '温控 · 0.8L',
    category: 'gear',
    type: 'gear',
    price: 45800,
    rating: 4.9,
    reviewCount: 64,
    flavors: ['温控', '细口', '鹅颈'],
    blurb: '精准控温与水流,稳定每一次注水。',
    description:
      '鹅颈细口设计让注水更可控,数字温控可设定到 1℃。从闷蒸到绕圈,水流稳了,风味自然更干净。',
    accent: '#3f4a52',
  },
];

export interface Review {
  name: string;
  initials: string;
  rating: number;
  date: string;
  body: string;
}

export const reviews: Review[] = [
  {
    name: '林晚',
    initials: '晚',
    rating: 5,
    date: '2 周前',
    body: '耶加雪菲一开袋就是满屋花香,水温稍微压低一点酸质特别干净,已经回购第三次了。',
  },
  {
    name: 'Theo',
    initials: 'T',
    rating: 5,
    date: '1 个月前',
    body: '晨光拼配真的很「日常」,黑喝加奶都好,关键是每次到手都很新鲜,烘焙日期就在最近几天。',
  },
  {
    name: '周野',
    initials: '野',
    rating: 4,
    date: '1 个月前',
    body: '磨豆机均匀度不错,手感扎实。唯一小缺点是高档位手摇稍费力,但这个价位很值。',
  },
  {
    name: 'Mira',
    initials: 'M',
    rating: 5,
    date: '2 个月前',
    body: '订阅了三个月,每月换不同产区,像收盲盒一样期待。包装和卡片都很用心。',
  },
];

export const weightOptions = [
  { value: '250', label: '250g' },
  { value: '500', label: '500g' },
  { value: '1000', label: '1kg' },
];

/** 不同克重的价格系数(250g 为基准价)。 */
export const weightMultiplier: Record<string, number> = {
  '250': 1,
  '500': 1.85,
  '1000': 3.4,
};

export const grindOptions = [
  { value: 'whole', label: '整豆' },
  { value: 'filter', label: '手冲(中细)' },
  { value: 'espresso', label: '意式(细)' },
  { value: 'frenchpress', label: '法压(粗)' },
];

export const subscription = {
  title: '每月一炉,新鲜直达',
  body: '每月精选一支当季产区豆,当日烘焙后直接寄到你家。随时可暂停或更换,首单立享 8 折。',
  perks: ['每月轮换当季产区', '当日烘焙 · 顺丰冷链', '随时暂停 / 取消', '订阅专属冲煮卡片'],
  priceMonthly: 6800,
  priceFirst: 5440,
} as const;

export const flavorFilters = ['柑橘', '花香', '莓果', '坚果', '焦糖', '可可', '热带水果'];

export const trust = [
  '当日新鲜烘焙',
  '产地直采',
  '顺丰冷链配送',
  '30 天风味无忧',
  '满 ¥199 包邮',
  '订阅享 8 折',
];

export const story = {
  eyebrow: '我们的理念',
  title: '好咖啡,从尊重每一颗豆子开始',
  paragraphs: [
    '我们相信,一杯好咖啡的风味,八成在它到达烘焙机之前就决定了。所以我们花最多的时间在产地——和小农一起挑选批次、改进处理法,按公平的价格直接采购。',
    '豆子到店后,我们只做小批量烘焙,并把烘焙日期清楚印在每一袋上。因为咖啡是有「赏味窗口」的,我们希望你喝到的,永远是它最好的那几天。',
  ],
  stats: [
    { value: '12', label: '合作产区庄园' },
    { value: '当日', label: '小批量烘焙' },
    { value: '48h', label: '烘焙后发出' },
  ],
} as const;

export const footer = {
  columns: [
    { title: '选购', links: ['单品豆', '拼配豆', '冲煮器具', '每月订阅', '礼品卡'] },
    { title: '了解', links: ['我们的故事', '冲煮指南', '产区地图', '可持续承诺', '常见问题'] },
    { title: '服务', links: ['配送与签收', '退换政策', '会员计划', '企业采购', '联系我们'] },
  ],
  copyright: '© 2026 Daybreak 昼起咖啡 · 用 @magic-scope 组件库构建',
} as const;

const priceFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 分 → ¥ 展示(整数元)。 */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
