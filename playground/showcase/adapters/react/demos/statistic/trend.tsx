import { Statistic } from '@magic-scope/react';

// trend 不写死颜色:up 走全库 tone resolver 染 success + 上箭头,down 染 danger + 下箭头,
// 不传则中性(沿用 fg)。箭头纯装饰,语义由 aria-label 的「上升 / 下降」承载。
export default function Demo() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--ms-space-6, 1.5rem)',
        alignItems: 'flex-start',
      }}
    >
      <Statistic title="新增订单" value={1893} trend="up" suffix="单" />
      <Statistic title="退款率" value={2.7} precision={1} trend="down" suffix="%" />
      <Statistic title="在线设备" value={512} suffix="台" />
    </div>
  );
}
