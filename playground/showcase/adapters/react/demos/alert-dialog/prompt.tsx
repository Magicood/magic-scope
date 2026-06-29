import { Button, prompt } from '@magic-scope/react';
import { useState } from 'react';

// prompt() 返回 Promise<string | null>:确认返回输入值 / 取消·Esc·遮罩返回 null。
// 默认焦点落在输入框并全选,支持 placeholder 与 defaultValue,回车即确认。
export default function Demo() {
  const [name, setName] = useState('未命名项目');

  const rename = async () => {
    const next = await prompt('给这个项目起个新名字:', {
      title: '重命名项目',
      placeholder: '输入新名称',
      defaultValue: name,
      confirmText: '保存',
      cancelText: '取消',
    });
    if (next !== null && next.trim() !== '') setName(next.trim());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'start' }}>
      <Button onClick={rename}>重命名 prompt</Button>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
        当前名称:「{name}」
      </p>
    </div>
  );
}
