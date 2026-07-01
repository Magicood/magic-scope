import { Divider } from '@magic-scope/react';

// 带文字的分隔:label 内容槽位升级为「两侧画线 + 居中文字」,textAlign 控制文字三档对齐。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.4rem' }}>
      <Divider label="默认居中" />
      <Divider label="靠左对齐" textAlign="start" />
      <Divider label="靠右对齐" textAlign="end" />
    </div>
  );
}
