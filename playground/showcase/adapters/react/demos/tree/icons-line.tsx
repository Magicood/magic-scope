import type { TreeNode } from '@magic-scope/react';
import { Tree } from '@magic-scope/react';

const data: TreeNode[] = [
  {
    key: 'workspace',
    title: '工作区',
    icon: '🗂️',
    children: [
      {
        key: 'assets',
        title: '资源',
        icon: '📦',
        children: [
          { key: 'logo', title: 'logo.svg', icon: '🖼️' },
          { key: 'font', title: 'font.woff2', icon: '🔤' },
        ],
      },
      {
        key: 'scripts',
        title: '脚本',
        icon: '📁',
        children: [
          { key: 'build', title: 'build.ts', icon: '📄' },
          { key: 'deploy', title: 'deploy.ts', icon: '📄' },
        ],
      },
    ],
  },
];

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(300px, 100%)' }}>
      {/* showIcon 渲染 node.icon,showLine 显示缩进引导线 */}
      <Tree data={data} showIcon showLine defaultExpandAll />
    </div>
  );
}
