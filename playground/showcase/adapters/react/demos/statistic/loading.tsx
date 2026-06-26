import { Statistic } from '@magic-scope/react';
import { useEffect, useState } from 'react';

// loading 渲染骨架占位(aria-busy),不显示真实数值。常配「拉取中 → 拿到数据」流转,
// 这里用定时器模拟:点按钮重新进入加载,1.2s 后落数据并触发 animateOnMount 滚动入场。
export default function Demo() {
  const [loading, setLoading] = useState(true);
  const [seed, setSeed] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: seed 是「重新拉取」按钮的重跑触发器(effect 不读它,但靠它变化来重进加载态)
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, [seed]);

  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-4, 1rem)', inlineSize: 'min(360px, 100%)' }}
    >
      <div
        style={{
          display: 'flex',
          gap: 'var(--ms-space-6, 1.5rem)',
          flexWrap: 'wrap',
        }}
      >
        <Statistic
          key={`a-${seed}`}
          title="本月营收"
          value={84920.5}
          precision={1}
          prefix="¥"
          trend="up"
          loading={loading}
          animateOnMount
        />
        <Statistic
          key={`b-${seed}`}
          title="活跃用户"
          value={31207}
          loading={loading}
          animateOnMount
        />
      </div>
      <button
        type="button"
        onClick={() => setSeed((s) => s + 1)}
        style={{
          justifySelf: 'start',
          padding: 'var(--ms-space-2, 0.5rem) var(--ms-space-4, 1rem)',
          borderRadius: 'var(--ms-radius-md, 0.5rem)',
          border: '1px solid var(--ms-color-border, #ccc)',
          background: 'var(--ms-color-bg-subtle, transparent)',
          color: 'var(--ms-color-fg, inherit)',
          cursor: 'pointer',
        }}
      >
        重新拉取
      </button>
    </div>
  );
}
