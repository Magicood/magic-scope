import { Text } from '@magic-scope/react';

// 内联文字装饰:斜体 italic / 下划线 underline / 删除线 strikethrough /
// 小型大写 smallCaps / 直透任意 CSS 颜色 color(优先级低于 tone)。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.7rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
      <Text as="p">
        新品首发,<Text italic>限时</Text>特惠 —— 原价{' '}
        <Text strikethrough dimmed>
          ¥299
        </Text>{' '}
        <Text weight="bold" tone="danger">
          ¥199
        </Text>
      </Text>
      <Text as="p">
        条款详见{' '}
        <Text underline tone="info">
          服务协议
        </Text>
        ,由{' '}
        <Text smallCaps weight="semibold">
          MagicScope Labs
        </Text>{' '}
        提供支持。
      </Text>
      <Text as="p" color="#c084fc">
        color 直透任意 CSS 颜色,用于品牌色等一次性着色(不占用语义 tone 槽位)。
      </Text>
    </div>
  );
}
