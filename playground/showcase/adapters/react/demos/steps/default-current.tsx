import type { StepItem } from '@magic-scope/react';
import { Steps } from '@magic-scope/react';

// defaultCurrent:非受控初始步索引(无需自管 state)。此处默认停在第 3 步「发货」。
const items: StepItem[] = [
  { title: '下单', description: '提交订单' },
  { title: '付款', description: '完成支付' },
  { title: '发货', description: '仓库出库' },
  { title: '收货', description: '确认签收' },
];

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(40rem, 100%)' }}>
      <Steps items={items} defaultCurrent={2} />
    </div>
  );
}
