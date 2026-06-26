import { Textarea } from '@magic-scope/react';
import { useState } from 'react';

// autosize:随内容自动调高。true = 自由增长;{ minRows, maxRows } = 限幅,
// 超过 maxRows 后内部滚动而非继续撑高。试着多敲几行回车观察高度变化。
export default function Demo() {
  const [free, setFree] = useState('随我增长 —— 每多一行,我就长高一分。\n继续输入试试。');
  const [clamped, setClamped] = useState(
    '我被限制在 2~4 行之间。\n超过上限后,\n会改为内部滚动,\n而不再撑高容器。',
  );
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(28rem, 100%)' }}>
      <div style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>autosize（自由增长）</span>
        <Textarea
          value={free}
          onChange={(e) => setFree(e.target.value)}
          autosize
          aria-label="自由增长"
        />
      </div>
      <div style={{ display: 'grid', gap: '0.35rem' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)' }}>
          autosize=&#123;&#123; minRows: 2, maxRows: 4 &#125;&#125;（限幅）
        </span>
        <Textarea
          value={clamped}
          onChange={(e) => setClamped(e.target.value)}
          autosize={{ minRows: 2, maxRows: 4 }}
          aria-label="限幅增长"
        />
      </div>
    </div>
  );
}
