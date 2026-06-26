// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from './Calendar';
import { DatePicker } from './DatePicker';
import { toISO } from './logic';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const TODAY = d(2026, 6, 26); // 2026-06,weekStart=1(周一);6/1 是周一

/** 按 data-iso 取日格按钮(表格化后比 role 查询更稳、locale 无关)。 */
const cell = (iso: string) =>
  document.querySelector<HTMLButtonElement>(`[data-iso="${iso}"]`) as HTMLButtonElement;

describe('Calendar 面板', () => {
  it('渲染 7 周名 + 42 日格', () => {
    render(<Calendar today={TODAY} value={null} />);
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    expect(document.querySelectorAll('[data-iso]')).toHaveLength(42);
  });

  it('点击某日触发 onSelect(本地日期)', () => {
    const onSelect = vi.fn();
    render(<Calendar today={TODAY} onSelect={onSelect} />);
    fireEvent.click(cell('2026-06-15'));
    expect(toISO(onSelect.mock.calls[0]?.[0])).toBe('2026-06-15');
  });

  it('今天格标 aria-current=date', () => {
    render(<Calendar today={TODAY} />);
    expect(cell('2026-06-26')).toHaveAttribute('aria-current', 'date');
  });

  it('disabledDate 禁用对应格', () => {
    render(<Calendar today={TODAY} disabledDate={(x) => x.getDate() === 15} />);
    expect(cell('2026-06-15')).toBeDisabled();
  });

  it('range 两次点击产出有序区间(乱序点击也对)', () => {
    const onRangeChange = vi.fn();
    render(<Calendar mode="range" today={TODAY} onRangeChange={onRangeChange} />);
    fireEvent.click(cell('2026-06-20'));
    fireEvent.click(cell('2026-06-15')); // 更早,引擎应排序
    expect(onRangeChange).toHaveBeenCalledTimes(1);
    const r = onRangeChange.mock.calls[0]?.[0];
    expect(toISO(r.start)).toBe('2026-06-15');
    expect(toISO(r.end)).toBe('2026-06-20');
  });

  it('点 header 进 year 视图', () => {
    render(<Calendar today={TODAY} />);
    fireEvent.click(screen.getByLabelText('选择年月'));
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('2030')).toBeInTheDocument(); // 十年格 2019–2030
  });

  it('方向键移动焦点', () => {
    render(<Calendar today={TODAY} value={d(2026, 6, 15)} />);
    cell('2026-06-15').focus();
    fireEvent.keyDown(screen.getByRole('table'), { key: 'ArrowRight' });
    expect(cell('2026-06-16')).toHaveFocus();
  });

  it('方向键跳过 disabled 日(焦点不掉到 body)', () => {
    render(
      <Calendar today={TODAY} value={d(2026, 6, 15)} disabledDate={(x) => x.getDate() === 16} />,
    );
    cell('2026-06-15').focus();
    fireEvent.keyDown(screen.getByRole('table'), { key: 'ArrowRight' });
    expect(cell('2026-06-17')).toHaveFocus(); // 16 被禁用 → 跳到 17
  });

  it('open=false 复位 range 半选草稿(关闭重开不拼出错误区间)', () => {
    const onRangeChange = vi.fn();
    const { rerender } = render(
      <Calendar mode="range" open today={TODAY} onRangeChange={onRangeChange} />,
    );
    fireEvent.click(cell('2026-06-10')); // 半选起点(不触发 onRangeChange)
    rerender(<Calendar mode="range" open={false} today={TODAY} onRangeChange={onRangeChange} />); // 关闭→复位
    rerender(<Calendar mode="range" open today={TODAY} onRangeChange={onRangeChange} />); // 重开
    fireEvent.click(cell('2026-06-20')); // 应作新起点
    expect(onRangeChange).not.toHaveBeenCalled(); // 草稿已复位,未与残留的 10 拼区间
  });

  it('受控 value 改到别的月 → 日历翻页', () => {
    const { rerender } = render(<Calendar today={TODAY} value={d(2026, 6, 15)} />);
    expect(cell('2026-06-15')).toBeTruthy();
    rerender(<Calendar today={TODAY} value={d(2026, 9, 15)} />);
    expect(cell('2026-09-15')).toBeTruthy(); // 翻到 9 月
  });
});

describe('DatePicker', () => {
  it('无值显示占位', () => {
    render(<DatePicker />);
    expect(screen.getByText('请选择日期')).toBeInTheDocument();
  });

  it('有值显示格式化日期(非占位)', () => {
    render(<DatePicker value={d(2026, 6, 26)} />);
    expect(screen.queryByText('请选择日期')).toBeNull();
  });

  it('invalid → trigger aria-invalid', () => {
    render(<DatePicker invalid />);
    expect(screen.getByRole('button', { expanded: false })).toHaveAttribute('aria-invalid', 'true');
  });

  it('open 受控时点击日格触发 onChange', () => {
    const onChange = vi.fn();
    render(<DatePicker open onChange={onChange} today={TODAY} />);
    fireEvent.click(cell('2026-06-15'));
    expect(toISO(onChange.mock.calls[0]?.[0])).toBe('2026-06-15');
  });

  it('clearable 清除按钮重置值', () => {
    const onChange = vi.fn();
    render(<DatePicker open value={d(2026, 6, 15)} onChange={onChange} today={TODAY} />);
    fireEvent.click(screen.getByText('清除'));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
