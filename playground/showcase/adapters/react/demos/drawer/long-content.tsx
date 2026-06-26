import { Button, Drawer } from '@magic-scope/react';
import { useState } from 'react';

const longWord =
  'supercalifragilisticexpialidocious反魔法力场超长无空格连续字符串0123456789abcdefghijklmnopqrstuvwxyz';

const paragraphs = Array.from(
  { length: 12 },
  (_, i) =>
    `${i + 1}. 这是一段用于压测抽屉内容承载的长正文,验证 body 区域在内容超出视口时正确滚动,` +
    '面板宽度不被撑破、安全区避让仍然生效,头部与关闭按钮始终可达。',
);

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开超长内容抽屉</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="边界压测:超长内容">
        <p
          style={{
            marginBlockStart: 0,
            overflowWrap: 'anywhere',
            color: 'var(--ms-color-fg-muted)',
          }}
        >
          {longWord}
        </p>
        {paragraphs.map((text) => (
          <p key={text} style={{ color: 'var(--ms-color-fg-muted)' }}>
            {text}
          </p>
        ))}
        <Button onClick={() => setOpen(false)}>收起</Button>
      </Drawer>
    </>
  );
}
