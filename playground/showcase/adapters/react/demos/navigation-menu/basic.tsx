import { NavigationMenu, type NavMenuItem } from '@magic-scope/react';

// 数据驱动导航:两个带链接网格的 mega-menu + 一个纯链接项(active 标当前页)。
const items: NavMenuItem[] = [
  {
    value: 'features',
    label: '功能',
    links: [
      { label: '组件', href: '#components', description: '开箱即用的 UI 组件' },
      { label: '主题', href: '#themes', description: '一键切换配色与动效' },
    ],
  },
  {
    value: 'company',
    label: '公司',
    links: [
      { label: '关于', href: '#about' },
      { label: '博客', href: '#blog' },
    ],
  },
  { value: 'docs', label: '文档', href: '#docs', active: true },
];

export default function Demo() {
  return (
    <div style={{ minBlockSize: '200px' }}>
      <NavigationMenu items={items} aria-label="站点导航" />
    </div>
  );
}
