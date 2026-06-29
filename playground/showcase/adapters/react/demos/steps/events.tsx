import type { StepItem } from '@magic-scope/react';
import { Button, Steps } from '@magic-scope/react';
import { useRef, useState } from 'react';

const items: StepItem[] = [
  { title: '注册', description: '提交基本信息' },
  { title: '验证', description: '校验与确认身份' },
  { title: '支付', description: '完成订单付款' },
  { title: '完成', description: '结果归档' },
];

// 事件触发实时回显:绑定 onChange(current),每次触发把事件名 + 实参打到列表;
// current 受控并在面板回显,点击步骤圆点或上一步 / 下一步均可验证。
export default function Demo() {
  const [current, setCurrent] = useState(1);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const last = items.length - 1;

  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  // 关键事件:点击某步 / 键盘跳转时触发,实参是目标步索引(从 0 起)。
  const handleChange = (next: number) => {
    setCurrent(next);
    push(`onChange(current: ${next}) → ${items[next]?.title ?? '—'}`);
  };

  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(40rem, 100%)' }}>
      <Steps
        items={items}
        current={current}
        status={current === last ? 'finish' : 'process'}
        onChange={handleChange}
      />

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="outline"
          disabled={current === 0}
          onClick={() => handleChange(Math.max(0, current - 1))}
        >
          上一步
        </Button>
        <Button
          variant="solid"
          disabled={current === last}
          onClick={() => handleChange(Math.min(last, current + 1))}
        >
          下一步
        </Button>
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          当前 current = {current} · 也可直接点击上方步骤圆点触发 onChange
        </span>
      </div>

      {log.length > 0 ? (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.85rem',
            lineHeight: 1.7,
          }}
        >
          {log.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          点击步骤或按钮,这里会实时打印 onChange 的触发与实参。
        </p>
      )}
    </div>
  );
}
