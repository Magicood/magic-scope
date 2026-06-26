import type { UploadFile, UploadRequestOption } from '@magic-scope/react';
import { Upload } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 把 Upload 的专有回调全绑上,实时回显:onChange(整表)/ onRemove(删前)/ onPreview(点预览)。
// customRequest 用定时器模拟传输,顺带触发 onChange 的多次推进。
function fakeRequest({ handlers }: UploadRequestOption) {
  let percent = 0;
  const timer = setInterval(() => {
    percent += 25;
    if (percent >= 100) {
      clearInterval(timer);
      handlers.onProgress(100);
      handlers.onSuccess();
    } else {
      handlers.onProgress(percent);
    }
  }, 350);
}

export default function Demo() {
  const [list, setList] = useState<UploadFile[]>([]);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 8));

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(460px, 100%)' }}>
      <Upload
        multiple
        fileList={list}
        customRequest={fakeRequest}
        onChange={(next) => {
          setList(next);
          push(
            `onChange(共 ${next.length} 条,状态:${next.map((f) => f.status).join(' / ') || '空'})`,
          );
        }}
        onRemove={(file) => push(`onRemove("${file.name}")`)}
        onPreview={(file) => push(`onPreview("${file.name}")`)}
        triggerText="选文件触发事件"
        hint="增删 / 进度推进都会回调 onChange"
        aria-label="事件演示"
      />
      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.8rem',
            lineHeight: 1.7,
          }}
        >
          {log.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
