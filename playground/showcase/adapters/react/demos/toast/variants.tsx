import { Button, toast } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button variant="outline" onClick={() => toast('操作已记录')}>
        默认 default
      </Button>
      <Button variant="outline" onClick={() => toast.success('设置已保存')}>
        成功 success
      </Button>
      <Button variant="outline" onClick={() => toast.warning('存储空间即将不足')}>
        警告 warning
      </Button>
      <Button variant="outline" onClick={() => toast.error('提交失败,请重试')}>
        危险 danger
      </Button>
      <Button variant="outline" onClick={() => toast.info('有新版本可更新')}>
        信息 info
      </Button>
    </div>
  );
}
