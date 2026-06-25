import { Breadcrumb } from '@magic-scope/react';

export default function Demo() {
  return (
    <Breadcrumb
      items={[
        { label: '首页', href: '#/' },
        { label: '法术书', href: '#/grimoire' },
        { label: '奥术', href: '#/grimoire/arcane' },
        { label: '召唤阵' },
      ]}
    />
  );
}
