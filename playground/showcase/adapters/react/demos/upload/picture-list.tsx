import type { UploadFile } from '@magic-scope/react';
import { Upload } from '@magic-scope/react';
import { useState } from 'react';

// 内联 SVG data-url 当缩略图,免外网依赖。
const thumb = (label: string, hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="hsl(${hue} 70% 55%)"/><text x="32" y="38" font-size="22" fill="white" text-anchor="middle" font-family="sans-serif">${label}</text></svg>`,
  )}`;

const PRESET: UploadFile[] = [
  {
    uid: 'pic-1',
    name: 'aurora.png',
    size: 820_000,
    type: 'image/png',
    status: 'done',
    percent: 100,
    url: thumb('A', 265),
  },
  {
    uid: 'pic-2',
    name: 'frost.png',
    size: 540_000,
    type: 'image/png',
    status: 'done',
    percent: 100,
    url: thumb('F', 190),
  },
];

// listType="picture":done 的条目用 url 显缩略图,未完成显占位图标;
// 配合 onPreview 把名字 / 缩略做成可点(组件不内置 lightbox,交由用户)。
export default function Demo() {
  const [list, setList] = useState<UploadFile[]>(PRESET);
  const [previewing, setPreviewing] = useState<string>('');
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(440px, 100%)' }}>
      <Upload
        listType="picture"
        multiple
        accept="image/*"
        fileList={list}
        onChange={setList}
        onPreview={(file) => setPreviewing(file.name)}
        triggerText="选择图片"
        hint="仅接受图片,完成后显缩略图,点击文件名可预览"
        aria-label="图片上传"
      />
      {previewing && (
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>预览了:{previewing}</small>
      )}
    </div>
  );
}
