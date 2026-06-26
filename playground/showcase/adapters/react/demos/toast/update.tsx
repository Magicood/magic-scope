import { Button, toast } from '@magic-scope/react';

export default function Demo() {
  const cast = () => {
    // 同一个 id:先弹常驻的「进行中」,完成后用同 id 替换为「成功」并重置寿命
    toast('正在吟唱传送咒…', { id: 'cast', duration: 0 });
    setTimeout(() => {
      toast.success('吟唱完成 ✦', {
        id: 'cast',
        description: '传送门已在目标坐标展开。',
      });
    }, 1600);
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button variant="outline" onClick={cast}>
        同 id 更新(进行中 → 完成)
      </Button>
    </div>
  );
}
