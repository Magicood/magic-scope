import { Component, type ReactNode, useState } from 'react';
import { eventExample, parseEventParams } from '../core/eventSig';
import { getProps } from '../core/props';
import type { ComponentDoc } from '../core/types';
import type { Control } from '../types';
import { CodeBlock } from '../ui/CodeBlock';
import { useControls } from '../useControls';

// 设备视口档（展示容器查询自适应 + 移动端形态切换）。
const VIEWPORTS = [
  { id: 'full', label: '自适应', width: '100%' },
  { id: 'tablet', label: '平板 768', width: 'min(768px, 100%)' },
  { id: 'mobile', label: '移动 390', width: 'min(390px, 100%)' },
] as const;

// meta.spread 元素 → 对应 HTMLElement 类型(校正继承事件签名的元素泛型)。
const NATIVE_EL: Record<string, string> = {
  button: 'HTMLButtonElement',
  input: 'HTMLInputElement',
  textarea: 'HTMLTextAreaElement',
  a: 'HTMLAnchorElement',
  select: 'HTMLSelectElement',
  label: 'HTMLLabelElement',
  span: 'HTMLSpanElement',
  hr: 'HTMLHRElement',
  ul: 'HTMLUListElement',
  ol: 'HTMLOListElement',
  table: 'HTMLTableElement',
  kbd: 'HTMLElement',
};

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
  // 事件分两块:① 组件**专有**事件精写(签名 + 逐个参数 + 说明 + 调用示例);
  // ② 透传原生元素的**通用**事件不在此重复,引用「通用事件」页(仅对有 spread 的组件)。
  const isEvent = (n: string) => /^on[A-Z]/.test(n);
  const ownEvents = props.filter((p) => isEvent(p.name) && !p.native);
  const propRows = props.filter((p) => !isEvent(p.name));
  // react-docgen 把继承事件的元素泛型统一抽成 HTMLDivElement;按组件真实根元素(meta.spread)校正。
  const elType = meta.spread ? (NATIVE_EL[meta.spread] ?? 'HTMLElement') : undefined;
  const fmtEventType = (type: string) => {
    const fixed = elType ? type.replace(/HTMLDivElement/g, elType) : type;
    return fixed.replace(/^\((.+)\)$/, '$1');
  };
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

      {propRows.length > 0 && (
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
                {propRows.map((p) => (
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

      {(ownEvents.length > 0 || meta.spread) && (
        <section className="sc-section">
          <h2 className="sc-h2">
            事件 Events{ownEvents.length > 0 ? `（${ownEvents.length} 个组件专有）` : ''}
          </h2>

          {ownEvents.length > 0 && (
            <div className="sc-events">
              {ownEvents.map((e) => {
                const sig = fmtEventType(e.type);
                const params = parseEventParams(sig);
                // @param 逐参说明(抽自源码,按参数名对应回调签名参数)。
                const paramDoc = (n: string) => e.params?.find((d) => d.name === n)?.description;
                return (
                  <div key={e.name} className="sc-event">
                    <div className="sc-event__head">
                      <code className="sc-code-name">{e.name}</code>
                      <code className="sc-code-type">{sig}</code>
                    </div>
                    {params.length > 0 && (
                      <div className="sc-event__params">
                        <span className="sc-event__plabel">参数</span>
                        <ul>
                          {params.map((p) => {
                            const desc = paramDoc(p.name);
                            return (
                              <li key={p.name}>
                                <code className="sc-code-name">
                                  {p.name}
                                  {p.optional ? '?' : ''}
                                </code>
                                <span className="sc-event__psep">:</span>
                                <code className="sc-code-type">{p.type}</code>
                                {desc && <span className="sc-event__pdesc">— {desc}</span>}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {e.description && <p className="sc-event__desc">{e.description}</p>}
                    <CodeBlock sources={{ react: eventExample(meta.name, e.name, params) }} />
                  </div>
                );
              })}
            </div>
          )}

          {meta.spread && (
            <p className="sc-event__native">
              + 透传原生 <code>&lt;{meta.spread}&gt;</code> 的全部标准事件(onClick / onFocus /
              onKeyDown / onPointer* 等),绑定方式同原生 <code>{'onX={(e) => …}'}</code> ——
              完整清单与示例见 <a href="#/~events">通用事件 →</a>
            </p>
          )}
        </section>
      )}
    </article>
  );
}
