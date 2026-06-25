import { Component, type ReactNode, useState } from 'react';
import { getProps } from '../core/props';
import type { ComponentDoc } from '../core/types';
import type { Control } from '../types';
import { CodeBlock } from '../ui/CodeBlock';
import { useControls } from '../useControls';

// 设备视口档（展示容器查询自适应 + 移动端形态切换）。
const VIEWPORTS = [
  { id: 'full', label: '自适应', width: '100%' },
  { id: 'tablet', label: '平板 768', width: '768px' },
  { id: 'mobile', label: '移动 390', width: '390px' },
] as const;

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

export function ComponentDocV2({
  doc,
  categoryLabel,
}: {
  doc: ComponentDoc;
  categoryLabel: string;
}) {
  const { meta, react } = doc;
  const { values, set, reset } = useControls(meta.controls);
  const [vp, setVp] = useState<string>('full');
  const props = getProps(meta.propsName ?? meta.name, meta.alsoProps, meta.spread);
  const width = VIEWPORTS.find((v) => v.id === vp)?.width ?? '100%';

  return (
    <article className="sc-view">
      <header className="sc-view__head">
        <div className="sc-view__crumb">
          {categoryLabel}
          <span className="sc-badge-src" title="props 由真实 TS 类型自动抽取">
            props 源自源码 ✓
          </span>
        </div>
        <h1 className="sc-h1">{meta.name}</h1>
        <p className="sc-summary">{meta.summary}</p>
        {meta.description && <p className="sc-desc">{meta.description}</p>}
      </header>

      <section className="sc-section">
        <div className="sc-section__head">
          <h2 className="sc-h2">演示 Demo</h2>
          <fieldset className="sc-seg2" aria-label="视口">
            {VIEWPORTS.map((v) => (
              <button
                key={v.id}
                type="button"
                className="sc-seg2__btn"
                data-active={vp === v.id ? '' : undefined}
                aria-pressed={vp === v.id}
                onClick={() => setVp(v.id)}
              >
                {v.label}
              </button>
            ))}
          </fieldset>
        </div>
        <div className="sc-demo">
          <div className="sc-demo__stage">
            <div
              className="sc-vpframe"
              data-framed={vp !== 'full' ? '' : undefined}
              style={{ inlineSize: width }}
            >
              <DemoBoundary key={meta.id}>
                <react.Playground values={values} />
              </DemoBoundary>
            </div>
          </div>
          {meta.controls.length > 0 && (
            <aside className="sc-demo__controls">
              <div className="sc-controls__head">
                <span>参数</span>
                <button type="button" className="sc-reset" onClick={reset}>
                  重置
                </button>
              </div>
              <div className="sc-controls__body">
                {meta.controls.map((c) => (
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

      {react.demos.length > 0 && (
        <section className="sc-section">
          <h2 className="sc-h2">示例 Examples（代码即运行物 ✓）</h2>
          <div className="sc-examples">
            {react.demos.map((d) => (
              <div key={d.name} className="sc-example">
                <div className="sc-example__head">
                  <strong>{d.name}</strong>
                  <span>实时渲染 + 真实源码,同一文件</span>
                </div>
                <div className="sc-example__stage">
                  <DemoBoundary>
                    <d.Comp />
                  </DemoBoundary>
                </div>
                <CodeBlock sources={d.sources} />
              </div>
            ))}
          </div>
        </section>
      )}

      {props.length > 0 && (
        <section className="sc-section">
          <h2 className="sc-h2">参数 Props（自动抽取自 TS）</h2>
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
                      {p.required && (
                        <span className="sc-req" title="必填">
                          {' '}
                          *
                        </span>
                      )}
                    </td>
                    <td>
                      <code className="sc-code-type">{p.type}</code>
                    </td>
                    <td>
                      {p.default && p.default !== '—' ? (
                        <code className="sc-code-def">{p.default}</code>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </article>
  );
}
