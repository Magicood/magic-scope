import { Editable } from '@magic-scope/react';

// 非受控行内编辑:defaultValue 初值、maxLength 字数上限、
// startWithEditView / defaultEditing 让初次渲染即进入编辑态。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.9rem', inlineSize: 'min(320px, 100%)' }}>
      <Editable defaultValue="点我编辑标题(最多 24 字)" maxLength={24} inputAriaLabel="标题" />
      <Editable
        defaultValue="startWithEditView:初次即编辑"
        startWithEditView
        inputAriaLabel="字段"
      />
      <Editable defaultValue="defaultEditing:同样默认展开" defaultEditing inputAriaLabel="字段" />
    </div>
  );
}
