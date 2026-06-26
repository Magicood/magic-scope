import { List } from '@magic-scope/react';

// 对抗性 demo:超长不换行串、巨量文本、嵌套层级,验证不撑破容器、标记不错位。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem', inlineSize: 'min(360px, 100%)' }}>
      <List variant="unordered" marker="disc">
        <List.Item>
          超长不换行串:supercalifragilisticexpialidocious-abracadabra-prestidigitation-1234567890
        </List.Item>
        <List.Item>
          巨量文本不撑破:这是一段刻意拉得很长的列表项内容,用来验证在窄容器下文字能够自然换行,标记保持在内容框外正确对齐,而不会把卡片或视口横向撑破,也不会让相邻项的基线发生错位。
        </List.Item>
        <List.Item>
          嵌套列表(标记与间距独立,不向下穿透):
          <List variant="ordered" marker="lower-alpha" spacing="xs">
            <List.Item>子项一 · 自有 lower-alpha 标记</List.Item>
            <List.Item>子项二 · 自有间距档,天然缩进成层级</List.Item>
          </List>
        </List.Item>
      </List>

      <List variant="description">
        <List.Term>超长术语 supercalifragilisticexpialidocious-prestidigitation</List.Term>
        <List.Detail>
          对应释义同样很长:描述列表在 dt 很长时也要保持 dd
          正常换行与缩进,不依赖固定宽度,密度变化下仍可读。
        </List.Detail>
      </List>
    </div>
  );
}
