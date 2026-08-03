import type { TabItem, TabsEditAction } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';
import { useRef, useState } from 'react';

// keepMounted:所有 panel 常驻挂载(切走不卸载,保留表单 / 滚动态);
// addLabel:可编辑 tabs 新增按钮的自定义文案(默认「+」)。
export default function Demo() {
  const [items, setItems] = useState<TabItem[]>([
    {
      value: 'a',
      label: '草稿 A',
      closable: true,
      content: (
        <textarea
          defaultValue="切到 B 再切回 —— 这里的输入仍在(keepMounted)"
          style={{ inlineSize: '100%', minBlockSize: '4rem', boxSizing: 'border-box' }}
        />
      ),
    },
    {
      value: 'b',
      label: '草稿 B',
      closable: true,
      content: <p style={{ margin: 0 }}>第二个面板。</p>,
    },
  ]);
  const [active, setActive] = useState('a');
  const nextRef = useRef(1);

  const handleEdit = (value: string, action: TabsEditAction) => {
    if (action === 'add') {
      const id = `t-${nextRef.current}`;
      nextRef.current += 1;
      setItems((prev) => [
        ...prev,
        {
          value: id,
          label: '新草稿',
          closable: true,
          content: <p style={{ margin: 0 }}>新面板。</p>,
        },
      ]);
      setActive(id);
      return;
    }
    setItems((prev) => prev.filter((it) => it.value !== value));
  };

  return (
    <div style={{ inlineSize: 'min(32rem, 100%)' }}>
      <Tabs
        items={items}
        value={active}
        onChange={setActive}
        keepMounted
        addable
        addLabel="新建草稿"
        onEdit={handleEdit}
      />
    </div>
  );
}
