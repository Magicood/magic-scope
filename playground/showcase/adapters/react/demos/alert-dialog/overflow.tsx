import { alert, Button, confirm } from '@magic-scope/react';

// 对抗性内容:超长无空格串 + 巨量正文作为标题/正文,
// 验证弹窗被收在边界内(正文自动换行铺开、容器不无限撑高、按钮始终可点、焦点环不被裁)。
const LONG_TOKEN =
  'wsswwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww';

const LONG_BODY =
  '这是一段刻意拉得很长的法术注解,用来验证当用户传入超量正文时,弹窗会在固定宽度内自动换行铺开而不会无限撑高或溢出屏幕。' +
  '它应当始终把确认与取消按钮留在可点击范围内,焦点环也不会被裁切。' +
  '即便文字再多,容器边界与圆角也保持稳定,背景滚动也被锁住。';

export default function Demo() {
  const showLongToken = async () => {
    await alert(LONG_TOKEN, { title: '超长无空格串' });
  };

  const showLongBody = async () => {
    await confirm(LONG_BODY, {
      title: '超长正文 + 长标题需要被截断或换行而不撑破容器边界的标题示例',
      confirmText: '我已读完',
      cancelText: '关闭',
    });
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button variant="outline" onClick={showLongToken}>
        超长无空格串
      </Button>
      <Button variant="outline" onClick={showLongBody}>
        巨量正文 + 长标题
      </Button>
    </div>
  );
}
