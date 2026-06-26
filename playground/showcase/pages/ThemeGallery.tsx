import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Kbd,
  Progress,
  Slider,
  Switch,
  Tag,
} from '@magic-scope/react';
import { getTheme, presetFamilies, withViewTransition } from '@magic-scope/tokens';
import { type Scheme, setPrefs, type Tri, useThemePrefs } from '../core/themeState';

function Seg<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="sc-seg2" aria-label={label}>
      <span className="sc-gallery__diallabel">{label}</span>
      {options.map(([v, lab]) => (
        <button
          key={v}
          type="button"
          className="sc-seg2__btn"
          data-active={value === v ? '' : undefined}
          aria-pressed={value === v}
          onClick={() => onChange(v)}
        >
          {lab}
        </button>
      ))}
    </fieldset>
  );
}

const TRI_LABEL: Record<Tri, string> = { full: '全', subtle: '弱', off: '关' };

/** 预设画廊:配色 × 明暗 × 动效 × 光影 四维正交,组合即时预览、整站同步换肤、刷新保持。 */
export function ThemeGallery() {
  const prefs = useThemePrefs();
  const familyLabel = presetFamilies.find((f) => f.name === prefs.family)?.label ?? prefs.family;

  return (
    <article className="sc-view sc-gallery">
      <header className="sc-view__head">
        <div className="sc-view__crumb">
          主题 Theme
          <span className="sc-badge-src" title="配色数据源自 @magic-scope/tokens presetFamilies">
            预设源自 tokens
          </span>
        </div>
        <h1 className="sc-h1">预设画廊 Theme Gallery</h1>
        <p className="sc-summary">
          配色 × 明暗 × 动效 × 光影,四个维度彼此正交,任意组合即时预览,整站同步换肤。
        </p>
        <p className="sc-desc">
          选一套配色,下面的采样器与整个展示站随之换肤,经 View Transitions
          平滑过渡。偏好会记住,刷新后保持。
        </p>
      </header>

      <section className="sc-section">
        <h2 className="sc-h2">配色 Palette</h2>
        <div className="sc-swatches">
          {presetFamilies.map((f) => {
            const t = getTheme(f.name, prefs.scheme);
            const primary = t?.color.primary ?? '#888';
            return (
              <button
                key={f.name}
                type="button"
                className="sc-swatch"
                data-active={prefs.family === f.name ? '' : undefined}
                aria-pressed={prefs.family === f.name}
                onClick={() => withViewTransition(() => setPrefs({ family: f.name }))}
              >
                <span className="sc-swatch__preview" style={{ background: t?.color.bg ?? '#111' }}>
                  <span style={{ background: primary }} />
                  <span style={{ background: t?.color.accent ?? '#888' }} />
                  <span style={{ background: t?.color.success ?? '#888' }} />
                </span>
                <span className="sc-swatch__meta">
                  <span className="sc-swatch__label">{f.label}</span>
                  <code className="sc-swatch__hex">{primary}</code>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="sc-section">
        <div className="sc-gallery__dials">
          <Seg<Scheme>
            label="明暗"
            value={prefs.scheme}
            options={[
              ['dark', '暗'],
              ['light', '亮'],
            ]}
            onChange={(v) => withViewTransition(() => setPrefs({ scheme: v }))}
          />
          <Seg<Tri>
            label="动效"
            value={prefs.motion}
            options={[
              ['full', '全'],
              ['subtle', '弱'],
              ['off', '关'],
            ]}
            onChange={(v) => setPrefs({ motion: v })}
          />
          <Seg<Tri>
            label="光影"
            value={prefs.fx}
            options={[
              ['full', '强'],
              ['subtle', '弱'],
              ['off', '关'],
            ]}
            onChange={(v) => setPrefs({ fx: v })}
          />
          <p className="sc-gallery__active" aria-live="polite">
            <span>当前</span>
            <code>{familyLabel}</code>
            <code>{prefs.scheme === 'dark' ? '暗' : '亮'}</code>
            <code>动效 {TRI_LABEL[prefs.motion]}</code>
            <code>光影 {TRI_LABEL[prefs.fx]}</code>
          </p>
        </div>
      </section>

      <section className="sc-section">
        <h2 className="sc-h2">采样 Sampler</h2>
        <div className="sc-sampler">
          <div className="sc-sampler__row">
            <Button>主操作</Button>
            <Button variant="outline">描边</Button>
            <Button variant="ghost">文本</Button>
            <Kbd>⌘ K</Kbd>
          </div>
          <div className="sc-sampler__row">
            <Badge tone="primary">Primary</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="success" variant="solid">
              Success
            </Badge>
            <Badge tone="warning" variant="solid">
              Warning
            </Badge>
            <Badge tone="danger" variant="solid">
              Danger
            </Badge>
            <Tag tone="primary">标签</Tag>
            <Tag tone="success">已完成</Tag>
          </div>
          <div className="sc-sampler__row">
            <Avatar name="Mira Chen" />
            <Avatar name="Jonas Park" shape="square" />
            <Input placeholder="输入点什么…" style={{ inlineSize: '12rem' }} />
            <Switch defaultChecked />
          </div>
          <div className="sc-sampler__row" style={{ alignItems: 'stretch' }}>
            <Card variant="elevated" style={{ maxInlineSize: '15rem' }}>
              <strong>示例卡片</strong>
              <p style={{ margin: '0.4rem 0 0', color: 'var(--ms-color-fg-muted)' }}>
                卡片表面与文字会随主题换肤。
              </p>
            </Card>
            <div style={{ display: 'grid', gap: '0.75rem', flex: 1, minInlineSize: '12rem' }}>
              <Alert variant="info">提示组件会随配色变化。</Alert>
              <Progress value={66} />
              <Slider defaultValue={40} showValue aria-label="采样滑块" />
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
