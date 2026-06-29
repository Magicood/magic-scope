import { Alert, Button } from '@magic-scope/react';
import { useState } from 'react';

// action 行动区 + dismissible 受控关闭:
//  - action 槽渲染在正文下方,适合放确认 / 重试等操作按钮;
//  - dismissible 渲染右上角关闭钮,onClose 回调里更新受控状态隐藏提示。
// 关闭后展示「重新显示」入口,便于反复验证进出场。
export default function Demo() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <Button variant="outline" tone="info" onClick={() => setOpen(true)}>
        重新显示提示
      </Button>
    );
  }

  return (
    <Alert
      variant="warning"
      title="存储空间即将用尽"
      dismissible
      onClose={() => setOpen(false)}
      action={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" tone="warning" variant="solid">
            升级套餐
          </Button>
          <Button size="sm" tone="warning" variant="outline" onClick={() => setOpen(false)}>
            稍后再说
          </Button>
        </div>
      }
      style={{ maxInlineSize: 'min(32rem, 100%)' }}
    >
      存储空间已使用 80%,建议先清理旧文件或升级套餐再继续上传。
    </Alert>
  );
}
