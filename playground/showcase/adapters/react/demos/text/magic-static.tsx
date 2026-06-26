import { Text } from '@magic-scope/react';

// 魔法静态:渐变 / 辉光 / 描边镂空(受顶栏「光影」开关调制)。
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
        辉光 glow
      </Text>
      <Text as="div" size="4xl" weight="bold" glow="strong" tone="info">
        强辉光 strong
      </Text>
      <Text as="div" size="4xl" weight="bold" stroke tone="primary">
        描边镂空
      </Text>
    </div>
  );
}
