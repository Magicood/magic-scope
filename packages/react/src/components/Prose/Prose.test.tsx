// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Prose } from './Prose';

describe('Prose', () => {
  it('默认渲染 div + ms-prose / 默认 size=md / tone=primary 类', () => {
    const { container } = render(<Prose>正文</Prose>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveClass('ms-prose', 'ms-prose--md', 'ms-tone-primary');
    expect(root).toHaveTextContent('正文');
  });

  it('size 档落到 ms-prose--{size} 类', () => {
    const { container, rerender } = render(<Prose size="sm">x</Prose>);
    expect(container.firstElementChild).toHaveClass('ms-prose--sm');
    rerender(<Prose size="lg">x</Prose>);
    expect(container.firstElementChild).toHaveClass('ms-prose--lg');
  });

  it('tone 落到全库 ms-tone-{tone} 槽位类', () => {
    const { container } = render(<Prose tone="accent">x</Prose>);
    expect(container.firstElementChild).toHaveClass('ms-tone-accent');
    expect(container.firstElementChild).not.toHaveClass('ms-tone-primary');
  });

  it('forwardRef 指到渲染的 DOM 元素', () => {
    const ref = createRef<HTMLElement>();
    render(<Prose ref={ref}>x</Prose>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('ms-prose');
  });

  it('as 多态:渲染为 article 仍带 prose 类', () => {
    const { container } = render(<Prose as="article">x</Prose>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('ARTICLE');
    expect(root).toHaveClass('ms-prose');
  });

  it('className 与 classNames.root 都拼到根、组件类在前用户类在后', () => {
    const { container } = render(
      <Prose className="user-cls" classNames={{ root: 'slot-cls' }}>
        x
      </Prose>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('ms-prose', 'slot-cls', 'user-cls');
    // 组件基类排在用户类之前
    expect(root.className.indexOf('ms-prose')).toBeLessThan(root.className.indexOf('user-cls'));
  });

  it('透传原生属性(id / data-* / aria-*)与事件', () => {
    const { container } = render(
      <Prose id="doc" data-foo="bar" aria-label="文档">
        x
      </Prose>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('id', 'doc');
    expect(root).toHaveAttribute('data-foo', 'bar');
    expect(root).toHaveAttribute('aria-label', '文档');
  });

  it('asChild:把 prose 类合并到唯一子元素、不额外包一层 DOM', () => {
    const { container } = render(
      <Prose asChild className="extra">
        <section data-testid="slot">内容</section>
      </Prose>,
    );
    // 根就是 section,没有外层 div 包裹
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('SECTION');
    expect(root).toHaveClass('ms-prose', 'ms-prose--md', 'ms-tone-primary', 'extra');
    expect(screen.getByTestId('slot')).toBe(root);
  });

  it('渲染冒烟:各富文本元素带语义标签作为样式钩子(h1-h6/p/ul/li/blockquote/code/pre/a/table/img)', () => {
    const { container } = render(
      <Prose>
        <h1>标题</h1>
        <h2>小节</h2>
        <p>
          一段正文,含 <a href="https://example.com">链接</a> 与 <code>inline</code> 代码、
          <strong>强调</strong> 与 <em>斜体</em>。
        </p>
        <ul>
          <li>项 A</li>
          <li>项 B</li>
        </ul>
        <blockquote>引用</blockquote>
        <pre>
          <code>const a = 1;</code>
        </pre>
        <hr />
        <table>
          <thead>
            <tr>
              <th>列</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>值</td>
            </tr>
          </tbody>
        </table>
        <img src="/x.png" alt="图" />
      </Prose>,
    );
    const root = container.firstElementChild as HTMLElement;
    // 后代选择器需要这些裸标签存在作为样式钩子 —— 逐一断言它们在 prose 容器内
    expect(root.querySelector('h1')).toBeInTheDocument();
    expect(root.querySelector('h2')).toBeInTheDocument();
    expect(root.querySelector('p')).toBeInTheDocument();
    expect(root.querySelector('ul > li')).toBeInTheDocument();
    expect(root.querySelector('blockquote')).toBeInTheDocument();
    expect(root.querySelector('p > a')).toHaveAttribute('href', 'https://example.com');
    expect(root.querySelector('p > code')).toHaveTextContent('inline');
    expect(root.querySelector('pre > code')).toHaveTextContent('const a = 1;');
    expect(root.querySelector('hr')).toBeInTheDocument();
    expect(root.querySelector('table thead th')).toHaveTextContent('列');
    expect(root.querySelector('table tbody td')).toHaveTextContent('值');
    expect(root.querySelector('img')).toHaveAttribute('alt', '图');
  });

  it('支持调用方在传入元素上自行用 dangerouslySetInnerHTML(组件不内置但不阻断)', () => {
    const { container } = render(
      <Prose>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: 测试调用方自带 HTML 的用法 */}
        <div dangerouslySetInnerHTML={{ __html: '<p>来自 CMS</p>' }} />
      </Prose>,
    );
    expect((container.firstElementChild as HTMLElement).querySelector('p')).toHaveTextContent(
      '来自 CMS',
    );
  });
});
