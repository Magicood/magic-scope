import { List } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem', inlineSize: 'min(360px, 100%)' }}>
      <List variant="unordered" marker="square">
        <List.Item>square 方块标记</List.Item>
        <List.Item>marker 直接传 list-style-type 字符串</List.Item>
      </List>

      <List variant="ordered" marker="lower-roman">
        <List.Item>lower-roman 罗马数字</List.Item>
        <List.Item>有序列表换一档标记</List.Item>
      </List>

      <List variant="ordered" marker="upper-alpha" markerPosition="inside">
        <List.Item>upper-alpha 拉丁字母</List.Item>
        <List.Item>markerPosition=inside 让标记随首行内嵌</List.Item>
      </List>
    </div>
  );
}
