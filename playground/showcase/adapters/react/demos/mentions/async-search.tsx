import type { MentionOption } from '@magic-scope/react';
import { Mentions } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 异步搜索:给了 onSearch 时,本地不再过滤,候选完全由调用方按 query 喂入 options。
// query 变化即触发 onSearch,期间置 loading 走加载文案,模拟一次网络请求后回填结果。
const DIRECTORY: MentionOption[] = [
  { value: 'arcanist', label: '奥术师·墨', icon: '🔮', description: '@arcanist · 符文研究' },
  { value: 'frostweaver', label: '霜织者·凛', icon: '❄️', description: '@frost · 冰封领域' },
  { value: 'emberkin', label: '余烬使·焰', icon: '🔥', description: '@ember · 烈焰爆发' },
  { value: 'stormcaller', label: '唤雷者·霆', icon: '⚡', description: '@storm · 雷电连锁' },
  { value: 'verdant', label: '翠生者·苏', icon: '🌿', description: '@verdant · 治愈召唤' },
];

export default function Demo() {
  const [text, setText] = useState('搜一下 @');
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
