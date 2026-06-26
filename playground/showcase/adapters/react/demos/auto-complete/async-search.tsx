import type { AutoCompleteOption } from '@magic-scope/react';
import { AutoComplete } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 远程异步搜索(AutoComplete 的招牌能力):
// filterOption={false} 关闭内置过滤,完全交由外部受控 —— 每次 onSearch
// 触发一次模拟请求,期间 loading 展示「加载中…」,300ms 后写回候选。
const CORPUS = [
  'React 反应式',
  'React Router 路由',
  'Redux 状态机',
  'Vue 视图层',
  'Vite 构建',
  'Vitest 测试',
  'Svelte 编译式',
  'Solid 细粒度',
  'Angular 全家桶',
  'Astro 群岛',
];

export default function Demo() {
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (q: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    const query = q.trim().toLowerCase();
    if (query === '') {
      setOptions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // 模拟网络延迟
    timer.current = setTimeout(() => {
      setOptions(
        CORPUS.filter((item) => item.toLowerCase().includes(query)).map((value) => ({ value })),
      );
      setLoading(false);
    }, 300);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(320px, 80vw)' }}>
      <AutoComplete
        value={value}
        onChange={setValue}
        onSearch={handleSearch}
        options={options}
        filterOption={false}
        loading={loading}
        allowClear
        prefix={<span aria-hidden="true">🔍</span>}
        placeholder="键入以远程搜索框架…"
        tone="info"
        aria-label="远程异步搜索"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        {loading ? '正在请求…' : value ? `命中 ${options.length} 项` : '试试输入「re」「vi」'}
      </small>
    </div>
  );
}
