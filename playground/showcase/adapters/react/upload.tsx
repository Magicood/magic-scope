import type { UploadFile, UploadListType, UploadProps } from '@magic-scope/react';
import { Upload } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 演示用 customRequest:不打真实网络,用定时器把进度从 0 推到 100 再判成功,
// 让 Playground 里旋钮一切就能看到「上传中 → 完成」的完整状态机。
function fakeRequest({
  handlers,
}: {
  handlers: {
    onProgress: (percent: number) => void;
    onSuccess: (payload?: { url?: string }) => void;
    onError: (error?: { message?: string }) => void;
  };
}) {
  let percent = 0;
  const timer = setInterval(() => {
    percent += 18;
    if (percent >= 100) {
      clearInterval(timer);
      handlers.onProgress(100);
      handlers.onSuccess();
    } else {
      handlers.onProgress(percent);
    }
  }, 320);
}

function Playground({ values }: { values: ControlValues }) {
  const [list, setList] = useState<UploadFile[]>([]);
  const maxCount = Number(values.maxCount) || undefined;
  const accept = (values.accept as string)?.trim() || undefined;
  return (
    <Upload
      fileList={list}
      onChange={setList}
      listType={values.listType as UploadListType}
      tone={values.tone as UploadProps['tone']}
      multiple={values.multiple as boolean}
      disabled={values.disabled as boolean}
      maxCount={maxCount}
      accept={accept}
      customRequest={fakeRequest}
      aria-label="文件上传演示"
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/upload/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/upload/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'upload',
  Playground,
  demos: buildDemos(comps, reactSources),
};
