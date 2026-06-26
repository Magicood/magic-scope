import type { ToastVariant } from '@magic-scope/react';
import { Button, toast } from '@magic-scope/react';

// tone 色调系统:Toast 不暴露独立 tone prop,而由 variant 派生统一 ms-tone-* 色调
// (与 Button / Alert 同源)。6 个语义变体覆盖全色调矩阵,loading 跟随 info 并显示旋转符文。
const VARIANTS: { variant: ToastVariant; label: string; message: string }[] = [
  { variant: 'default', label: 'default 中性', message: '施法已记录 ✦' },
  { variant: 'success', label: 'success 成功', message: '传送门已开启' },
  { variant: 'warning', label: 'warning 警告', message: '魔力即将耗尽' },
  { variant: 'danger', label: 'danger 危险', message: '咒语反噬,施法失败' },
  { variant: 'info', label: 'info 信息', message: '新的符文已解锁' },
  { variant: 'loading', label: 'loading 进行', message: '正在吟唱传送咒…' },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {VARIANTS.map(({ variant, label, message }) => (
        <Button
          key={variant}
          variant="outline"
          onClick={() =>
            // onDismiss 携带关闭来源(manual / auto / action / replace);
            // onAutoClose 仅自动到期时触发,可据此区分手动与超时关闭。
            toast(message, {
              variant,
              onDismiss: (_id, reason) => {
                if (reason === 'auto') toast.info('上一条已自动消失');
              },
            })
          }
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
