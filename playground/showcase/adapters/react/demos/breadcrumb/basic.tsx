import { Breadcrumb } from '@magic-scope/react';

export default function Demo() {
  return (
    <Breadcrumb
      items={[
        { label: '首页', href: '#/' },
        { label: '项目', href: '#/projects' },
        { label: 'Atlas 平台', href: '#/projects/atlas' },
        { label: '设置' },
      ]}
    />
  );
}
