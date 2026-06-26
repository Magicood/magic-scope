import { List } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem', inlineSize: 'min(360px, 100%)' }}>
      <List variant="unordered">
        <List.Item>无序列表 · 渲染为 ul</List.Item>
        <List.Item>默认 disc 实心圆标记</List.Item>
      </List>

      <List variant="ordered">
        <List.Item>有序列表 · 渲染为 ol</List.Item>
        <List.Item>默认 decimal 数字标记</List.Item>
      </List>

      <List variant="description">
        <List.Term>描述列表</List.Term>
        <List.Detail>渲染为 dl,术语 dt 与释义 dd 成对。</List.Detail>
        <List.Term>语义优先</List.Term>
        <List.Detail>三态切换只改一个 variant。</List.Detail>
      </List>
    </div>
  );
}
