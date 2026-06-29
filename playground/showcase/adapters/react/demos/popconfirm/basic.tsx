import { Button, Popconfirm } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Popconfirm
        trigger={<Button>提交审核</Button>}
        title="确定提交?"
        description="提交后将进入审核队列。"
        onConfirm={() => setSubmitted(true)}
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.875rem' }}>
        {submitted ? '已提交,等待审核 ✓' : '点外 / Esc 关闭等同取消'}
      </span>
    </div>
  );
}
