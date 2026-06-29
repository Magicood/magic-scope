import type { ProseSize, ProseTone } from '@magic-scope/react';
import { Prose } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Prose
      size={values.size as ProseSize}
      tone={values.tone as ProseTone}
      style={{ inlineSize: 'min(640px, 100%)' }}
    >
      <h2>富文本排版 Prose</h2>
      <p>
        把一整块已渲染好的 HTML / JSX 内容交给 <code>Prose</code>,无需逐元素手写类, 标题、段落、
        <strong>强调</strong>、<a href="#prose">链接</a> 都自动套上全库排版规范。
      </p>
      <blockquote>好的排版不该被察觉,它只是让内容更容易被读懂。</blockquote>
      <ul>
        <li>字号阶梯走 token,层级关系恒定</li>
        <li>链接 / 列表标记跟随 tone 槽位着色</li>
        <li>
          行内代码 <code>--ms-type-step-*</code> 自带等宽底纹
        </li>
      </ul>
      <pre>
        <code>{`const scope = createMagic();\nscope.render(<Prose>{html}</Prose>);`}</code>
      </pre>
    </Prose>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/prose/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/prose/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'prose',
  Playground,
  demos: buildDemos(comps, reactSources),
};
