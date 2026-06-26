import { Button, Menu } from '@magic-scope/react';

// 对抗性内容:菜单项文本塞超长无空格串与巨量正文,
// 验证浮层把内容收在 max-inline-size 边界内并换行(overflow-wrap: anywhere),
// 既不撑破布局,也不裁切 focus-visible 焦点环。
export default function Demo() {
  return (
    <Menu
      trigger={<Button variant="outline">异常内容 ▾</Button>}
      items={[
        {
          label:
            'arcane://incantation/0xDEADBEEFCAFEBABE0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-no-spaces-at-all-keeps-going-and-going',
          onSelect: () => {},
        },
        {
          label:
            '一段刻意写得很长的菜单项文案,用来检验当 label 远超浮层宽度时,菜单依旧能把它收在边界内优雅换行而不撑破布局,也不会裁切焦点环或挤压相邻项的可读性。',
          onSelect: () => {},
        },
        { label: '正常项', onSelect: () => {} },
      ]}
    />
  );
}
