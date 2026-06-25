import { Button, Menu } from '@magic-scope/react';

export default function Demo() {
  return (
    <Menu
      trigger={<Button variant="outline">文件 ▾</Button>}
      items={[
        { label: '新建', onSelect: () => {} },
        { label: '打开', onSelect: () => {} },
        { label: '另存为', onSelect: () => {} },
      ]}
    />
  );
}
