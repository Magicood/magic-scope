import type { UploadFile, UploadTone } from '@magic-scope/react';
import { Upload } from '@magic-scope/react';

const TONES: UploadTone[] = [
  'primary',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

// 预置一条「上传中」的受控文件,让每个 tone 的触发区高亮与进度条发光都直观可比。
function uploadingFixture(tone: string): UploadFile[] {
  return [
    {
      uid: `tone-${tone}`,
      name: `${tone}-报告.pdf`,
      size: 1_482_000,
      type: 'application/pdf',
      status: 'uploading',
      percent: 64,
    },
  ];
}

// tone 经全库 tone resolver 派生触发区高亮 / 进度发光——七种语义色一字排开。
export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--ms-space-4)',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        inlineSize: '100%',
      }}
    >
      {TONES.map((tone) => (
        <div key={tone} style={{ display: 'grid', gap: 'var(--ms-space-2)' }}>
          <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.8rem' }}>{tone}</span>
          <Upload
            tone={tone}
            fileList={uploadingFixture(tone)}
            triggerText="拖拽 / 点击"
            hint=" "
            aria-label={`${tone} 色调`}
          />
        </div>
      ))}
    </div>
  );
}
