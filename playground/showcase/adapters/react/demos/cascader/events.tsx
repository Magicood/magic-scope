import type { CascaderOption } from '@magic-scope/react';
import { Cascader } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 事件演示:onChange 回传选中路径 value[] 与沿途 optionPath(每级选项对象),
// onOpenChange 回传浮层开合。changeOnSelect 下选中间节点也会触发 onChange。
const options: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖' },
          { value: 'yuhang', label: '余杭' },
        ],
      },
      {
        value: 'ningbo',
        label: '宁波',
        children: [{ value: 'yinzhou', label: '鄞州' }],
      },
    ],
  },
];

export default function Demo() {
  const [path, setPath] = useState<string[]>([]);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(400px, 100%)' }}>
      <Cascader
        options={options}
        value={path}
        changeOnSelect
        onChange={(v, optionPath) => {
          setPath(v);
          push(`onChange([${v.join(', ')}], labels=${optionPath.map((o) => o.label).join('/')})`);
        }}
        onOpenChange={(open) => push(`onOpenChange(${open})`)}
        tone="success"
        aria-label="事件演示"
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前路径:{path.join(' / ') || '空'}
      </span>
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
