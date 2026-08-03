import { Button, Menu } from '@magic-scope/react';

// tone 决定浮层的色调语义(选中项 / hover 强调 / 焦点环取色)。
// 一排不同 tone 的菜单,逐个打开可见强调色随之切换 —— 与库内其它组件同一套 tone 令牌对齐。
const tones = [
  { tone: 'primary', label: '主色 primary' },
  { tone: 'accent', label: '强调 accent' },
  { tone: 'success', label: '成功 success' },
  { tone: 'danger', label: '危险 danger' },
] as const;

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {tones.map(({ tone, label }) => (
        <Menu
          key={tone}
          tone={tone}
          trigger={<Button variant="outline">{label} ▾</Button>}
          items={[
            { label: '预览', onSelect: () => {} },
            { label: '编辑', checked: true, onSelect: () => {} },
            { label: '分享', onSelect: () => {} },
          ]}
        />
      ))}
    </div>
  );
}
