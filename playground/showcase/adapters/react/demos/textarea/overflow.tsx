import { Textarea } from '@magic-scope/react';

// 对抗性内容:超长无空格串 + 巨量正文,验证被收在边界内
// (textarea 自动换行,超高时内部滚动,不撑破容器、不裁焦点环)。
const longWord = `奥术真言${'A'.repeat(220)}收束于结界之内`;
const longText = `${'传送门在虚空中缓缓张开,奥术的微光顺着符文流淌。'.repeat(8)}\n${longWord}`;

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(28rem, 100%)' }}>
      <Textarea rows={4} defaultValue={longText} aria-label="超长内容" />
      <Textarea rows={2} invalid defaultValue={longWord} aria-label="超长无空格串(校验失败)" />
    </div>
  );
}
