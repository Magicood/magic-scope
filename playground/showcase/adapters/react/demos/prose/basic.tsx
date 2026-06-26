import { Prose } from '@magic-scope/react';

export default function Demo() {
  return (
    <Prose style={{ inlineSize: 'min(560px, 100%)' }}>
      <h2>开始你的第一段排版</h2>
      <p>
        给 <code>Prose</code> 一段普通的 JSX,它会用后代选择器统一规范其中的标题、段落、
        <strong>强调</strong>、<em>斜体</em> 与 <a href="#prose">链接</a>
        ,你无需为任何元素手写一行类。
      </p>
      <p>正文行距、段间距、链接颜色全部来自 --ms-* token,随主题与密度自动缩放。</p>
    </Prose>
  );
}
