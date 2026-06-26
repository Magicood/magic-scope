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
import {
  getTheme,
  presetFamilies,
  setMotion,
  setTheme,
  withViewTransition,
} from '@magic-scope/tokens';
import { useState } from 'react';

type Scheme = 'dark' | 'light';
type Tri = 'full' | 'subtle' | 'off';

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

/** 预设画廊:配色 × 明暗 × 动效 × 光影,四维正交一键换肤,整站实时可视化。 */
export function ThemeGallery() {
  const [family, setFamily] = useState('arcane');
  const [scheme, setScheme] = useState<Scheme>('dark');
  const [motion, setMot] = useState<Tri>('full');
  const [fx, setFx] = useState<Tri>('subtle');

  const apply = (name: string, sch: Scheme) => {
    setFamily(name);
    setScheme(sch);
    withViewTransition(() => setTheme(name, sch));
  };

  return (
    <article className="sc-view sc-gallery">
      <header className="sc-view__head">
        <div className="sc-view__crumb">
          主题 Theme
          <span className="sc-badge-src" title="配色数据源自 @magic-scope/tokens presetFamilies">
            预设源自 tokens ✦
          </span>
        </div>
        <h1 className="sc-h1">预设画廊 Theme Gallery</h1>
        <p className="sc-summary">
          配色 × 明暗 × 动效 × 光影,四个正交维度任意组合,一键换肤、整站实时改头换面。
        </p>
        <p className="sc-desc">
          这是 magic-scope 的「核心驱动可变」:选一套配色,下面的采样器与整个展示站会随之实时换肤(走
          View Transitions 平滑过渡)。
        </p>
      </header>

      <section className="sc-section">
        <h2 className="sc-h2">配色 Palette（{presetFamilies.length} 套预设）</h2>
        <div className="sc-swatches">
          {presetFamilies.map((f) => {
            const t = getTheme(f.name, scheme);
            return (
              <button
                key={f.name}
                type="button"
                className="sc-swatch"
                data-active={family === f.name ? '' : undefined}
                onClick={() => apply(f.name, scheme)}
              >
                <span className="sc-swatch__preview" style={{ background: t?.color.bg ?? '#111' }}>
                  <span style={{ background: t?.color.primary ?? '#888' }} />
                  <span style={{ background: t?.color.accent ?? '#888' }} />
                  <span style={{ background: t?.color.success ?? '#888' }} />
                </span>
                <span className="sc-swatch__label">{f.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="sc-section">
        <div className="sc-gallery__dials">
          <Seg<Scheme>
            label="明暗"
            value={scheme}
            options={[
              ['dark', '暗'],
              ['light', '亮'],
            ]}
            onChange={(v) => apply(family, v)}
          />
          <Seg<Tri>
            label="动效"
            value={motion}
            options={[
              ['full', '全'],
              ['subtle', '弱'],
              ['off', '关'],
            ]}
            onChange={(v) => {
              setMot(v);
              setMotion(v);
            }}
          />
          <Seg<Tri>
            label="光影"
            value={fx}
            options={[
              ['full', '强'],
              ['subtle', '弱'],
              ['off', '关'],
            ]}
            onChange={(v) => {
              setFx(v);
              document.documentElement.dataset.msFx = v;
            }}
          />
        </div>
      </section>

      <section className="sc-section">
        <h2 className="sc-h2">实时采样器 Sampler</h2>
        <div className="sc-sampler">
          <div className="sc-sampler__row">
            <Button>主操作</Button>
            <Button variant="outline">描边</Button>
            <Button variant="ghost">幽灵</Button>
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
            <Avatar name="Lyra Vex" />
            <Avatar name="Orin Sael" shape="square" />
            <Input placeholder="输入点什么…" style={{ inlineSize: '12rem' }} />
            <Switch defaultChecked />
          </div>
          <div className="sc-sampler__row" style={{ alignItems: 'stretch' }}>
            <Card variant="elevated" style={{ maxInlineSize: '15rem' }}>
              <strong>奥术卡片</strong>
              <p style={{ margin: '0.4rem 0 0', color: 'var(--ms-color-fg-muted)' }}>
                surface 底 + 柔光,随主题换肤。
              </p>
            </Card>
            <div style={{ display: 'grid', gap: '0.75rem', flex: 1, minInlineSize: '12rem' }}>
              <Alert variant="info">信息提示会随配色变化。</Alert>
              <Progress value={66} />
              <Slider defaultValue={40} showValue aria-label="采样滑块" />
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
