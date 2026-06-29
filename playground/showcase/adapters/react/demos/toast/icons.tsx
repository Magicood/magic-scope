import { Button, toast } from '@magic-scope/react';

// icon 图标位:不传按 variant 给默认图标;传 ReactNode 覆盖;传 false 完全关闭图标列。
// closeIcon 同理可换关闭按钮内容。展示三种姿态各自的视觉差异。
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Button
        variant="outline"
        onClick={() =>
          toast.success('设置已保存', {
            icon: <span aria-hidden="true">✅</span>,
          })
        }
      >
        自定义图标 icon
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info('已开启免打扰模式', {
            icon: false,
          })
        }
      >
        关闭图标 icon=false
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast('草稿已归档', {
            description: '默认 variant 不带图标,图标需自行指定。',
            icon: <span aria-hidden="true">📄</span>,
            closeIcon: <span aria-hidden="true">✖</span>,
          })
        }
      >
        自定义关闭符 closeIcon
      </Button>
    </div>
  );
}
