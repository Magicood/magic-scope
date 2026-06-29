import { Button, toast } from '@magic-scope/react';

export default function Demo() {
  const start = () => {
    // 同一个 id:先弹常驻的「进行中」,完成后用同 id 替换为「成功」并重置寿命
    toast('正在上传…', { id: 'upload', duration: 0 });
    setTimeout(() => {
      toast.success('上传完成', {
        id: 'upload',
        description: '文件已保存到云端。',
      });
    }, 1600);
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button variant="outline" onClick={start}>
        同 id 更新(进行中 → 完成)
      </Button>
    </div>
  );
}
