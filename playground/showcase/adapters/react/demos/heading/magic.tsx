import { Heading } from '@magic-scope/react';

// 视觉特性:tone 色调、渐变文字(tone / aurora 极光)、光晕(受全局光影开关调制)。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Heading level={2} tone="primary">
        primary 色调标题
      </Heading>
      <Heading level={1} gradient="tone" tone="accent">
        渐变标题 Gradient
      </Heading>
      <Heading level={1} gradient="aurora" tone="primary">
        极光渐变标题 Aurora
      </Heading>
      <Heading level={2} glow tone="info">
        光晕标题 Glow
      </Heading>
      <Heading level={1} family="display" gradient="aurora" glow="strong" tone="accent">
        视觉全开 Showcase
      </Heading>
    </div>
  );
}
