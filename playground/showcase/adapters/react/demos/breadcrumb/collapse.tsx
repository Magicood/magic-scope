import { Breadcrumb } from '@magic-scope/react';

// 长路径折叠:超过 maxItems 时中间项收成可展开省略号(…),
// 保留头 itemsBeforeCollapse 项、尾 itemsAfterCollapse 项;tone 着色、ariaLabel 覆盖导航名。
export default function Demo() {
  return (
    <Breadcrumb
      tone="accent"
      ariaLabel="文件路径"
      maxItems={4}
      itemsBeforeCollapse={1}
      itemsAfterCollapse={2}
      items={[
        { label: '根目录', href: '#/' },
        { label: 'workspace', href: '#/ws' },
        { label: 'projects', href: '#/ws/projects' },
        { label: 'atlas', href: '#/ws/projects/atlas' },
        { label: 'src', href: '#/ws/projects/atlas/src' },
        { label: 'index.ts' },
      ]}
    />
  );
}
