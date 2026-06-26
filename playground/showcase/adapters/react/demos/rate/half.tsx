import { Rate } from '@magic-scope/react';
import { useState } from 'react';

const tooltips = ['很差', '一般', '还行', '不错', '惊艳'];

// 半星:指针落在星左半区取 .5,键盘 ←/→ 0.5 步进;showText 在右侧显示评分文案,每星带 tooltip。
export default function Demo() {
  const [value, setValue] = useState(2.5);
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <Rate
        value={value}
        onChange={setValue}
        allowHalf
        tooltips={tooltips}
        showText
        aria-label="半星评分"
      />
      <Rate
        value={value}
        onChange={setValue}
        allowHalf
        tooltips={tooltips}
        showText={(v) => (v > 0 ? `已选「${tooltips[Math.ceil(v) - 1]}」（${v} 分）` : '未评分')}
        aria-label="半星评分（自定义文案）"
      />
    </div>
  );
}
