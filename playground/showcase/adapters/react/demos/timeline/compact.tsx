import { Timeline, TimelineItem } from '@magic-scope/react';

// 紧凑条目(只有 title + time,没有正文):最容易暴露连线断口的形态 —— 条目一矮,
// 任何「间距不在节点列高度里」的写法都会让整条轴看不见。同时用一个 >32rem 的宽容器
// 触发 alternate 的真·交替排布(窄容器会退化成单侧,那条代码路径就测不到了)。
const SHIPPING = [
  { title: '已下单', time: '09:00' },
  { title: '已付款', time: '09:02' },
  { title: '已发货', time: '11:20' },
  { title: '已签收', time: '次日 10:05' },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem 3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>紧凑条目(无正文)</span>
          <Timeline style={{ inlineSize: '240px' }}>
            {SHIPPING.map((s) => (
              <TimelineItem key={s.title} title={s.title} time={s.time} />
            ))}
          </Timeline>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>紧凑 + 图标 + 进行中</span>
          <Timeline pending="配送中…" style={{ inlineSize: '240px' }}>
            {SHIPPING.slice(0, 3).map((s, i) => (
              <TimelineItem
                key={s.title}
                variant={i === 2 ? 'primary' : 'success'}
                icon={i === 2 ? '✦' : '✓'}
                title={s.title}
                time={s.time}
              />
            ))}
          </Timeline>
        </div>
      </div>

      {/* 独占一行:容器要有 ≥32rem 才会触发真·交替排布,挤在上面那行里会退化成单侧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>alternate 宽容器(≥32rem 才交替)</span>
        <Timeline mode="alternate" style={{ inlineSize: 'min(560px, 100%)' }}>
          {SHIPPING.map((s) => (
            <TimelineItem key={s.title} title={s.title} time={s.time} />
          ))}
        </Timeline>
      </div>
    </div>
  );
}
