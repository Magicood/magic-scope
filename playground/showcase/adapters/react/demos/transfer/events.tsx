import type { TransferDirection, TransferItem } from '@magic-scope/react';
import { Transfer } from '@magic-scope/react';
import { useRef, useState } from 'react';

// onChange 回传 (targetKeys, direction, moveKeys) —— 实时回显每次移动审计。
const dataSource: TransferItem[] = [
  { key: 'k1', title: '日志 logs' },
  { key: 'k2', title: '指标 metrics' },
  { key: 'k3', title: '链路 traces' },
  { key: 'k4', title: '告警 alerts' },
  { key: 'k5', title: '事件 events' },
];

export default function Demo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(['k1']);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)' }}>
      <Transfer
        dataSource={dataSource}
        targetKeys={targetKeys}
        titles={['采集源', '已订阅']}
        onChange={(keys, direction: TransferDirection, moveKeys) => {
          setTargetKeys(keys);
          const arrow = direction === 'right' ? '左 → 右' : '右 → 左';
          push(`onChange(${arrow}, 移动=[${moveKeys.join(', ')}], 右栏=[${keys.join(', ')}])`);
        }}
      />
      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.82rem',
          }}
        >
          {log.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
