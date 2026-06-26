import { Heading } from '@magic-scope/react';

// 魔法特性:tone 色调、渐变文字(tone/aurora 流光)、辉光(受全局光影开关调制)。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Heading level={2} tone="primary">
        primary 色调标题
      </Heading>
      <Heading level={1} gradient="tone" tone="accent">
        渐变标题 Aurora
      </Heading>
      <Heading level={1} gradient="aurora" tone="primary">
        流光标题 ✦ Arcane
      </Heading>
      <Heading level={2} glow tone="info">
        辉光标题 Glow
      </Heading>
      <Heading level={1} family="display" gradient="aurora" glow="strong" tone="accent">
        魔法全开 ✦ Spellbound
      </Heading>
    </div>
  );
}
