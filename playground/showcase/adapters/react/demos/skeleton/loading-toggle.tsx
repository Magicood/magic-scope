import { Button, Skeleton } from '@magic-scope/react';
import { useState } from 'react';

// 内容感知:loading=true 显骨架、false 显 children 真实内容,免去调用方手写条件分支。
export default function Demo() {
  const [loading, setLoading] = useState(true);
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.8rem',
        justifyItems: 'start',
        inlineSize: 'min(320px, 100%)',
      }}
    >
      <Skeleton loading={loading} width={260}>
        <span>内容已就绪 —— 加载完成后这段真实文本替换骨架。</span>
      </Skeleton>
      <Button variant="outline" size="sm" onClick={() => setLoading((l) => !l)}>
        {loading ? '完成加载' : '重新加载'}
      </Button>
    </div>
  );
}
