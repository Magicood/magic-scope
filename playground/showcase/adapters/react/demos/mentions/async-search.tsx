import type { MentionOption } from '@magic-scope/react';
import { Mentions } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 异步搜索:给了 onSearch 时,本地不再过滤,候选完全由调用方按 query 喂入 options。
// query 变化即触发 onSearch,期间置 loading 走加载文案,模拟一次网络请求后回填结果。
const DIRECTORY: MentionOption[] = [
  { value: 'mira', label: 'Mira Chen', icon: '🧭', description: '@mira · 产品负责人' },
  { value: 'jonas', label: 'Jonas Park', icon: '🛠️', description: '@jonas · 前端工程师' },
  { value: 'ann', label: 'Ann Lee', icon: '🎨', description: '@ann · 设计师' },
  { value: 'leo', label: 'Leo Wang', icon: '📊', description: '@leo · 数据分析' },
  { value: 'sara', label: 'Sara Kim', icon: '🚀', description: '@sara · 项目经理' },
];

export default function Demo() {
  const [text, setText] = useState('找一下 @');
  const [options, setOptions] = useState<MentionOption[]>(DIRECTORY);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (query: string) => {
    setLoading(true);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    // 模拟 320ms 网络延迟后按 query 返回匹配项。
    timer.current = setTimeout(() => {
      const q = query.trim().toLowerCase();
      setOptions(
        q
          ? DIRECTORY.filter(
              (o) =>
                o.label.toLowerCase().includes(q) ||
                String(o.description ?? '')
                  .toLowerCase()
                  .includes(q),
            )
          : DIRECTORY,
      );
      setLoading(false);
    }, 320);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(440px, 100%)' }}>
      <Mentions
        value={text}
        onChange={setText}
        onSearch={handleSearch}
        options={options}
        loading={loading}
        rows={3}
        placeholder="敲 @ 后输入关键字,异步检索通讯录…"
        aria-label="异步搜索提及"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        约 320ms 模拟延迟;加载中显示「加载中…」,无匹配显示空态。
      </small>
    </div>
  );
}
