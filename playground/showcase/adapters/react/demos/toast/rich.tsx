import { Button, toast } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button
        variant="outline"
        onClick={() =>
          toast.success('草稿已保存', {
            description: '可在「我的草稿」中随时取回,有效期 30 天。',
          })
        }
      >
        带描述 description
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast('已移除该项目', {
            description: '该项目已从你的收藏中删除。',
            action: { label: '撤销', onClick: () => toast.success('项目已恢复') },
          })
        }
      >
        带行动 action
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning('提示常驻中,需手动关闭', {
            id: 'persistent',
            duration: 0,
          })
        }
      >
        常驻 duration=0
      </Button>
      <Button variant="outline" onClick={() => toast.dismiss('persistent')}>
        关闭常驻 dismiss
      </Button>
    </div>
  );
}
