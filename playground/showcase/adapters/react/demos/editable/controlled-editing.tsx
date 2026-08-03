import { Button, Editable } from '@magic-scope/react';
import { useState } from 'react';

// 受控编辑态:editing + onEditingChange 由外部托管,可从组件之外触发进入 / 退出编辑。
export default function Demo() {
  const [value, setValue] = useState('受控编辑态');
  const [editing, setEditing] = useState(false);
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.6rem',
        justifyItems: 'start',
        inlineSize: 'min(320px, 100%)',
      }}
    >
      <Editable
        value={value}
        onChange={setValue}
        editing={editing}
        onEditingChange={setEditing}
        inputAriaLabel="标题"
      />
      <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
        {editing ? '退出编辑' : '从外部进入编辑'}
      </Button>
    </div>
  );
}
