import { DatePicker } from '@magic-scope/react';

export default function Demo() {
  return (
    <div
      style={{ display: 'flex', gap: 'var(--ms-space-3)', flexWrap: 'wrap', alignItems: 'center' }}
    >
      {/* 禁用:整体不可交互 */}
      <DatePicker disabled placeholder="禁用" aria-label="禁用态" />
      {/* 校验失败:染 danger 发光环并设 aria-invalid,供 Form 集成 */}
      <DatePicker invalid placeholder="校验失败" aria-label="校验失败态" />
      {/* 不可清除:clearable=false,选中后 footer 不出现「清除」 */}
      <DatePicker clearable={false} defaultValue={new Date()} aria-label="不可清除(已默认选今天)" />
    </div>
  );
}
