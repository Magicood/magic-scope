import { List } from '@magic-scope/react';

// markerNode:在单个 List.Item 上覆盖标记(优先于 List 级 marker),用于「高亮某一条」。
export default function Demo() {
  return (
    <List tone="primary" style={{ inlineSize: 'min(360px, 100%)' }}>
      <List.Item>普通条目(走 List 默认标记)</List.Item>
      <List.Item markerNode={<span aria-hidden="true">★</span>}>
        重点条目 · 单项 markerNode 覆盖
      </List.Item>
      <List.Item markerNode={<span aria-hidden="true">✓</span>}>已完成 · 另一种单项标记</List.Item>
    </List>
  );
}
