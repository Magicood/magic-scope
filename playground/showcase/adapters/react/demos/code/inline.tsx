import { Code } from '@magic-scope/react';

// 行内:随正文流式排版,不打断行高。asChild 把代码样式合并到子元素(如链接)。
export default function Demo() {
  return (
    <p style={{ maxInlineSize: 'min(560px, 100%)', lineHeight: 1.9 }}>
      调用 <Code tone="primary">client.connect()</Code> 建立连接;失败时抛出{' '}
      <Code tone="danger" variant="outline">
        TimeoutError
      </Code>
      。环境变量 <Code tone="accent">API_TOKEN</Code> 必须先注入,文档见{' '}
      <Code asChild tone="info">
        <a href="https://api.example.com/docs" target="_blank" rel="noreferrer">
          api.example.com/docs
        </a>
      </Code>
      。
    </p>
  );
}
