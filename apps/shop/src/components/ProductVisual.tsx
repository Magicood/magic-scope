import type { Product, Roast } from '../data/catalog';

const ROAST_BEAN: Record<Roast, string> = {
  light: '#c89b6a',
  medium: '#a86b3c',
  'medium-dark': '#7a4a28',
  dark: '#46301f',
};

function Bean({
  x,
  y,
  r,
  fill,
  rotate = 0,
}: {
  x: number;
  y: number;
  r: number;
  fill: string;
  rotate?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <ellipse cx="0" cy="0" rx={r} ry={r * 0.66} fill={fill} />
      <path
        d={`M 0 ${-r * 0.6} Q ${r * 0.28} 0 0 ${r * 0.6}`}
        fill="none"
        stroke="rgba(0,0,0,0.28)"
        strokeWidth={r * 0.14}
        strokeLinecap="round"
      />
    </g>
  );
}

/** 咖啡袋(豆子类商品):accent 染袋身,烘焙度决定豆色。 */
function BagSvg({ accent, roast }: { accent: string; roast: Roast }) {
  const bean = ROAST_BEAN[roast];
  return (
    <svg viewBox="0 0 200 200" width="62%" aria-hidden="true">
      {/* 袋身 */}
      <path d="M52 54 q48 -10 96 0 l6 108 q-54 12 -108 0 z" fill={accent} />
      {/* 顶部折边 + 封口 */}
      <path d="M50 40 q50 -12 100 0 l2 16 q-52 -11 -104 0 z" fill="rgba(0,0,0,0.16)" />
      <rect x="92" y="30" width="16" height="14" rx="2" fill="rgba(0,0,0,0.2)" />
      {/* 高光 */}
      <path d="M58 56 q44 -9 84 0 l1 18 q-43 -8 -86 0 z" fill="rgba(255,255,255,0.16)" />
      {/* 标签 */}
      <rect
        x="66"
        y="92"
        width="68"
        height="50"
        rx="6"
        fill="var(--ms-color-surface)"
        opacity="0.96"
      />
      <Bean x={88} y={112} r={9} fill={bean} rotate={-18} />
      <Bean x={104} y={108} r={9} fill={bean} rotate={12} />
      <Bean x={112} y={124} r={9} fill={bean} rotate={-8} />
      <rect x="74" y="132" width="52" height="4" rx="2" fill={accent} opacity="0.5" />
    </svg>
  );
}

function GearSvg({ id, accent }: { id: string; accent: string }) {
  const stroke = accent;
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (id === 'grinder') {
    return (
      <svg viewBox="0 0 200 200" width="56%" aria-hidden="true">
        <circle cx="100" cy="44" r="6" {...common} />
        <path d="M100 50 v22" {...common} />
        <path d="M100 60 h34" {...common} />
        <rect x="70" y="72" width="60" height="34" rx="6" {...common} />
        <rect x="64" y="106" width="72" height="60" rx="10" {...common} />
        <path d="M64 130 h72" {...common} />
      </svg>
    );
  }
  if (id === 'kettle') {
    return (
      <svg viewBox="0 0 200 200" width="60%" aria-hidden="true">
        <path d="M58 96 q42 -16 84 0 l-8 56 q-34 10 -68 0 z" {...common} />
        <path d="M138 104 q34 -2 36 -40 q0 -10 -10 -10" {...common} />
        <path d="M70 96 q30 -34 0 -42" {...common} />
        <path d="M84 152 q16 8 32 0" {...common} />
      </svg>
    );
  }
  // v60 滤杯(默认)
  return (
    <svg viewBox="0 0 200 200" width="58%" aria-hidden="true">
      <path d="M56 66 h88 l-30 64 h-28 z" {...common} />
      <path d="M70 96 h60" {...common} />
      <path d="M86 130 l-8 28 h44 l-8 -28" {...common} />
      <path d="M100 66 v64" {...common} opacity="0.5" />
    </svg>
  );
}

interface ProductVisualProps {
  product: Product;
  /** 容器圆角是否继承(详情页大图用 false)。 */
  rounded?: boolean;
  className?: string;
}

/** 商品视觉:暖色渐变底 + 手绘 SVG(豆子=咖啡袋,器具=线描)。无实拍图。 */
export function ProductVisual({ product, rounded = true, className }: ProductVisualProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        aspectRatio: '1 / 1',
        inlineSize: '100%',
        borderRadius: rounded ? 'inherit' : 0,
        background: `radial-gradient(120% 120% at 30% 20%, color-mix(in oklab, ${product.accent} 22%, var(--ms-color-surface)), var(--ms-color-surface-sunken, var(--ms-color-surface)))`,
        overflow: 'hidden',
      }}
    >
      {product.type === 'bean' && product.roast ? (
        <BagSvg accent={product.accent} roast={product.roast} />
      ) : (
        <GearSvg id={product.id} accent={product.accent} />
      )}
    </div>
  );
}
