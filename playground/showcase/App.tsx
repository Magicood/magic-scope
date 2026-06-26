import { AlertDialogHost, Toaster } from '@magic-scope/react';
import { Component, type ReactNode, useEffect, useState } from 'react';
import { CATALOG, categoryLabel, findCatalog } from './core/catalog';
import { getV2 } from './core/registry2';
import { CommonEvents } from './pages/CommonEvents';
import { ComponentDocV2 } from './pages/ComponentDocV2';
import { ThemeGallery } from './pages/ThemeGallery';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

// 特殊路由(非组件页):预设画廊、通用事件参考。
export const GALLERY_ROUTE = '~theme';
export const EVENTS_ROUTE = '~events';
const SPECIAL_ROUTES = new Set([GALLERY_ROUTE, EVENTS_ROUTE]);

function currentId(): string {
  const id = window.location.hash.replace(/^#\/?/, '');
  if (SPECIAL_ROUTES.has(id)) return id;
  return findCatalog(id) ? id : (CATALOG[0]?.id ?? '');
}

// 页面级兜底:任何单个组件页崩溃只显示局部错误,绝不白屏整站。
class PageBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="sc-page-error">
          <h2>该组件页渲染出错</h2>
          <pre>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [activeId, setActiveId] = useState<string>(currentId);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onHash = () => {
      setActiveId(currentId());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    if (!window.location.hash && CATALOG[0]) {
      window.location.hash = `#/${CATALOG[0].id}`;
    }
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const special = SPECIAL_ROUTES.has(activeId) ? activeId : undefined;
  const id = special ? special : findCatalog(activeId) ? activeId : (CATALOG[0]?.id ?? '');
  const doc = special ? undefined : getV2(id);

  return (
    <div className="sc-app">
      <Topbar query={query} onQuery={setQuery} />
      <div className="sc-body">
        <Sidebar activeId={id} query={query} />
        <main className="sc-main">
          {special === GALLERY_ROUTE ? (
            <PageBoundary key="gallery">
              <ThemeGallery />
            </PageBoundary>
          ) : special === EVENTS_ROUTE ? (
            <PageBoundary key="events">
              <CommonEvents />
            </PageBoundary>
          ) : doc ? (
            <PageBoundary key={doc.meta.id}>
              <ComponentDocV2 doc={doc} categoryLabel={categoryLabel(doc.meta.category)} />
            </PageBoundary>
          ) : (
            <p className="sc-empty">没有可展示的组件。</p>
          )}
        </main>
      </div>
      <Toaster position="bottom-end" />
      <AlertDialogHost />
    </div>
  );
}
