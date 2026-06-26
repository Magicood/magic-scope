import { Image } from '@magic-scope/react';
import { useState } from 'react';

// 受控灯箱:用外部按钮控制 previewOpen,onPreviewOpenChange 同步回状态。
// 适合「从别处触发预览」或需要与其它 UI 联动的场景。
export default function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(320px, 100%)' }}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          justifySelf: 'start',
          padding: 'var(--ms-space-2) var(--ms-space-4)',
          borderRadius: 'var(--ms-radius-md)',
          border: '1px solid var(--ms-color-border)',
          background: 'var(--ms-color-surface)',
          color: 'var(--ms-color-fg)',
          cursor: 'pointer',
        }}
      >
        从按钮打开预览
      </button>

      <Image
        src="https://picsum.photos/id/1024/360/240"
        alt="海岸礁石"
        width={320}
        height={200}
        rounded="lg"
        preview
        previewOpen={open}
        onPreviewOpenChange={setOpen}
      />

      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        灯箱开合:{open ? '已打开' : '已关闭'}(点图或按钮均可开,Esc / 关闭按钮回关)。
      </small>
    </div>
  );
}
