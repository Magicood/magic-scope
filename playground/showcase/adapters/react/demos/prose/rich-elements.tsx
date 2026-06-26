import { Prose } from '@magic-scope/react';

/**
 * 全元素总览:Prose 的「重头」在 CSS,这里把它能规范的元素一次铺满 ——
 * 标题层级 / 段落 / 有序无序列表 / 引用 / 行内与块级代码 / 表格 / 分隔线 / 链接 / 图片。
 */
export default function Demo() {
  return (
    <Prose style={{ inlineSize: 'min(640px, 100%)' }}>
      <h1>一篇文章的全部排版元素</h1>
      <p>
        这是一段引言,演示正文与 <strong>加粗</strong>、<em>斜体</em>、<code>行内代码</code> 以及{' '}
        <a href="#prose">超链接</a> 的混排。
      </p>

      <h2>有序与无序列表</h2>
      <ol>
        <li>第一步:把内容渲染成 HTML / JSX</li>
        <li>
          第二步:用 <code>Prose</code> 包一层
          <ul>
            <li>嵌套列表也有正确的缩进</li>
            <li>标记颜色跟随 tone</li>
          </ul>
        </li>
        <li>第三步:完成,无需手写任何类</li>
      </ol>

      <h2>引用</h2>
      <blockquote>排版不是装饰,而是让信息以最省力的方式被读到。</blockquote>

      <h2>代码块</h2>
      <pre>
        <code>{`import { Prose } from '@magic-scope/react';

export const Article = ({ html }) => (
  <Prose dangerouslySetInnerHTML={undefined}>
    {html}
  </Prose>
);`}</code>
      </pre>

      <h2>表格</h2>
      <table>
        <thead>
          <tr>
            <th>元素</th>
            <th>来源 token</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>标题字号</td>
            <td>--ms-type-step-*</td>
          </tr>
          <tr>
            <td>正文行距</td>
            <td>--ms-leading-*</td>
          </tr>
          <tr>
            <td>链接色</td>
            <td>tone 槽位</td>
          </tr>
        </tbody>
      </table>

      <hr />
      <p>分隔线之后,排版规范依旧一致。</p>
    </Prose>
  );
}
