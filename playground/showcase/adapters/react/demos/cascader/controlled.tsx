import type { CascaderOption } from '@magic-scope/react';
import { Cascader } from '@magic-scope/react';
import { type CSSProperties, useState } from 'react';

// 受控双通道:value(选中路径)与 open(浮层开合)都由外部状态托管,
// 外部按钮可直接改写选中路径 / 开合;displayRender 自定义 trigger 的路径显示。
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
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      {
        value: 'nanjing',
        label: '南京',
        children: [{ value: 'xuanwu', label: '玄武' }],
      },
    ],
  },
];

const btnStyle: CSSProperties = {
  padding: 'var(--ms-space-1) var(--ms-space-3)',
  borderRadius: 'var(--ms-radius-md)',
  border: '1px solid var(--ms-color-border)',
  background: 'var(--ms-color-bg-subtle)',
  color: 'var(--ms-color-fg)',
  cursor: 'pointer',
  fontSize: '0.82rem',
};

export default function Demo() {
  const [path, setPath] = useState<string[]>(['zhejiang', 'hangzhou', 'xihu']);
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(340px, 100%)' }}>
      <Cascader
        options={options}
        value={path}
        onChange={setPath}
        open={open}
        onOpenChange={setOpen}
        tone="info"
        // 自定义路径显示:用 › 连接并加前缀
        displayRender={(labels) => `📍 ${labels.join(' › ')}`}
        aria-label="受控级联"
      />
      <div style={{ display: 'flex', gap: 'var(--ms-space-2)', flexWrap: 'wrap' }}>
        <button
          type="button"
          style={btnStyle}
          onClick={() => setPath(['jiangsu', 'nanjing', 'xuanwu'])}
        >
          跳到 南京 / 玄武
        </button>
        <button type="button" style={btnStyle} onClick={() => setPath([])}>
          清空
        </button>
        <button type="button" style={btnStyle} onClick={() => setOpen((o) => !o)}>
          {open ? '收起浮层' : '展开浮层'}
        </button>
      </div>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        value={JSON.stringify(path)} · open={String(open)}
      </small>
    </div>
  );
}
