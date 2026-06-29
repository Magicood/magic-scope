import { alert, Button } from '@magic-scope/react';
import { useState } from 'react';

// alert() 仅一个确认按钮,返回 Promise<void>:确认 / Esc / 点遮罩后 resolve。
// 适合「告知即可」的场景,await 之后再继续后续流程。
export default function Demo() {
  const [done, setDone] = useState(false);

  const notify = async () => {
    await alert('报表已导出到「我的文件」,下载链接 30 天内有效。', {
      title: '导出完成',
      confirmText: '好的',
    });
    setDone(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'start' }}>
      <Button onClick={notify}>提示完成 alert</Button>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
        {done ? '用户已知晓,流程继续。' : '点按钮后会先弹提示,确认后才继续。'}
      </p>
    </div>
  );
}
