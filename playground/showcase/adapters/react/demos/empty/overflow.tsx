import { Button, Empty } from '@magic-scope/react';

const longQuery = 'superlongunbreakablequerystringwithoutanyspaces1234567890abcdefghijklmnop';

export default function Demo() {
  return (
    <div
      style={{
        inlineSize: 'min(300px, 100%)',
        border: '1px dashed var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-md)',
      }}
    >
      <Empty
        tone="warning"
        description={`没有找到与「${longQuery}」匹配的记录,请尝试缩短关键词或调整筛选条件后重新检索。`}
      >
        <Button variant="outline">清空关键词</Button>
      </Empty>
    </div>
  );
}
