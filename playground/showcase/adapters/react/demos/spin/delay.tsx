import { Spin } from '@magic-scope/react';
import { useState } from 'react';

/**
 * delay 防闪烁:spinning 由 false→true 后须持续超过 delay(此处 500ms)才真正显示遮罩。
 * 点「极速请求(200ms)」时,请求在 delay 到点前就结束,遮罩完全不闪;
 * 点「慢速请求(1200ms)」时遮罩正常显示。收起永远即时。
 */
export default function Demo() {
  const [spinning, setSpinning] = useState(false);
  const [note, setNote] = useState('点按钮模拟一次异步请求');

  const run = (ms: number, label: string) => {
    setNote(`${label}:进行中…`);
    setSpinning(true);
    window.setTimeout(() => {
      setSpinning(false);
      setNote(`${label}:已完成`);
    }, ms);
  };

  const btnStyle = {
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--ms-radius-sm, 0.375rem)',
    border: '1px solid var(--ms-color-border, #2a2a35)',
    background: 'var(--ms-color-bg, transparent)',
    color: 'var(--ms-color-fg, #e8e8ef)',
    cursor: 'pointer',
  } as const;

  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(360px, 100%)' }}>
      <Spin spinning={spinning} delay={500} tip="加载中…">
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            blockSize: '90px',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
            border: '1px solid var(--ms-color-border, #2a2a35)',
            background: 'var(--ms-color-bg-subtle, rgba(255,255,255,0.03))',
            color: 'var(--ms-color-fg-muted, #9a9aa6)',
            fontSize: '0.86rem',
          }}
        >
          {note}
        </div>
      </Spin>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" style={btnStyle} onClick={() => run(200, '极速请求')}>
          极速请求(200ms · 不闪)
        </button>
        <button type="button" style={btnStyle} onClick={() => run(1200, '慢速请求')}>
          慢速请求(1200ms)
        </button>
      </div>
      <small style={{ color: 'var(--ms-color-fg-muted, #9a9aa6)' }}>
        delay=500ms 拦掉「显」,收起永远即时
      </small>
    </div>
  );
}
