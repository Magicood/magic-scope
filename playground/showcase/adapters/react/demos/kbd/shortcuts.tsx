import { Kbd } from '@magic-scope/react';
import type { ReactNode } from 'react';

// keys 快捷键解析:传 'cmd+shift+k' 或 ['ctrl','c'] 会拆成多键帽并按平台符号化。
// separator 传入键帽间的分隔节点(默认纯间距;此处用 '+' 号);tone 给危险键位着语义色。
// platform 强制符号集:mac 走 ⌘⇧⌥ 符号,win 走 Ctrl/Shift/Alt 文本,便于对照。
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ inlineSize: '9rem', color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        {label}
      </span>
      {children}
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      <Row label="打开命令面板">
        <Kbd keys="cmd+shift+p" platform="mac" separator="+" />
      </Row>
      <Row label="保存(Windows)">
        <Kbd keys="ctrl+s" platform="win" separator="+" />
      </Row>
      <Row label="复制(数组传键)">
        <Kbd keys={['cmd', 'c']} platform="mac" separator={<span>+</span>} />
      </Row>
      <Row label="删除(危险色)">
        <Kbd keys="cmd+backspace" platform="mac" separator="+" tone="danger" />
      </Row>
      <Row label="提交(主色 · 空格分隔)">
        <Kbd keys={['cmd', 'enter']} platform="mac" separator=" " tone="primary" />
      </Row>
    </div>
  );
}
