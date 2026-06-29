import { Button, toast } from '@magic-scope/react';

// 对抗性内容:超长无空格串 + 巨量正文,验证 toast 被收在边界内
// (主消息紧凑收束、描述多行换行),不撑破容器、不裁掉关闭按钮与焦点环。
const LONG_TOKEN =
  'wsswwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww';
const LONG_BODY =
  '这是一段刻意拉得很长的说明文本,用来验证当用户传入超量正文时, toast 会在固定宽度内自动换行铺开而不会无限撑高或溢出屏幕。' +
  '它应当始终把关闭按钮与行动按钮留在可点击范围内,焦点环也不会被裁切。' +
  '即便文字再多,容器边界与圆角也保持稳定。';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button variant="outline" onClick={() => toast(LONG_TOKEN)}>
        超长无空格串
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info('说明文本(超长正文)', {
            description: LONG_BODY,
            action: { label: '知道了', onClick: () => undefined },
          })
        }
      >
        巨量正文 + 行动
      </Button>
    </div>
  );
}
