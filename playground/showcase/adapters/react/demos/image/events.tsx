import { Image } from '@magic-scope/react';
import { useRef, useState } from 'react';

// onLoad:解码完成可显示;onError:全部来源失败后触发;onPreviewOpenChange:灯箱开合。
export default function Demo() {
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(420px, 100%)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ms-space-3)' }}>
        <Image
          src="https://picsum.photos/id/237/240/160"
          alt="加载成功示例"
          width={180}
          height={120}
          rounded="md"
          preview
          onLoad={() => push('onLoad() 加载成功')}
          onPreviewOpenChange={(open) => push(`onPreviewOpenChange(${open})`)}
        />
        <Image
          src="https://example.invalid/broken.jpg"
          fallbackSrc="https://example.invalid/still-broken.jpg"
          alt="加载失败示例"
          width={180}
          height={120}
          rounded="md"
          onError={() => push('onError() 全部来源失败')}
        />
      </div>

      {log.length > 0 ? (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.82rem',
          }}
        >
          {log.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      ) : (
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>
          等待图片加载 / 点左图预览,事件会在此回显。
        </small>
      )}
    </div>
  );
}
