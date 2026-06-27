import { Drawer, Segmented, Switch } from '@magic-scope/react';
import { FAMILIES, type ThemeState } from '../lib/theme';

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: ThemeState;
  onPatch: (patch: Partial<ThemeState>) => void;
}

/** 各配色家族的代表色(仅用于色板预览点,不参与真实主题派生)。 */
const SWATCH: Record<string, string> = {
  arcane: '#8b7bf7',
  frost: '#3bbdf6',
  ember: '#f6795f',
  verdant: '#36d39b',
  solar: '#f7b733',
  mono: '#9aa1ad',
};

export function SettingsDrawer({ open, onOpenChange, theme, onPatch }: SettingsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="end" size="sm" title="外观设置">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
          配色、明暗、密度与动效都由同一套核心主题契约实时派生 —— 切换平滑过渡。
        </p>

        <div className="v-setting-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ marginBlockEnd: '0.65rem' }}>
            <div className="v-setting-row__label">配色</div>
            <div className="v-setting-row__hint">6 套内置预设家族</div>
          </div>
          <div className="v-swatch-row">
            {FAMILIES.map((fam) => (
              <button
                key={fam.name}
                type="button"
                className={`v-swatch${theme.preset === fam.name ? ' is-active' : ''}`}
                aria-pressed={theme.preset === fam.name}
                onClick={() => onPatch({ preset: fam.name })}
              >
                <span
                  className="v-swatch__dot"
                  style={{ background: SWATCH[fam.name] ?? 'var(--ms-color-primary)' }}
                />
                {fam.label}
              </button>
            ))}
          </div>
        </div>

        <div className="v-setting-row">
          <div>
            <div className="v-setting-row__label">明暗</div>
            <div className="v-setting-row__hint">浅色 / 深色</div>
          </div>
          <Segmented
            size="sm"
            value={theme.scheme}
            onValueChange={(v) => onPatch({ scheme: v as ThemeState['scheme'] })}
            options={[
              { value: 'dark', label: '深色' },
              { value: 'light', label: '浅色' },
            ]}
          />
        </div>

        <div className="v-setting-row">
          <div>
            <div className="v-setting-row__label">密度</div>
            <div className="v-setting-row__hint">控件与间距的紧凑度</div>
          </div>
          <Segmented
            size="sm"
            value={theme.density}
            onValueChange={(v) => onPatch({ density: v as ThemeState['density'] })}
            options={[
              { value: 'compact', label: '紧凑' },
              { value: 'comfortable', label: '适中' },
              { value: 'spacious', label: '宽松' },
            ]}
          />
        </div>

        <div className="v-setting-row">
          <div>
            <div className="v-setting-row__label">动效</div>
            <div className="v-setting-row__hint">过渡与动画强度</div>
          </div>
          <Segmented
            size="sm"
            value={theme.motion}
            onValueChange={(v) => onPatch({ motion: v as ThemeState['motion'] })}
            options={[
              { value: 'full', label: '完整' },
              { value: 'subtle', label: '克制' },
              { value: 'off', label: '关闭' },
            ]}
          />
        </div>

        <div className="v-setting-row" style={{ borderBlockEnd: 'none' }}>
          <div>
            <div className="v-setting-row__label">光影</div>
            <div className="v-setting-row__hint">装饰性发光与极光背景</div>
          </div>
          <Switch
            checked={theme.fx === 'on'}
            onChange={(e) => onPatch({ fx: e.target.checked ? 'on' : 'off' })}
            aria-label="光影开关"
          />
        </div>
      </div>
    </Drawer>
  );
}
