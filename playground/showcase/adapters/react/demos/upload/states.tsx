import type { UploadFile } from '@magic-scope/react';
import { Upload } from '@magic-scope/react';

// 五态同框:pending(○)/ uploading(◴ 带进度)/ done(✓)/ error(✕ 满轨红 + 可重试)。
// error 条目带 raw + customRequest 才会渲染重试按钮(↻),否则会是死按钮——这里特意补齐。
const MIXED: UploadFile[] = [
  {
    uid: 's-pending',
    name: '待传-draft.md',
    size: 12_400,
    type: 'text/markdown',
    status: 'pending',
    percent: 0,
  },
  {
    uid: 's-uploading',
    name: '上传中-video.mp4',
    size: 48_200_000,
    type: 'video/mp4',
    status: 'uploading',
    percent: 42,
  },
  {
    uid: 's-done',
    name: '已完成-report.pdf',
    size: 1_320_000,
    type: 'application/pdf',
    status: 'done',
    percent: 100,
  },
  {
    uid: 's-error',
    name: '失败-archive.zip',
    size: 9_800_000,
    type: 'application/zip',
    status: 'error',
    percent: 70,
    error: '服务端 500',
    raw: new File(['x'], '失败-archive.zip'),
  },
];

// 兜底的 customRequest:仅为让 error 条目的重试按钮可点(真实场景换成你的传输实现)。
function retryRequest({ handlers }: { handlers: { onSuccess: () => void } }) {
  setTimeout(() => handlers.onSuccess(), 600);
}

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(460px, 100%)' }}>
      <Upload
        defaultFileList={MIXED}
        customRequest={retryRequest}
        triggerText="再选文件"
        hint="下方演示 pending / uploading / done / error 四态;失败项可点 ↻ 重试"
        aria-label="状态演示"
      />
    </div>
  );
}
