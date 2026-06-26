import { Image } from '@magic-scope/react';

// 第一个主图地址必然 404,沿 fallbackSrc 链逐级尝试:
// 第二个仍坏 → 第三个为真实图(成功降级落定)。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)', inlineSize: 'min(420px, 100%)' }}>
      <div style={{ display: 'grid', gap: 'var(--ms-space-2)' }}>
        <Image
          src="https://example.invalid/broken-primary.jpg"
          fallbackSrc={[
            'https://example.invalid/broken-fallback-1.jpg',
            'https://picsum.photos/id/237/360/200',
          ]}
          alt="降级后的小狗图"
          width={360}
          height={200}
          rounded="md"
        />
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>
          主图与第一个备用都坏 → 自动落到链尾真实图。
        </small>
      </div>

      <div style={{ display: 'grid', gap: 'var(--ms-space-2)' }}>
        <Image
          src="https://example.invalid/all-broken.jpg"
          fallbackSrc="https://example.invalid/also-broken.jpg"
          alt="无法加载的封面"
          width={360}
          height={200}
          rounded="md"
        />
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>
          全部候选失败 → 进入内建错误占位态。
        </small>
      </div>
    </div>
  );
}
