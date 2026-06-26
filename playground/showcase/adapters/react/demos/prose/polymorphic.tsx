import { Prose } from '@magic-scope/react';

/**
 * 多态留口:
 *  - as 把根节点换成语义标签(article / section …),保持文档语义正确;
 *  - asChild 不额外包 DOM,把 prose 类与 props 合并到自带的唯一子元素上。
 */
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-6, 1.5rem)' }}>
      <div>
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--ms-color-fg-muted)',
            marginBlockEnd: 'var(--ms-space-2, 0.5rem)',
          }}
        >
          as="article" —— 根节点渲染成语义 &lt;article&gt;
        </div>
        <Prose as="article" style={{ inlineSize: 'min(560px, 100%)' }}>
          <h2>语义优先</h2>
          <p>
            内容是一篇文章时,用 <code>as="article"</code> 让根节点本身就是正确的语义元素,
            对屏幕阅读器与 SEO 更友好。
          </p>
        </Prose>
      </div>

      <div>
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--ms-color-fg-muted)',
            marginBlockEnd: 'var(--ms-space-2, 0.5rem)',
          }}
        >
          asChild —— 把排版类合并到已有的外层容器,不再多包一层 DOM
        </div>
        <Prose asChild tone="accent">
          <section
            style={{
              inlineSize: 'min(560px, 100%)',
              padding: 'var(--ms-space-4, 1rem)',
              borderRadius: 'var(--ms-radius-md, 0.5rem)',
              border: '1px dashed var(--ms-color-border, #e5e7eb)',
            }}
          >
            <h3>合并到现有节点</h3>
            <p>
              这个 <code>&lt;section&gt;</code> 是我自己写的容器(带内边距与虚线边框),
              <code>asChild</code> 把 <code>.ms-prose</code> 直接合并上来,DOM 层级不变。
            </p>
          </section>
        </Prose>
      </div>
    </div>
  );
}
