import { Breadcrumb } from '@magic-scope/react';
import type { ComponentPropsWithoutRef } from 'react';

// 接路由库的两种方式:
// - linkAs:把「有 href 的非当前项」渲染成你的 Link 组件(href 作为 props 透传);
// - itemRender:完全接管单项渲染,按 isCurrent 决定链接或当前页文本(委托式 SPA 拦截入口)。
function RouterLink({ href, children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  return (
    <a href={href} data-router-link="" {...rest}>
      🔗 {children}
    </a>
  );
}

const items = [
  { label: '首页', href: '#/' },
  { label: '博客', href: '#/blog' },
  { label: '当前文章' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      <Breadcrumb linkAs={RouterLink} items={items} />
      <Breadcrumb
        items={items}
        itemRender={(item, state) =>
          state.isCurrent ? <strong>{item.label}</strong> : <a href={item.href}>{item.label}</a>
        }
      />
    </div>
  );
}
