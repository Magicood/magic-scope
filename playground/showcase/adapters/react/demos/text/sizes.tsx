import { Text } from '@magic-scope/react';

// 字号阶梯:走 --ms-type-step-* 流式字阶;同步演示字族与字重。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <Text as="div" size="5xl" family="display" weight="bold">
        5xl 装饰标题
      </Text>
      <Text as="div" size="4xl" weight="bold">
        4xl 粗体
      </Text>
      <Text as="div" size="3xl" weight="semibold">
        3xl 半粗
      </Text>
      <Text as="div" size="2xl" weight="medium">
        2xl 中等
      </Text>
      <Text as="div" size="xl">
        xl 标题
      </Text>
      <Text as="div" size="lg">
        lg 副标题
      </Text>
      <Text as="div" size="base">
        base 正文字号
      </Text>
      <Text as="div" size="sm" dimmed>
        sm 弱化说明
      </Text>
      <Text as="div" size="xs" family="mono" dimmed>
        xs mono 等宽脚注
      </Text>
    </div>
  );
}
