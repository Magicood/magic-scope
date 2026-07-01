import { Editable } from '@magic-scope/react';
import { useState } from 'react';

// 单行行内编辑:点击进入编辑,Enter / 失焦提交,Esc 取消还原。
export default function Demo() {
  const [name, setName] = useState('未命名看板');
  return (
    <div style={{ inlineSize: 'min(320px, 100%)' }}>
      <Editable value={name} onChange={setName} placeholder="点击命名" inputAriaLabel="看板名称" />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>已保存:{name}</small>
    </div>
  );
}
