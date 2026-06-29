import { Text } from '@magic-scope/react';

// 静态视觉:渐变 / 光晕 / 描边镂空(受顶栏「光影」开关调制)。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      <Text as="div" size="4xl" weight="bold" gradient="tone" tone="primary">
        渐变 tone
      </Text>
      <Text as="div" size="4xl" weight="bold" gradient="aurora">
        极光 aurora
      </Text>
      <Text as="div" size="4xl" weight="bold" glow tone="accent">
        光晕 glow
      </Text>
      <Text as="div" size="4xl" weight="bold" glow="strong" tone="info">
        强光晕 strong
      </Text>
      <Text as="div" size="4xl" weight="bold" stroke tone="primary">
        描边镂空
      </Text>
    </div>
  );
}
