import { Button, Popover, Segmented, Switch, Tooltip } from '@magic-scope/react';
import {
  type ColorSchemePref,
  type Density,
  getTheme,
  type MotionPref,
  resolveScheme,
} from '@magic-scope/tokens';
import { themeFamilies, useAppearance } from '../lib/appearance';
import './AppearanceControl.css';

/* ============================================================================
 * AppearanceControl —— 四轴外观切换(主题家族 × 明暗 × 密度 × 动效/光效)。
 * 组件库「一键切换」能力的常驻展示位:买家端页头与后台顶栏共用。
 * ========================================================================== */

const SlidersIcon = (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M1.5 4h8M11.5 4H14M1.5 11h2M5.5 11H14"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <circle cx="10" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="4" cy="11" r="1.8" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export function AppearanceControl({ align = 'end' }: { align?: 'start' | 'end' }) {
  const { appearance, update, reset } = useAppearance();
  const activeScheme = resolveScheme(appearance.scheme);

  return (
    <Popover
      trigger={
        <Button variant="ghost" size="sm" aria-label="Appearance settings">
          {SlidersIcon}
        </Button>
      }
      placement={align === 'end' ? 'bottom-end' : 'bottom-start'}
      classNames={{ panel: 'apc-panel' }}
    >
      <div className="apc">
        <div className="apc-group">
          <span className="apc-label">Palette</span>
          <div className="apc-swatches">
            {themeFamilies.map((family) => {
              const theme = getTheme(family.name, activeScheme);
              const selected = appearance.theme === family.name;
              return (
                <Tooltip key={family.name} content={family.label} placement="top">
                  <button
                    type="button"
                    className="apc-swatch"
                    aria-pressed={selected}
                    aria-label={family.label}
                    data-selected={selected || undefined}
                    style={{
                      background: theme
                        ? `linear-gradient(135deg, ${theme.color.primary} 0%, ${theme.color.primary} 55%, ${theme.color.accent} 55%, ${theme.color.accent} 100%)`
                        : undefined,
                    }}
                    onClick={() => update({ theme: family.name })}
                  />
                </Tooltip>
              );
            })}
          </div>
        </div>

        <div className="apc-group">
          <span className="apc-label">Scheme</span>
          <Segmented
            size="sm"
            block
            value={appearance.scheme}
            onValueChange={(v) => update({ scheme: v as ColorSchemePref })}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'Auto' },
            ]}
          />
        </div>

        <div className="apc-group">
          <span className="apc-label">Density</span>
          <Segmented
            size="sm"
            block
            value={appearance.density}
            onValueChange={(v) => update({ density: v as Density })}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'comfortable', label: 'Cozy' },
              { value: 'spacious', label: 'Open' },
            ]}
          />
        </div>

        <div className="apc-group">
          <span className="apc-label">Motion</span>
          <Segmented
            size="sm"
            block
            value={appearance.motion}
            onValueChange={(v) => update({ motion: v as MotionPref })}
            options={[
              { value: 'full', label: 'Full' },
              { value: 'subtle', label: 'Subtle' },
              { value: 'off', label: 'Off' },
            ]}
          />
        </div>

        <div className="apc-footer">
          <Switch
            size="sm"
            checked={appearance.fx === 'on'}
            onChange={(e) => update({ fx: e.target.checked ? 'on' : 'off' })}
          >
            Ambient effects
          </Switch>
          <button type="button" className="apc-reset" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </Popover>
  );
}
