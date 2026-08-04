import type { Category, Product } from './types';

/* ============================================================================
 * Arden 商品目录 —— 家居器物工作室:陶瓷 / 灯具 / 织物 / 器物 四类 12 款。
 * 文案基调:克制、编辑式,不堆形容词(对标 Aesop / Everlane 的产品页语气)。
 * 视觉:每款一组低饱和色场 + 形体构图,由 ProductVisual 绘制,绝不用 clip-art。
 * ========================================================================== */

export const categories: Category[] = [
  { id: 'ceramics', label: 'Ceramics', blurb: 'Thrown and glazed in small batches.' },
  { id: 'lighting', label: 'Lighting', blurb: 'Warm light, quiet forms.' },
  { id: 'textiles', label: 'Textiles', blurb: 'Woven from traceable natural fibre.' },
  { id: 'objects', label: 'Objects', blurb: 'Small tools for daily rituals.' },
];

export const products: Product[] = [
  /* -------------------------------- Ceramics ------------------------------- */
  {
    id: 'duna-vase',
    name: 'Duna Vase',
    category: 'ceramics',
    price: 148,
    tagline: 'A soft arch in matte sandstone.',
    description:
      'Thrown from a single piece of stoneware, the Duna holds its curve without ornament. The matte glaze keeps light close to the surface, so the form reads in shadow rather than shine.',
    details: [
      'Stoneware, matte mineral glaze',
      'H 28 cm · Ø 14 cm',
      'Watertight; suitable for fresh stems',
      'Each piece varies slightly',
    ],
    care: ['Rinse by hand with warm water', 'Avoid abrasive cleaners'],
    colorways: [
      { id: 'sand', label: 'Sand', swatch: '#D8C6AB' },
      { id: 'clay', label: 'Clay', swatch: '#B98D72' },
      { id: 'char', label: 'Charcoal', swatch: '#4C4742' },
    ],
    visual: { field: '#EBDFCC', tint: '#DECBAE', body: '#C3A57F', shade: '#8F7354', shape: 'arch' },
    rating: 4.8,
    reviews: 214,
    stock: 36,
    badges: ['bestseller'],
    featured: true,
  },
  {
    id: 'meno-carafe',
    name: 'Meno Carafe',
    category: 'ceramics',
    price: 86,
    tagline: 'Table water, poured slowly.',
    description:
      'A narrow neck and a generous body. The Meno sits at the centre of the table and pours without a drip — the small satisfactions that make an object stay.',
    details: ['Porcelain, clear glaze interior', 'H 24 cm · 1.1 L', 'Dishwasher safe'],
    care: ['Dishwasher safe on gentle cycle'],
    colorways: [
      { id: 'chalk', label: 'Chalk', swatch: '#E9E4DA' },
      { id: 'moss', label: 'Moss', swatch: '#8A9B84' },
    ],
    visual: {
      field: '#E4E7DE',
      tint: '#D2DACB',
      body: '#A9B8A1',
      shade: '#77876F',
      shape: 'cylinder',
    },
    rating: 4.6,
    reviews: 98,
    stock: 52,
  },
  {
    id: 'orbe-bowls',
    name: 'Orbe Bowl Set',
    category: 'ceramics',
    price: 124,
    compareAt: 152,
    tagline: 'Four bowls that nest to nothing.',
    description:
      'Four sizes, one silhouette. Stacked, they take the footprint of a single bowl; separated, they cover breakfast to serving. Glazed inside, raw outside.',
    details: ['Stoneware, partial glaze', 'Ø 12 / 15 / 18 / 22 cm', 'Set of four'],
    care: ['Dishwasher safe', 'Unglazed base — dry before stacking'],
    colorways: [
      { id: 'oat', label: 'Oat', swatch: '#E2D5BF' },
      { id: 'terra', label: 'Terra', swatch: '#C07856' },
    ],
    visual: {
      field: '#F0E4D6',
      tint: '#E3CDB6',
      body: '#C98F6B',
      shade: '#96603F',
      shape: 'stack',
    },
    rating: 4.9,
    reviews: 167,
    stock: 21,
    badges: ['limited'],
  },
  /* -------------------------------- Lighting ------------------------------- */
  {
    id: 'halo-lamp',
    name: 'Halo Table Lamp',
    category: 'lighting',
    price: 320,
    tagline: 'A sphere of warm, dimmable light.',
    description:
      'An opal glass sphere on a weighted steel base. The Halo dims from reading light to a low evening glow with one slow turn — no apps, no steps, just a dial.',
    details: [
      'Opal glass, powder-coated steel',
      'H 34 cm · Ø 26 cm',
      'Integrated dimmer, 2700 K',
      'E27, bulb included',
    ],
    care: ['Wipe glass with a dry microfibre cloth'],
    colorways: [
      { id: 'cream', label: 'Cream', swatch: '#F1E8D8' },
      { id: 'umber', label: 'Umber', swatch: '#6B5546' },
    ],
    visual: {
      field: '#E9DED2',
      tint: '#F4E7CF',
      body: '#F6E9CE',
      shade: '#C9A87A',
      shape: 'sphere',
    },
    rating: 4.9,
    reviews: 312,
    stock: 14,
    badges: ['bestseller'],
    featured: true,
  },
  {
    id: 'ledge-sconce',
    name: 'Ledge Wall Sconce',
    category: 'lighting',
    price: 210,
    tagline: 'Indirect light from a quiet shelf.',
    description:
      'A folded steel ledge that washes the wall above it with light. Hardwired or plug-in — the cord channel keeps either install clean.',
    details: ['Powder-coated steel', 'W 30 cm · D 9 cm', '2700 K LED module, dimmable'],
    care: ['Dust with a soft brush'],
    colorways: [
      { id: 'bone', label: 'Bone', swatch: '#E6DFD2' },
      { id: 'ink', label: 'Ink', swatch: '#2A2724' },
    ],
    visual: { field: '#E6E2DA', tint: '#D9D2C4', body: '#B9AE9C', shade: '#847A69', shape: 'disc' },
    rating: 4.5,
    reviews: 74,
    stock: 40,
  },
  {
    id: 'mica-floor-lamp',
    name: 'Mica Floor Lamp',
    category: 'lighting',
    price: 420,
    tagline: 'A column of paper-soft light.',
    description:
      'A tall linen diffuser over a minimal frame. The Mica reads as architecture by day and as atmosphere by night. Designed to sit in corners and soften them.',
    details: ['Washed linen, oak base', 'H 128 cm · Ø 30 cm', 'Foot dimmer, 2700 K'],
    care: ['Vacuum diffuser with upholstery brush'],
    colorways: [{ id: 'natural', label: 'Natural', swatch: '#E8E0CF' }],
    visual: {
      field: '#EDE6D8',
      tint: '#E0D5BF',
      body: '#E9DFC8',
      shade: '#B3A281',
      shape: 'cylinder',
    },
    rating: 4.7,
    reviews: 121,
    stock: 9,
    badges: ['new'],
    featured: true,
  },
  /* -------------------------------- Textiles ------------------------------- */
  {
    id: 'field-throw',
    name: 'Field Throw',
    category: 'textiles',
    price: 168,
    tagline: 'Undyed wool, heavier than it looks.',
    description:
      'Woven in a dense twill from undyed Corriedale wool, the Field settles rather than drapes. The kind of weight that makes an afternoon nap decisive.',
    details: ['100% undyed Corriedale wool', '130 × 190 cm', 'Woven in Portugal'],
    care: ['Dry clean or air outside', 'Store folded with cedar'],
    colorways: [
      { id: 'ecru', label: 'Ecru', swatch: '#E7DFCE' },
      { id: 'walnut', label: 'Walnut', swatch: '#8B6F52' },
      { id: 'graphite', label: 'Graphite', swatch: '#57534E' },
    ],
    visual: { field: '#EFE8DA', tint: '#E2D6C0', body: '#D6C3A2', shade: '#A08A67', shape: 'roll' },
    rating: 4.8,
    reviews: 256,
    stock: 44,
    badges: ['bestseller'],
    featured: true,
  },
  {
    id: 'grain-cushion',
    name: 'Grain Cushion',
    category: 'textiles',
    price: 64,
    tagline: 'A slub-linen square, feather filled.',
    description:
      'Heavy slub linen with an invisible zip and a feather insert that folds into the small of your back. Sold singly — buy the number you actually need.',
    details: ['Belgian linen cover, feather insert', '50 × 50 cm', 'Cover machine washable'],
    care: ['Wash cover cold, line dry'],
    colorways: [
      { id: 'flax', label: 'Flax', swatch: '#DACFB6' },
      { id: 'olive', label: 'Olive', swatch: '#7B7B5A' },
      { id: 'rust', label: 'Rust', swatch: '#A65F42' },
    ],
    visual: { field: '#EAE4D4', tint: '#DDD3BC', body: '#C9BB98', shade: '#948356', shape: 'roll' },
    rating: 4.4,
    reviews: 143,
    stock: 88,
  },
  {
    id: 'strata-runner',
    name: 'Strata Runner',
    category: 'textiles',
    price: 138,
    tagline: 'Flat-woven stripes for long tables.',
    description:
      'A flat-woven runner with tonal stripes that map the loom rather than decorate it. Ends are hand-finished; edges lie flat from the first day.',
    details: ['Cotton–linen blend', '45 × 220 cm', 'Hand-finished ends'],
    care: ['Machine wash cold, iron damp'],
    colorways: [
      { id: 'dune', label: 'Dune', swatch: '#DDD0B8' },
      { id: 'slate', label: 'Slate', swatch: '#7C8894' },
    ],
    visual: { field: '#E7E4DC', tint: '#D6D7D2', body: '#AEB8BE', shade: '#78848E', shape: 'disc' },
    rating: 4.6,
    reviews: 67,
    stock: 30,
    badges: ['new'],
  },
  /* -------------------------------- Objects -------------------------------- */
  {
    id: 'arc-bookend',
    name: 'Arc Bookend',
    category: 'objects',
    price: 92,
    tagline: 'A quarter circle in solid brass.',
    description:
      'Machined from a single billet of brass, the Arc holds a metre of books without complaint. It darkens with handling — a patina you earn, not buy.',
    details: ['Solid brass, 1.4 kg', 'H 12 cm · W 12 cm', 'Sold as a single piece'],
    care: ['Leave to patinate, or polish with a brass cloth'],
    colorways: [
      { id: 'brass', label: 'Brass', swatch: '#C8A35B' },
      { id: 'blackened', label: 'Blackened', swatch: '#3B3833' },
    ],
    visual: { field: '#EDE3CF', tint: '#E4D3B2', body: '#CDA75E', shade: '#8F6F33', shape: 'arch' },
    rating: 4.9,
    reviews: 189,
    stock: 26,
    featured: true,
  },
  {
    id: 'pausa-tray',
    name: 'Pausa Tray',
    category: 'objects',
    price: 76,
    tagline: 'Where keys and rings spend the night.',
    description:
      'A shallow turned-oak dish with a soap-finished surface. The Pausa gives pocket contents a fixed address and mornings one fewer search.',
    details: ['Solid oak, soap finish', 'Ø 20 cm · H 3 cm', 'Grain varies by board'],
    care: ['Wipe dry; re-soap twice a year'],
    colorways: [
      { id: 'oak', label: 'Oak', swatch: '#D3B98E' },
      { id: 'smoked', label: 'Smoked', swatch: '#7A6248' },
    ],
    visual: { field: '#EFE7D8', tint: '#E4D5BB', body: '#D0B183', shade: '#9A7C53', shape: 'disc' },
    rating: 4.7,
    reviews: 88,
    stock: 61,
  },
  {
    id: 'node-candleholder',
    name: 'Node Candleholder',
    category: 'objects',
    price: 58,
    tagline: 'One sphere, one flame.',
    description:
      'A cast-aluminium sphere, drilled true, weighted low. The Node holds a dinner candle perfectly upright and looks composed doing nothing at all.',
    details: ['Cast aluminium', 'Ø 8 cm', 'Fits standard 2.2 cm candles'],
    care: ['Remove wax with warm water'],
    colorways: [
      { id: 'silver', label: 'Silver', swatch: '#C9C9C4' },
      { id: 'moss', label: 'Moss', swatch: '#6F7D66' },
    ],
    visual: {
      field: '#E5E4DF',
      tint: '#D8D8D0',
      body: '#BFC0B8',
      shade: '#83857B',
      shape: 'sphere',
    },
    rating: 4.5,
    reviews: 54,
    stock: 73,
    badges: ['new'],
  },
];

export const productById = new Map(products.map((p) => [p.id, p]));

export function getProduct(id: string): Product | undefined {
  return productById.get(id);
}

export const featuredProducts = products.filter((p) => p.featured);
