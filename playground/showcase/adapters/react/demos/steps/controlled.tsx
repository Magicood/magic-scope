import type { StepItem } from '@magic-scope/react';
import { Button, Steps } from '@magic-scope/react';
import { useState } from 'react';

const items: StepItem[] = [
  { title: '注册', description: '提交基本信息' },
  { title: '验证', description: '校验与确认身份' },
  { title: '支付', description: '完成订单付款' },
  { title: '完成', description: '结果归档' },
];

// 生产用法:受控 current,上一步 / 下一步按钮推进。
export default function Demo() {
  const [current, setCurrent] = useState(1);
  const last = items.length - 1;
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(40rem, 100%)' }}>
      <Steps items={items} current={current} status={current === last ? 'finish' : 'process'} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          variant="outline"
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          上一步
        </Button>
        <Button
          variant="solid"
          disabled={current === last}
          onClick={() => setCurrent((c) => Math.min(last, c + 1))}
        >
          下一步
        </Button>
      </div>
    </div>
  );
}
