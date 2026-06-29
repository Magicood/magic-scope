import { Blockquote } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: 'min(560px, 100%)' }}>
      {/* 出处槽:cite 渲染为 <footer><cite>,citeUrl 写入原生 blockquote[cite](机器可读) */}
      <Blockquote cite="《设计系统指南》第一章" citeUrl="https://magic-scope.dev/guide">
        约束不是限制创造力的牢笼,而是让创造力得以聚焦的透镜。
      </Blockquote>

      {/* 装饰大引号:true 用默认弯引号字形 */}
      <Blockquote variant="filled" quoteMark cite="Mira Chen,产品负责人">
        最常用的功能,往往是用户最早学会的那一个。
      </Blockquote>

      {/* 自定义引号字符 */}
      <Blockquote variant="card" quoteMark="❝" cite="平台团队">
        每一次接口变更,都是一次与下游使用方的协商。
      </Blockquote>

      {/* 图标槽:有 icon 时覆盖装饰引号(图标优先) */}
      <Blockquote variant="filled" tone="info" icon="✦" cite="用户调研笔记">
        当你盯着数据看板时,记得它也在衡量你的耐心。
      </Blockquote>
    </div>
  );
}
