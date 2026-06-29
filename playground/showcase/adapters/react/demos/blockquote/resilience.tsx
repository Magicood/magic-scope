import { Blockquote } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: 'min(560px, 100%)' }}>
      {/* 超长无空格串:max-inline-size:100% + 断词,不撑破容器、不溢出 */}
      <Blockquote variant="card" tone="warning" quoteMark cite="一段没有空格的长串">
        测试令牌:Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
      </Blockquote>

      {/* 巨量文本:多段长引用应正常换行、保持行高,不破坏布局 */}
      <Blockquote variant="filled" tone="info" size="sm">
        当一段引用变得很长很长的时候,它依然应当老实地在容器里换行、保持 --ms-leading-*
        的行高节奏,而不是把版心顶开、把右侧的留白吃掉,或者让出处区
        与正文挤成一团。无论是中文连续不断的长句,还是中英混排里夹杂的
        supercalifragilisticexpialidocious 这种长单词,都要被妥善断开。
      </Blockquote>

      {/* 超长出处 URL:citeUrl 写入原生属性不可见,cite 文本本身也可能很长 */}
      <Blockquote
        cite="一个长到离谱的出处来源名称——来自某个嵌套很深的文档库子目录索引条目"
        citeUrl="https://magic-scope.dev/very/deeply/nested/docs/library/catalogue/index/entry?ref=infinite-scroll-of-doom"
      >
        出处再长,也不该把引用框撑变形。
      </Blockquote>
    </div>
  );
}
