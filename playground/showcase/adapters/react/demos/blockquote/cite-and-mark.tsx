import { Blockquote } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: 'min(560px, 100%)' }}>
      {/* 出处槽:cite 渲染为 <footer><cite>,citeUrl 写入原生 blockquote[cite](机器可读) */}
      <Blockquote cite="《奥术导论》第一卷" citeUrl="https://magic-scope.dev/arcana">
        约束不是限制创造力的牢笼,而是让创造力得以聚焦的透镜。
      </Blockquote>

      {/* 装饰大引号:true 用默认弯引号字形 */}
      <Blockquote variant="filled" quoteMark cite="无名法师">
        最强的咒语,往往是最早学会的那一个。
      </Blockquote>

      {/* 自定义引号字符 */}
      <Blockquote variant="card" quoteMark="❝" cite="星界商会">
        每一道符文,都是一次与未知的谈判。
      </Blockquote>

      {/* 图标槽:有 icon 时覆盖装饰引号(图标优先) */}
      <Blockquote variant="filled" tone="info" icon="✦" cite="占卜师的笔记">
        当你凝视水晶球时,记得它也在丈量你的耐心。
      </Blockquote>
    </div>
  );
}
