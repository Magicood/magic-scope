import { Component, type ReactNode } from 'react';
import type { Control, DocEntry, PropDoc } from './types';
import { useControls } from './useControls';

// —— 演示出错时的兜底,避免单个组件 render 抛错白屏整页 ——
class DemoBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <div className="sc-demo-error">演示渲染出错:{this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

function ControlField({
  control,
  value,
  onChange,
}: {
  control: Control;
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
}) {
  if (control.type === 'select') {
    return (
      <label className="sc-ctl">
        <span className="sc-ctl__label">{control.label}</span>
        <div className="sc-ctl__select">
          <select value={String(value)} onChange={(e) => onChange(e.target.value)}>
            {control.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </label>
    );
  }
  if (control.type === 'boolean') {
    return (
      <label className="sc-ctl sc-ctl--inline">
        <input
          type="checkbox"
          className="sc-ctl__check"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="sc-ctl__label">{control.label}</span>
      </label>
    );
  }
  if (control.type === 'number') {
    return (
      <label className="sc-ctl">
        <span className="sc-ctl__label">{control.label}</span>
        <input
          type="number"
          className="sc-ctl__input"
          value={Number(value)}
          min={control.min}
          max={control.max}
          step={control.step}
          onChange={(e) => onChange(e.target.valueAsNumber)}
        />
      </label>
    );
  }
  return (
    <label className="sc-ctl">
      <span className="sc-ctl__label">{control.label}</span>
      <input
        type="text"
        className="sc-ctl__input"
        value={String(value)}
        placeholder={control.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function PropsTable({ props }: { props: PropDoc[] }) {
  if (props.length === 0) return null;
  return (
    <section className="sc-section">
      <h2 className="sc-h2">参数 Props</h2>
      <div className="sc-table-wrap">
        <table className="sc-proptable">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>默认值</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => (
              <tr key={p.name}>
                <td>
                  <code className="sc-code-name">{p.name}</code>
                </td>
                <td>
                  <code className="sc-code-type">{p.type}</code>
                </td>
                <td>{p.default ? <code className="sc-code-def">{p.default}</code> : '—'}</td>
                <td>{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ComponentView({
  entry,
  categoryLabel,
}: {
  entry: DocEntry;
  categoryLabel: string;
}) {
  const { values, set, reset } = useControls(entry.controls);

  return (
    <article className="sc-view">
      <header className="sc-view__head">
        <div className="sc-view__crumb">{categoryLabel}</div>
        <h1 className="sc-h1">{entry.name}</h1>
        <p className="sc-summary">{entry.summary}</p>
        {entry.description && <p className="sc-desc">{entry.description}</p>}
      </header>

      <section className="sc-section">
        <h2 className="sc-h2">演示 Demo</h2>
        <div className="sc-demo">
          <div className="sc-demo__stage">
            <DemoBoundary key={entry.id}>{entry.render(values)}</DemoBoundary>
          </div>
          {entry.controls.length > 0 && (
            <aside className="sc-demo__controls">
              <div className="sc-controls__head">
                <span>参数</span>
                <button type="button" className="sc-reset" onClick={reset}>
                  重置
                </button>
              </div>
              <div className="sc-controls__body">
                {entry.controls.map((c) => (
                  <ControlField
                    key={c.prop}
                    control={c}
                    value={values[c.prop]}
                    onChange={(v) => set(c.prop, v)}
                  />
                ))}
              </div>
            </aside>
          )}
        </div>
      </section>

      {entry.usage && (
        <section className="sc-section">
          <h2 className="sc-h2">用法 Usage</h2>
          <pre className="sc-code">
            <code>{entry.usage}</code>
          </pre>
        </section>
      )}

      <PropsTable props={entry.props} />

      {entry.examples && entry.examples.length > 0 && (
        <section className="sc-section">
          <h2 className="sc-h2">更多示例 Examples</h2>
          <div className="sc-examples">
            {entry.examples.map((ex) => (
              <div key={ex.title} className="sc-example">
                <div className="sc-example__head">
                  <strong>{ex.title}</strong>
                  {ex.description && <span>{ex.description}</span>}
                </div>
                <div className="sc-example__stage">{ex.node}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
