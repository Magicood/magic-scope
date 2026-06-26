import type { TransferItem } from '@magic-scope/react';
import { Transfer } from '@magic-scope/react';
import { useState } from 'react';

// 受控 targetKeys + 外部按钮编程式改栏:全选入 / 清空 / 反选,
// 证明 dataSource + targetKeys 是唯一真相源,可由组件外任意驱动。
const dataSource: TransferItem[] = [
  { key: 'a', title: '巡逻 patrol' },
  { key: 'b', title: '布防 ward' },
  { key: 'c', title: '侦察 scout' },
  { key: 'd', title: '增益 buff' },
  { key: 'e', title: '治疗 heal' },
];

const allKeys = dataSource.map((item) => item.key);

const btnStyle: React.CSSProperties = {
  padding: 'var(--ms-space-1, 0.25rem) var(--ms-space-3, 0.75rem)',
  borderRadius: 'var(--ms-radius-sm, 6px)',
  border: '1px solid var(--ms-color-border)',
  background: 'var(--ms-color-bg-subtle, transparent)',
  color: 'var(--ms-color-fg)',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

export default function Demo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(['a', 'c']);
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)' }}>
      <div style={{ display: 'flex', gap: 'var(--ms-space-2, 0.5rem)', flexWrap: 'wrap' }}>
        <button type="button" style={btnStyle} onClick={() => setTargetKeys(allKeys)}>
          全部入右
        </button>
        <button type="button" style={btnStyle} onClick={() => setTargetKeys([])}>
          清空
        </button>
        <button
          type="button"
          style={btnStyle}
          onClick={() => setTargetKeys(allKeys.filter((k) => !targetKeys.includes(k)))}
        >
          反选
        </button>
      </div>
      <Transfer
        dataSource={dataSource}
        targetKeys={targetKeys}
        onChange={setTargetKeys}
        titles={['技能池', '快捷栏']}
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        右栏 targetKeys:[{targetKeys.join(', ') || '空'}]
      </small>
    </div>
  );
}
