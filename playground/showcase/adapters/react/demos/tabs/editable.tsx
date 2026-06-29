import type { TabItem, TabsEditAction } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 可编辑(对标 editable-card):addable 末尾渲染「新增」按钮,TabItem.closable 渲染关闭按钮,
// 增删均经 onEdit(value, 'add' | 'remove') 回流,内容区状态在文件内自管。
export default function Demo() {
  const [items, setItems] = useState<TabItem[]>([
    { value: 'overview', label: 'Overview 概览', closable: true, content: <Panel name="概览" /> },
    { value: 'activity', label: 'Activity 活动', closable: true, content: <Panel name="活动" /> },
    { value: 'members', label: 'Members 成员', closable: true, content: <Panel name="成员" /> },
  ]);
  const [active, setActive] = useState('overview');
  const nextRef = useRef(4);

  const handleEdit = (value: string, action: TabsEditAction) => {
    if (action === 'add') {
      const id = `tab-${nextRef.current}`;
      nextRef.current += 1;
      const label = `新标签 ${nextRef.current - 1}`;
      setItems((prev) => [
        ...prev,
        { value: id, label, closable: true, content: <Panel name={label} /> },
      ]);
      setActive(id);
      return;
    }
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.value === value);
      const next = prev.filter((it) => it.value !== value);
      // 关掉当前选中项时,焦点回退到相邻标签。
      if (value === active && next.length > 0) {
        setActive(next[Math.max(0, idx - 1)].value);
      }
      return next;
    });
  };

  return (
    <div style={{ inlineSize: 'min(32rem, 100%)' }}>
      <Tabs items={items} value={active} onChange={setActive} addable onEdit={handleEdit} />
    </div>
  );
}

function Panel({ name }: { name: string }) {
  return (
    <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
      这是「{name}」的内容面板。点标签上的 × 移除,点末尾的 + 新增并自动选中。
    </p>
  );
}
