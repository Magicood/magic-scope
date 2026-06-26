import { Select } from '@magic-scope/react';
import { useEffect, useState } from 'react';

// 加载态 + 可清除 + 前置图标:
// loading 时展开浮层显示「加载中…」、trigger 标记 aria-busy;
// 这里模拟异步拉取,1.2s 后选项就绪;有值时 clearable 显示清除按钮。
const ready = [
  { value: 'arcane', label: 'Arcane 奥术紫' },
  { value: 'frost', label: 'Frost 霜寒青' },
  { value: 'ember', label: 'Ember 余烬品红' },
];

export default function Demo() {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: 'grid', gap: '0.5rem', inlineSize: 'min(280px, 80vw)' }}>
      <Select
        loading={loading}
        clearable
        prefix={<span aria-hidden="true">🜂</span>}
        value={value}
        onChange={(next) => setValue(next as string)}
        options={loading ? [] : ready}
        tone="info"
        placeholder={loading ? '加载流派…' : '请选择流派'}
        aria-label="异步加载流派(可清除)"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        {loading ? '正在拉取选项…' : `已就绪 ${ready.length} 项`}
      </small>
    </div>
  );
}
