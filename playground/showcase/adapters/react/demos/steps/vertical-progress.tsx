import type { StepItem } from '@magic-scope/react';
import { Steps } from '@magic-scope/react';

const items: StepItem[] = [
  { title: '准备符文', description: '采集与排列法阵符文' },
  { title: '注入魔力', description: '当前步配合 percent 在圆点上画进度环' },
  { title: '稳定结界', description: '校准能量回路' },
  { title: '封印归档', description: '保存结果与溯源' },
];

// 垂直方向 + 当前步进度环(percent):current=1、status=process、percent=65 → 第二步圆点画 65% 环。
export default function Demo() {
  return (
    <Steps
      items={items}
      current={1}
      status="process"
      direction="vertical"
      percent={65}
      tone="accent"
      style={{ inlineSize: 'min(22rem, 100%)' }}
    />
  );
}
