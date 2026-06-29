import { Button, Skeleton } from '@magic-scope/react';
import { useState } from 'react';

// 对抗性:骨架与真实内容共用同一组宽度约束。加载完成后注入超长无空格串 + 巨量正文,
// 验证骨架圈定的边界能收住极端内容——标题单行省略号、正文多行换行,均不撑破容器。
const TITLE =
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const BODY =
  '用于压力测试的超长正文会持续延伸'.repeat(80) +
  ' https://example.com/超长无空格地址/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?x=1';

export default function Demo() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', inlineSize: '20rem' }}>
      <Button size="sm" onClick={() => setLoaded((v) => !v)}>
        {loaded ? '重新加载' : '加载完成'}
      </Button>
      {loaded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <strong
            style={{
              maxInlineSize: '20rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {TITLE}
          </strong>
          <p
            style={{
              margin: 0,
              maxInlineSize: '20rem',
              overflowWrap: 'anywhere',
              color: 'var(--ms-color-fg-muted)',
            }}
          >
            {BODY}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton variant="text" style={{ inlineSize: '70%', blockSize: '1.1rem' }} />
          <Skeleton variant="text" style={{ inlineSize: '100%' }} />
          <Skeleton variant="text" style={{ inlineSize: '100%' }} />
          <Skeleton variant="text" style={{ inlineSize: '85%' }} />
        </div>
      )}
    </div>
  );
}
