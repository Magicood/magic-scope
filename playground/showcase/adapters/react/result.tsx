import type { ResultSize, ResultStatus, ResultTone } from '@magic-scope/react';
import { Button, Result } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const tone = values.tone as string;
  return (
    <Result
      status={values.status as ResultStatus}
      size={values.size as ResultSize}
      tone={tone ? (tone as ResultTone) : undefined}
      title={values.title as string}
      subtitle={values.subtitle as string}
      extra={
        <>
          <Button variant="solid">返回首页</Button>
          <Button variant="outline">重试</Button>
        </>
      }
      style={{ maxInlineSize: 'min(32rem, 100%)' }}
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/result/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/result/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'result',
  Playground,
  demos: buildDemos(comps, reactSources),
};
