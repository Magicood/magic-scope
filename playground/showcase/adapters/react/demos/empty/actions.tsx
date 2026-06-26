import { Button, Empty } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [loading, setLoading] = useState(false);

  function retry() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }

  return (
    <Empty
      image={<span style={{ fontSize: '3rem' }}>🔮</span>}
      tone="accent"
      description={loading ? '正在重新探查…' : '搜索没有命中任何结果'}
      style={{ inlineSize: 'min(360px, 100%)' }}
    >
      <Button variant="outline" disabled={loading} onClick={retry}>
        {loading ? '探查中' : '重新探查'}
      </Button>
      <Button variant="ghost">清除筛选</Button>
    </Empty>
  );
}
