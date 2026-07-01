import { Button, Dropdown } from '@magic-scope/react';

// 数据驱动最小用法:trigger + items,含分隔线与危险项,选中即关。
export default function Demo() {
  return (
    <Dropdown
      trigger={<Button variant="outline">文件 ▾</Button>}
      items={[
        { label: '新建', icon: '＋', onSelect: () => {} },
        { label: '打开…', icon: '⌘', onSelect: () => {} },
        { label: '另存为', onSelect: () => {} },
        { type: 'separator' },
        { label: '删除', danger: true, onSelect: () => {} },
      ]}
    />
  );
}
