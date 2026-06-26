import type {
  AvatarGlow,
  AvatarShape,
  AvatarSize,
  AvatarStatus,
  AvatarTone,
} from '@magic-scope/react';
import { Avatar } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const DEMO_SRC = 'https://i.pravatar.cc/120?img=13';

function Playground({ values }: { values: ControlValues }) {
  const status = values.status as AvatarStatus | 'none';
  return (
    <Avatar
      size={values.size as AvatarSize}
      shape={values.shape as AvatarShape}
      tone={values.tone as AvatarTone}
      glow={values.glow as AvatarGlow}
      status={status === 'none' ? undefined : status}
      statusPulse={values.statusPulse as boolean}
      ring={values.ring as boolean}
      bordered={values.bordered as boolean}
      name={values.name as string}
      src={values.showImage ? DEMO_SRC : undefined}
    />
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/avatar/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/avatar/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'avatar',
  Playground,
  demos: buildDemos(comps, reactSources),
};
