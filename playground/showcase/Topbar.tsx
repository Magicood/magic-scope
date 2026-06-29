import { withViewTransition } from '@magic-scope/tokens';
import { type Density, type Scheme, setPrefs, type Tri, useThemePrefs } from './core/themeState';

interface SegProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

function Segmented<T extends string>({ label, value, options, onChange }: SegProps<T>) {
  return (
    <fieldset className="sc-seg" aria-label={label}>
      <span className="sc-seg__label">{label}</span>
      <div className="sc-seg__track">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="sc-seg__btn"
            aria-pressed={value === o.value}
            data-active={value === o.value ? '' : undefined}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export interface TopbarProps {
  query: string;
  onQuery: (q: string) => void;
}

/** 顶栏:品牌 + 搜索 + 主题/密度/动效/光影一键切换(用 View Transitions 平滑过渡)。 */
export function Topbar({ query, onQuery }: TopbarProps) {
  const prefs = useThemePrefs();

  return (
    <header className="sc-topbar">
      <a className="sc-topbar__brand" href="#/button">
        <span className="sc-topbar__spark" aria-hidden="true">
          ✦
        </span>
        <strong>magic-scope</strong>
        <span className="sc-topbar__tag">组件展示站</span>
      </a>

      <a className="sc-topbar__gallery" href="#/~theme">
        ✦ 主题画廊
      </a>
      <a className="sc-topbar__gallery sc-topbar__gallery--alt" href="#/~events">
        通用事件
      </a>

      <label className="sc-search">
        <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
          <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="搜索组件…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          aria-label="搜索组件"
        />
      </label>

      <div className="sc-topbar__controls">
        <Segmented<Scheme>
          label="配色"
          value={prefs.scheme}
          options={[
            { value: 'dark', label: '暗' },
            { value: 'light', label: '亮' },
          ]}
          onChange={(v) => withViewTransition(() => setPrefs({ scheme: v }))}
        />
        <Segmented<Density>
          label="密度"
          value={prefs.density}
          options={[
            { value: 'compact', label: '紧' },
            { value: 'comfortable', label: '适中' },
            { value: 'spacious', label: '松' },
          ]}
          onChange={(v) => setPrefs({ density: v })}
        />
        <Segmented<Tri>
          label="动效"
          value={prefs.motion}
          options={[
            { value: 'full', label: '全' },
            { value: 'subtle', label: '弱' },
            { value: 'off', label: '关' },
          ]}
          onChange={(v) => setPrefs({ motion: v })}
        />
        <Segmented<Tri>
          label="光影"
          value={prefs.fx}
          options={[
            { value: 'full', label: '强' },
            { value: 'subtle', label: '弱' },
            { value: 'off', label: '关' },
          ]}
          onChange={(v) => setPrefs({ fx: v })}
        />
      </div>
    </header>
  );
}
