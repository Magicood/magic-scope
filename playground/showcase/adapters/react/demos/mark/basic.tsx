import { Mark } from '@magic-scope/react';

// 基础用法:把 children(纯文本)里命中 search 的片段包进语义化 <mark>,
// 未命中原样输出。默认 tone 为 warning,着色走全库 tone 槽位、随主题换肤联动。
export default function Demo() {
  return (
    <p style={{ maxInlineSize: 'min(480px, 100%)', lineHeight: 1.9, margin: 0 }}>
      <Mark search="高亮">
        Mark 用于搜索结果与文档检索:把命中的关键词高亮出来,让人一眼定位到相关位置。
      </Mark>
    </p>
  );
}
