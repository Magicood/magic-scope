import { Breadcrumb } from '@magic-scope/react';

// 对抗性内容:超长无空格串 + 巨量文本作为 label,验证被收在边界内,
// 不撑破布局、不裁掉链接的焦点环。约束容器宽度以暴露边界行为。
export default function Demo() {
  return (
    <div
      style={{
        inlineSize: 'min(360px, 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <Breadcrumb
        items={[
          { label: '首页', href: '#/' },
          {
            label: '召唤一个名字超级超级长且中间完全没有任何空格用于断行的远古传送门法术节点',
            href: '#/grimoire/portal',
          },
          { label: 'summon_an_extremely_long_unbreakable_portal_spell_identifier_token' },
        ]}
      />
    </div>
  );
}
