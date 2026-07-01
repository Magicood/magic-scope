import { Marquee } from '@magic-scope/react';

// 固定时长与份数:duration 指定一圈秒数(比 speed 更稳定,与内容尺寸无关)、
// repeat 固定克隆份数、pauseOnClick 按下暂停松开恢复。
const items = ['✦ 新品首发', '✦ 限时 8 折', '✦ 免费试用', '✦ 全球发货', '✦ 7 天无理由'];

export default function Demo() {
  return (
    <Marquee duration={14} repeat={3} pauseOnClick gradient aria-label="促销跑马灯">
      {items.map((t) => (
        <span key={t} style={{ marginInlineEnd: '2.5rem', fontWeight: 600 }}>
          {t}
        </span>
      ))}
    </Marquee>
  );
}
