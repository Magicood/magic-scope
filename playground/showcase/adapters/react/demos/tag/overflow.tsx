import { Tag } from '@magic-scope/react';

export default function Demo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        inlineSize: 'min(280px, 90vw)',
      }}
    >
      <Tag tone="primary" closable>
        超长无空格串_abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ
      </Tag>
      <Tag tone="danger">
        巨量中文内容会被收在容器边界内单行截断为省略号而不撑破布局末尾的关闭按钮与聚焦发光环也不会被裁掉这是一段刻意写得很长很长的标签文本用来验证边界承载
      </Tag>
    </div>
  );
}
