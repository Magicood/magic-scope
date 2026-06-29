import { Button, Tooltip } from '@magic-scope/react';

const longWord =
  'supercalifragilisticexpialidocious-用于压测的超长无空格连续串-1234567890-' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

const longText =
  '这是一段刻意写得很长的提示正文,用来验证气泡在巨量文本下会自动换行并被收在最大宽度内,' +
  '而不是无限拉伸撑破布局;同时气泡仍然停留在 top-layer,定位不漂移,焦点环也不被裁切。';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Tooltip content={longWord}>
        <Button variant="outline">超长无空格串</Button>
      </Tooltip>
      <Tooltip content={longText}>
        <Button variant="outline">巨量正文</Button>
      </Tooltip>
    </div>
  );
}
