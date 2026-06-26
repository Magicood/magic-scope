import { Button, toast } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button
        variant="outline"
        onClick={() =>
          toast.success('卷轴已封存', {
            description: '可在「我的法器」中随时取回,有效期 30 天。',
          })
        }
      >
        带描述 description
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast('已将传送门移除', {
            description: '该法阵已从你的收藏中删除。',
            action: { label: '撤销', onClick: () => toast.success('传送门已恢复') },
          })
        }
      >
        带行动 action
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning('结界常驻中,需手动关闭', {
            id: 'ward',
            duration: 0,
          })
        }
      >
        常驻 duration=0
      </Button>
      <Button variant="outline" onClick={() => toast.dismiss('ward')}>
        关闭常驻 dismiss
      </Button>
    </div>
  );
}
