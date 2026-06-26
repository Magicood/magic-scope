import { Statistic } from '@magic-scope/react';

// 仪表盘概览卡:as 多态根把每个 Statistic 渲染成 <article> 卡片,
// classNames 槽位精修单个子部件(这里给 title 加描述性间距),不破坏整体。
const cardStyle = {
  display: 'block',
  padding: 'var(--ms-space-5, 1.25rem)',
  borderRadius: 'var(--ms-radius-lg, 0.75rem)',
  border: '1px solid var(--ms-color-border, #e5e5e5)',
  background: 'var(--ms-color-bg-subtle, transparent)',
  minInlineSize: '160px',
} as const;

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--ms-space-4, 1rem)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
      }}
    >
      <Statistic
        as="article"
        style={cardStyle}
        title="本月营收"
        value={284920.5}
        precision={2}
        prefix="¥"
        trend="up"
      />
      <Statistic
        as="article"
        style={cardStyle}
        title="新增用户"
        value={12480}
        trend="up"
        suffix="人"
      />
      <Statistic
        as="article"
        style={cardStyle}
        title="退款金额"
        value={8632.4}
        precision={1}
        prefix="¥"
        trend="down"
      />
      <Statistic as="article" style={cardStyle} title="待处理工单" value={37} suffix="个" />
    </div>
  );
}
