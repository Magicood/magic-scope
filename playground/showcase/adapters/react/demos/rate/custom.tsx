import type { RateCharacterRenderState } from '@magic-scope/react';
import { Rate } from '@magic-scope/react';
import { useState } from 'react';

// 逐星 render-prop:按 fillState 切换字形（满 / 半 / 空），半星沿用组件的 clip 裁切。
const heart = (state: RateCharacterRenderState) => {
  if (state.state === 'empty') {
    return <span aria-hidden="true">♡</span>;
  }
  return <span aria-hidden="true">♥</span>;
};

const longText =
  '这是一段刻意超长、不含空格断点的评分说明文案用来检验容器在窄屏下是否会被文本撑破或裁掉焦点环';

// 对抗性：count=10 大星数 + allowHalf；showText 返回超长不可断文案，验证布局不被撑破、星组不溢出。
export default function Demo() {
  const [value, setValue] = useState(7);
  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        inlineSize: 'min(360px, 100%)',
        padding: '0.75rem',
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-md, 8px)',
        overflow: 'hidden',
      }}
    >
      <Rate
        value={value}
        onChange={setValue}
        count={10}
        allowHalf
        character={heart}
        tone="danger"
        aria-label="自定义图标评分"
      />
      <Rate
        defaultValue={4}
        showText={() => longText}
        aria-label="超长文案评分"
        style={{ minInlineSize: 0 }}
      />
    </div>
  );
}
