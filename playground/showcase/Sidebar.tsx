import { CATALOG, CATEGORIES } from './core/catalog';

export interface SidebarProps {
  activeId: string;
  query: string;
}

/** 左侧分类导航;按 query 过滤(匹配组件名 / id / 简介)。 */
export function Sidebar({ activeId, query }: SidebarProps) {
  const q = query.trim().toLowerCase();
  const match = (text: string) => text.toLowerCase().includes(q);

  const visible = q
    ? CATALOG.filter((e) => match(e.name) || match(e.id) || match(e.summary))
    : CATALOG;

  return (
    <nav className="sc-sidebar" aria-label="组件导航">
      {CATEGORIES.map((cat) => {
        const items = visible.filter((e) => e.category === cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="sc-navgroup">
            <h3 className="sc-navgroup__title">
              {cat.label}
              <span className="sc-navgroup__count">{items.length}</span>
            </h3>
            <ul className="sc-navlist">
              {items.map((e) => (
                <li key={e.id}>
                  <a
                    href={`#/${e.id}`}
                    className="sc-navlink"
                    aria-current={e.id === activeId ? 'page' : undefined}
                    data-active={e.id === activeId ? '' : undefined}
                  >
                    {e.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {visible.length === 0 && <p className="sc-empty">没有匹配「{query}」的组件</p>}
    </nav>
  );
}
