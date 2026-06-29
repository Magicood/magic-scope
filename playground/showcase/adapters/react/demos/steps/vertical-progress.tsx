import type { StepItem } from '@magic-scope/react';
import { Steps } from '@magic-scope/react';

const items: StepItem[] = [
  { title: '拉取代码', description: '检出与依赖安装' },
  { title: '构建打包', description: '当前步配合 percent 在圆点上画进度环' },
  { title: '部署上线', description: '推送到生产环境' },
  { title: '归档记录', description: '保存结果与溯源' },
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
