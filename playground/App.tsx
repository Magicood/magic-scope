import { Component, type ReactNode, useEffect, useState } from 'react';
import { AlertDialogHost, Toaster } from '../packages/react/src/index';
import { ComponentView } from './showcase/ComponentView';
import { getV2 } from './showcase/core/registry2';
import { ComponentDocV2 } from './showcase/pages/ComponentDocV2';
import { CATEGORIES, ENTRIES, findEntry } from './showcase/registry';
import { Sidebar } from './showcase/Sidebar';
import { Topbar } from './showcase/Topbar';

function currentId(): string {
  const id = window.location.hash.replace(/^#\/?/, '');
  return findEntry(id) ? id : (ENTRIES[0]?.id ?? '');
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
    if (!window.location.hash && ENTRIES[0]) {
      window.location.hash = `#/${ENTRIES[0].id}`;
    }
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const entry = findEntry(activeId) ?? ENTRIES[0];
  const v2 = entry ? getV2(entry.id) : undefined;
  const categoryLabel = CATEGORIES.find((c) => c.id === entry?.category)?.label ?? '';

  return (
    <div className="sc-app">
      <Topbar query={query} onQuery={setQuery} />
      <div className="sc-body">
        <Sidebar activeId={activeId} query={query} />
        <main className="sc-main">
          {entry ? (
            <PageBoundary key={entry.id}>
              {v2 ? (
                <ComponentDocV2 doc={v2} categoryLabel={categoryLabel} />
              ) : (
                <ComponentView entry={entry} categoryLabel={categoryLabel} />
              )}
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
