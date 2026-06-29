import { useId } from 'react';

/** 把一串数值映射成 0..1 的点序列(按数据范围归一)。 */
function normalize(values: number[]): { x: number; y: number }[] {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? 1 / (values.length - 1) : 0;
  return values.map((v, i) => ({ x: i * step, y: 1 - (v - min) / span }));
}

/** 平滑折线路径(简化的 Catmull-Rom → 三次贝塞尔)。坐标基于 viewBox 宽高,先把点缩放到画布。 */
function smoothPath(pts: { x: number; y: number }[], w: number, h: number, pad: number): string {
  const sx = (x: number) => pad + x * (w - pad * 2);
  const sy = (y: number) => pad + y * (h - pad * 2);
  const p = pts.map((pt) => ({ x: sx(pt.x), y: sy(pt.y) }));
  const first = p[0];
  if (!first) return '';
  if (p.length === 1) return `M ${first.x} ${first.y}`;
  let d = `M ${first.x} ${first.y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p[i + 1];
    if (!p0 || !p1 || !p2 || !p3) continue;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

interface AreaChartProps {
  data: number[];
  /** 可选对照序列(更淡的次线)。 */
  compare?: number[];
  height?: number;
  className?: string;
  tone?: 'primary' | 'accent';
}

/** 手搓的平滑面积图:品牌渐变填充 + 描边,responsive(viewBox 拉伸)。 */
export function AreaChart({
  data,
  compare,
  height = 180,
  className,
  tone = 'primary',
}: AreaChartProps) {
  const id = useId().replace(/:/g, '');
  const W = 600;
  const H = height;
  const pad = 6;
  const stroke = tone === 'accent' ? 'var(--ms-color-accent)' : 'var(--ms-color-primary)';
  const all = compare ? [...data, ...compare] : data;
  const max = Math.max(...all);
  const min = Math.min(...all);
  const span = max - min || 1;
  const toPts = (vs: number[]) =>
    vs.map((v, i) => ({
      x: vs.length > 1 ? i / (vs.length - 1) : 0,
      y: 1 - (v - min) / span,
    }));
  const line = smoothPath(toPts(data), W, H, pad);
  const sy = (y: number) => pad + y * (H - pad * 2);
  const area = `${line} L ${W - pad} ${H - pad} L ${pad} ${H - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={className}
      style={{ inlineSize: '100%', blockSize: height, display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#area-${id})`} />
      {compare && (
        <path
          d={smoothPath(toPts(compare), W, H, pad)}
          fill="none"
          stroke="var(--ms-color-border-strong)"
          strokeWidth="1.5"
          strokeDasharray="4 5"
          vectorEffect="non-scaling-stroke"
          opacity="0.7"
        />
      )}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {(() => {
        const pts = toPts(data);
        const last = pts[pts.length - 1];
        if (!last) return null;
        return <circle cx={W - pad} cy={sy(last.y)} r="3.5" fill={stroke} />;
      })()}
    </svg>
  );
}

interface SparklineProps {
  data: number[];
  height?: number;
  tone?: 'primary' | 'accent' | 'success' | 'danger';
}

/** 迷你火花线(KPI 卡用),纯描边、随容器宽度拉伸。 */
export function Sparkline({ data, height = 36, tone = 'primary' }: SparklineProps) {
  const W = 120;
  const H = height;
  const pad = 3;
  const color =
    tone === 'success'
      ? 'var(--ms-color-success)'
      : tone === 'danger'
        ? 'var(--ms-color-danger)'
        : tone === 'accent'
          ? 'var(--ms-color-accent)'
          : 'var(--ms-color-primary)';
  const path = smoothPath(normalize(data), W, H, pad);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ inlineSize: '100%', blockSize: height, display: 'block' }}
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
