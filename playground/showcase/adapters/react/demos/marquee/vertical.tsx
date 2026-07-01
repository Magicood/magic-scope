import { Marquee } from '@magic-scope/react';

// 纵向跑马灯(direction=up):公告 / 通知流场景,固定高度容器内向上无缝滚动。
const news = [
  '订单 #4821 已发货',
  '你有 3 条新评论',
  '库存告急:限量礼盒',
  '积分即将到期',
  '新功能:批量导出',
];

export default function Demo() {
  return (
    <Marquee
      direction="up"
      speed={30}
      pauseOnHover
      gradient
      aria-label="站内公告"
      style={{ blockSize: '150px', inlineSize: 'min(280px, 100%)' }}
    >
      {news.map((n) => (
        <div
          key={n}
          style={{
            padding: '0.5rem 0.75rem',
            color: 'var(--ms-color-fg-muted)',
            borderBottom: '1px solid var(--ms-color-border)',
          }}
        >
          {n}
        </div>
      ))}
    </Marquee>
  );
}
