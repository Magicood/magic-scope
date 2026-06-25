import { Button, Tooltip } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Tooltip content="原生 button:键盘可达" delay={0}>
        <Button variant="ghost">即时按钮</Button>
      </Tooltip>
      <Tooltip content="带 href 的链接也能触发">
        <a href="#tooltip" style={{ color: 'var(--ms-color-accent)' }}>
          链接触发
        </a>
      </Tooltip>
      <Tooltip content="非可聚焦元素自动注入 tabindex,Tab 仍可达">
        <span
          style={{
            padding: '0.25rem 0.6rem',
            border: '1px solid var(--ms-color-border)',
            borderRadius: 'var(--ms-radius-sm)',
            cursor: 'help',
          }}
        >
          纯文本提示 ✦
        </span>
      </Tooltip>
    </div>
  );
}
