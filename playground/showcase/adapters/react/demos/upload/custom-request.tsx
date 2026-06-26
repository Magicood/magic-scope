import type { UploadRequestOption } from '@magic-scope/react';
import { Upload } from '@magic-scope/react';

// 招牌特性:可插拔的 customRequest 接管真实传输。组件把 file + onProgress/onSuccess/onError
// 三个回调交给你,你自己用 XHR/fetch 真正传,再把进度/结果回灌组件的状态机。
// 这里用定时器模拟一次「上传中 → 完成」,体现进度条与状态图标(○→◴→✓)的推进。
function uploadWithProgress({ handlers }: UploadRequestOption) {
  let percent = 0;
  const timer = setInterval(() => {
    percent += 20;
    if (percent >= 100) {
      clearInterval(timer);
      handlers.onProgress(100);
      // 真实场景这里换成服务端返回的可访问 url
      handlers.onSuccess({ url: 'https://example.com/uploaded' });
    } else {
      handlers.onProgress(percent);
    }
  }, 300);
}

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(440px, 100%)' }}>
      <Upload
        multiple
        customRequest={uploadWithProgress}
        triggerText="选文件开始上传(模拟进度)"
        hint="支持多选,自动逐条推进进度到 100%"
        aria-label="带进度上传"
      />
    </div>
  );
}
