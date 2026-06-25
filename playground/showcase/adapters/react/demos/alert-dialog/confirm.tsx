import { Button, confirm } from '@magic-scope/react';
import { useState } from 'react';

// confirm() 返回 Promise<boolean>:确认 true / 取消·Esc·遮罩 false。
// danger 变体把确认按钮染危险色,默认焦点落在取消以防误触销毁性操作。
export default function Demo() {
  const [log, setLog] = useState('(等待操作)');

  const askLeave = async () => {
    const ok = await confirm('当前改动尚未保存,确定离开吗?', {
      title: '离开页面',
      confirmText: '离开',
      cancelText: '留下',
    });
    setLog(ok ? '普通确认 → 已离开' : '普通确认 → 已留下');
  };

  const askDelete = async () => {
    const ok = await confirm('删除后无法恢复,确定移除这道法术吗?', {
      title: '危险操作',
      variant: 'danger',
      confirmText: '删除',
      cancelText: '取消',
    });
    setLog(ok ? '危险确认 → 已删除' : '危险确认 → 已取消');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="solid" onClick={askLeave}>
          普通确认
        </Button>
        <Button variant="outline" onClick={askDelete}>
          危险确认 danger
        </Button>
      </div>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
        结果:{log}
      </p>
    </div>
  );
}
