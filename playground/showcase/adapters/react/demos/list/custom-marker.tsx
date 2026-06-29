import { List } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem', inlineSize: 'min(360px, 100%)' }}>
      {/* marker 传 ReactNode:每项用该节点作自定义标记(list-style:none + 自绘标记列) */}
      <List marker={<span aria-hidden="true">✦</span>} tone="primary" glow>
        <List.Item>自定义标记 · 星形图标</List.Item>
        <List.Item>tone 着色 + glow 辉光(受全局光影开关调制)</List.Item>
        <List.Item>标记列 aria-hidden,读屏只读内容</List.Item>
      </List>

      <List marker={<span aria-hidden="true">→</span>} tone="success" spacing="sm">
        <List.Item>箭头标记,success 色调</List.Item>
        <List.Item>spacing=sm 收紧行距</List.Item>
      </List>
    </div>
  );
}
