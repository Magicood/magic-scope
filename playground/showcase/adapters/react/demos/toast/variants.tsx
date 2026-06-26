import { Button, toast } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button variant="outline" onClick={() => toast('施法已记录 ✦')}>
        默认 default
      </Button>
      <Button variant="outline" onClick={() => toast.success('传送门已开启')}>
        成功 success
      </Button>
      <Button variant="outline" onClick={() => toast.warning('魔力即将耗尽')}>
        警告 warning
      </Button>
      <Button variant="outline" onClick={() => toast.error('咒语反噬,施法失败')}>
        危险 danger
      </Button>
      <Button variant="outline" onClick={() => toast.info('新的符文已解锁')}>
        信息 info
      </Button>
    </div>
  );
}
