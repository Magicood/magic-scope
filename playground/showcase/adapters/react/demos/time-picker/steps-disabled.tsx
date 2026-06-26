import { TimePicker } from '@magic-scope/react';

// 独有特性:按 step 稀疏化选项 + 动态禁用不可选值。
// 左:分秒按 step 跳(分 15、秒 30),小时禁用 0-7(只能选营业时间)。
// 右:disabledMinutes 依当前选中小时动态返回 —— 18 点后整点之外的分钟全禁用(模拟最晚下单)。
export default function Demo() {
  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-4, 1rem)', inlineSize: 'min(320px, 90vw)' }}
    >
      <div style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          步进 + 禁用:分 15 / 秒 30,小时仅 8 点后
        </span>
        <TimePicker
          minuteStep={15}
          secondStep={30}
          disabledHours={[0, 1, 2, 3, 4, 5, 6, 7]}
          defaultValue="09:15:00"
          aria-label="步进与禁用小时"
        />
      </div>

      <div style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
          联动禁用:选到 18 点及以后,只能选整点
        </span>
        <TimePicker
          showSecond={false}
          disabledMinutes={(hour) =>
            hour != null && hour >= 18 ? Array.from({ length: 59 }, (_, i) => i + 1) : []
          }
          defaultValue="17:30"
          aria-label="按小时联动禁用分钟"
        />
      </div>
    </div>
  );
}
