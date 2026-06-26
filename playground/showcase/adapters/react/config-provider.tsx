import type {
  ButtonTone,
  ConfigDensity,
  ConfigFx,
  ConfigMotion,
  ConfigTone,
} from '@magic-scope/react';
import { Button, ConfigProvider, Input } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const tone = values.tone as ConfigTone;
  const locale = (values.locale as string) || undefined;
  // ConfigProvider 的 tone 含 neutral(写 data-ms-tone);Button/Input 实例级 tone 无 neutral 槽,clamp 兜底
  const instanceTone: ButtonTone = tone === 'neutral' ? 'primary' : tone;
  return (
    <ConfigProvider
      density={values.density as ConfigDensity}
      motion={values.motion as ConfigMotion}
      fx={values.fx as ConfigFx}
      tone={tone}
      locale={locale}
      style={{
        display: 'grid',
        gap: 'var(--ms-space-4)',
        padding: 'var(--ms-space-5)',
        borderRadius: 'var(--ms-radius-lg)',
        border: '1px solid var(--ms-color-border)',
        background: 'var(--ms-color-bg-subtle)',
      }}
    >
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        被包裹的子树读祖先 data-ms-*:改上方旋钮,下面控件随密度 / 动效 / 发光级联变化
      </small>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--ms-space-3)',
          alignItems: 'center',
        }}
      >
        <Button tone={instanceTone}>主操作</Button>
        <Button tone={instanceTone} variant="soft">
          次操作
        </Button>
        <Button tone={instanceTone} variant="outline">
          描边
        </Button>
        <Button tone={instanceTone} loading>
          加载中
        </Button>
      </div>
      <Input tone={instanceTone} placeholder="输入框也随密度缩放" defaultValue="" />
    </ConfigProvider>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/config-provider/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/config-provider/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'config-provider',
  Playground,
  demos: buildDemos(comps, reactSources),
};
