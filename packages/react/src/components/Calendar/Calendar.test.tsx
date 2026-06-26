// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from './Calendar';
import type { DateTuple } from './logic';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const REF = d(2026, 6, 26); // 固定「今天」=2026-06-26(周五),所有用例不依赖真实日期

/** 取某日的网格按钮(按 data-iso);找不到直接抛错,免去非空断言。 */
const cell = (iso: string): HTMLButtonElement => {
  const el = document.querySelector<HTMLButtonElement>(`[data-iso="${iso}"]`);
  if (!el) throw new Error(`找不到日格 ${iso}`);
  return el;
};
/** 取某日所在的 gridcell(td);aria-selected / aria-current 挂在 gridcell 上(WAI-ARIA 网格语义)。 */
const gridcell = (iso: string): HTMLTableCellElement => {
  const td = cell(iso).closest('td');
  if (!td) throw new Error(`日格 ${iso} 不在 td 内`);
  return td;
};
/** 取 mock 第 n 次调用的第 0 个实参(类型收窄,免非空断言)。 */
const callArg = <T,>(fn: { mock: { calls: unknown[][] } }, n: number): T => {
  const call = fn.mock.calls[n];
  if (!call) throw new Error(`mock 第 ${n} 次调用不存在`);
  return call[0] as T;
};

describe('Calendar 渲染 / 结构', () => {
  it('渲染 role=grid + 6 周 + 周几 columnheader', () => {
    render(<Calendar referenceDate={REF} defaultPanelDate={REF} />);
    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();
    // thead 1 行 + tbody 6 行
    expect(within(grid).getAllByRole('row')).toHaveLength(7);
    expect(within(grid).getAllByRole('columnheader')).toHaveLength(7);
    // 42 个日格
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(42);
  });

  it('forwardRef 透传到根 div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Calendar ref={ref} referenceDate={REF} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('ms-cal');
  });

  it('today 高亮 aria-current=date', () => {
    render(<Calendar referenceDate={REF} defaultPanelDate={REF} />);
    expect(gridcell('2026-06-26')).toHaveAttribute('aria-current', 'date');
    expect(gridcell('2026-06-25')).not.toHaveAttribute('aria-current');
  });

  it('补位日(上 / 下月)标 outside 弱化类', () => {
    // 2026-06 周一起:6/1 是周一,无月初补位;月末补 7 月
    render(<Calendar referenceDate={REF} defaultPanelDate={REF} weekStartsOn={1} />);
    expect(cell('2026-07-01')).toHaveClass('ms-cal__cell--outside');
    expect(cell('2026-06-15')).not.toHaveClass('ms-cal__cell--outside');
  });

  it('weekStartsOn=0(周日)首列为周日,首格补上月', () => {
    render(<Calendar referenceDate={REF} defaultPanelDate={REF} weekStartsOn={0} />);
    const cells = within(screen.getByRole('grid')).getAllByRole('gridcell');
    // 周日起:6/1 是周一,首格应是上月 5/31(周日)
    expect(cells[0]?.querySelector('[data-iso]')).toHaveAttribute('data-iso', '2026-05-31');
  });
});

describe('Calendar 单选(single)', () => {
  it('点击日格触发 onChange(非受控)', () => {
    const onChange = vi.fn();
    render(<Calendar referenceDate={REF} defaultPanelDate={REF} onChange={onChange} />);
    fireEvent.click(cell('2026-06-10'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = callArg<Date>(onChange, 0);
    expect(arg.getDate()).toBe(10);
    // 选中态
    expect(gridcell('2026-06-10')).toHaveAttribute('aria-selected', 'true');
  });

  it('受控 value:外部值高亮,内部点击不自动改', () => {
    const onChange = vi.fn();
    render(
      <Calendar
        referenceDate={REF}
        defaultPanelDate={REF}
        value={d(2026, 6, 5)}
        onChange={onChange}
      />,
    );
    expect(gridcell('2026-06-05')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(cell('2026-06-10'));
    expect(onChange).toHaveBeenCalledTimes(1);
    // 受控:value 没变,10 号仍未选中
    expect(gridcell('2026-06-10')).toHaveAttribute('aria-selected', 'false');
  });
});

describe('Calendar 范围(range)/ 多选(multiple)', () => {
  it('range:两次点击产出升序区间(逆序点击也归一)', () => {
    const onRangeChange = vi.fn();
    render(
      <Calendar
        mode="range"
        referenceDate={REF}
        defaultPanelDate={REF}
        onRangeChange={onRangeChange}
      />,
    );
    // 先点 20,再点 10 → 归一为 [10, 20]
    fireEvent.click(cell('2026-06-20'));
    expect(onRangeChange).not.toHaveBeenCalled(); // 半选不触发
    fireEvent.click(cell('2026-06-10'));
    expect(onRangeChange).toHaveBeenCalledTimes(1);
    const [start, end] = callArg<DateTuple>(onRangeChange, 0);
    expect(start.getDate()).toBe(10);
    expect(end.getDate()).toBe(20);
  });

  it('range:受控值渲染区间内 in-range 类', () => {
    render(
      <Calendar
        mode="range"
        referenceDate={REF}
        defaultPanelDate={REF}
        rangeValue={[d(2026, 6, 10), d(2026, 6, 14)]}
      />,
    );
    expect(cell('2026-06-12')).toHaveClass('ms-cal__cell--in-range');
    expect(cell('2026-06-10')).toHaveClass('ms-cal__cell--selected');
    expect(cell('2026-06-20')).not.toHaveClass('ms-cal__cell--in-range');
  });

  it('multiple:点击切换多个,再点同日移除', () => {
    const onMultipleChange = vi.fn();
    render(
      <Calendar
        mode="multiple"
        referenceDate={REF}
        defaultPanelDate={REF}
        onMultipleChange={onMultipleChange}
      />,
    );
    fireEvent.click(cell('2026-06-05'));
    fireEvent.click(cell('2026-06-10'));
    expect(gridcell('2026-06-05')).toHaveAttribute('aria-selected', 'true');
    expect(gridcell('2026-06-10')).toHaveAttribute('aria-selected', 'true');
    // 再点 5 号 → 移除
    fireEvent.click(cell('2026-06-05'));
    expect(gridcell('2026-06-05')).toHaveAttribute('aria-selected', 'false');
    expect(onMultipleChange).toHaveBeenCalledTimes(3);
  });
});

describe('Calendar 禁用 / 边界', () => {
  it('disabledDate / minDate / maxDate 禁用日不可点', () => {
    const onChange = vi.fn();
    render(
      <Calendar
        referenceDate={REF}
        defaultPanelDate={REF}
        minDate={d(2026, 6, 5)}
        maxDate={d(2026, 6, 25)}
        disabledDate={(x) => x.getDate() === 15}
        onChange={onChange}
      />,
    );
    expect(cell('2026-06-04')).toBeDisabled(); // < min
    expect(cell('2026-06-26')).toBeDisabled(); // > max
    expect(cell('2026-06-15')).toBeDisabled(); // disabledDate
    expect(cell('2026-06-15')).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(cell('2026-06-15'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Calendar 翻页', () => {
  it('点下一月 / 下一年触发 onPanelChange + 标题更新', () => {
    const onPanelChange = vi.fn();
    render(<Calendar referenceDate={REF} defaultPanelDate={REF} onPanelChange={onPanelChange} />);
    fireEvent.click(screen.getByLabelText('下个月'));
    expect(onPanelChange).toHaveBeenCalledTimes(1);
    const next = callArg<Date>(onPanelChange, 0);
    expect(next.getMonth()).toBe(6); // 7 月(0-based 6)
    expect(next.getDate()).toBe(1); // 归一到月首
    // 翻到 7 月后 7/1 应是当月(非 outside)
    expect(cell('2026-07-01')).not.toHaveClass('ms-cal__cell--outside');
  });

  it('受控 panelDate:内部翻页不改展示,仅回调', () => {
    const onPanelChange = vi.fn();
    render(
      <Calendar referenceDate={REF} panelDate={d(2026, 6, 1)} onPanelChange={onPanelChange} />,
    );
    fireEvent.click(screen.getByLabelText('下个月'));
    expect(onPanelChange).toHaveBeenCalledTimes(1);
    // 受控未更新 prop:仍展示 6 月,6/15 在当月
    expect(cell('2026-06-15')).not.toHaveClass('ms-cal__cell--outside');
  });
});

describe('Calendar 键盘网格导航', () => {
  it('方向键移动焦点 + Enter 选中', () => {
    const onChange = vi.fn();
    render(
      <Calendar
        referenceDate={REF}
        defaultPanelDate={REF}
        value={d(2026, 6, 15)}
        onChange={onChange}
      />,
    );
    const grid = screen.getByRole('grid');
    // 焦点初始在 15 号(tabIndex=0)
    expect(cell('2026-06-15')).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(grid, { key: 'ArrowRight' }); // → 16
    expect(cell('2026-06-16')).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(grid, { key: 'ArrowDown' }); // ↓ 一周 → 23
    expect(cell('2026-06-23')).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(grid, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(callArg<Date>(onChange, 0).getDate()).toBe(23);
  });

  it('PageDown 翻月、Shift+PageDown 翻年并自动翻页面板', () => {
    const onPanelChange = vi.fn();
    render(
      <Calendar
        referenceDate={REF}
        defaultPanelDate={REF}
        value={d(2026, 6, 15)}
        onPanelChange={onPanelChange}
      />,
    );
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'PageDown' }); // 焦点 6/15 → 7/15,翻到 7 月
    expect(onPanelChange).toHaveBeenCalled();
    expect(callArg<Date>(onPanelChange, onPanelChange.mock.calls.length - 1).getMonth()).toBe(6); // 7 月
    fireEvent.keyDown(grid, { key: 'PageDown', shiftKey: true }); // 7/15 → 次年 7/15
    expect(callArg<Date>(onPanelChange, onPanelChange.mock.calls.length - 1).getFullYear()).toBe(
      2027,
    );
  });

  it('Home / End 跳本周首尾(weekStartsOn=1)', () => {
    render(
      <Calendar
        referenceDate={REF}
        defaultPanelDate={REF}
        value={d(2026, 6, 17)}
        weekStartsOn={1}
      />,
    );
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'Home' }); // 周三 6/17 → 本周一 6/15
    expect(cell('2026-06-15')).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(grid, { key: 'End' }); // → 本周日 6/21
    expect(cell('2026-06-21')).toHaveAttribute('tabindex', '0');
  });
});

describe('Calendar 翻页焦点 / roving 不丢(#1 / #2)', () => {
  /** 数当前网格里 tabIndex=0 的日格数量(roving 不变量:永远恰好 1 个)。 */
  const focusableCount = () =>
    document.querySelectorAll<HTMLButtonElement>('.ms-cal__cell[tabindex="0"]').length;

  it('#1 点「下个月」翻页后,网格里仍恰好有一格 tabIndex=0(焦点不落到月外丢失)', () => {
    // referenceDate=6/26 → 初始 focused=6/26、panel=6 月,网格里 6/26 是唯一可聚焦格
    render(<Calendar referenceDate={REF} defaultPanelDate={REF} />);
    expect(focusableCount()).toBe(1);
    expect(cell('2026-06-26')).toHaveAttribute('tabindex', '0');

    // 点「下个月」→ panel 变 7 月。修复前 focused 仍是 6/26,7 月 42 格不含它 → 整网格 0 个 tabIndex=0
    fireEvent.click(screen.getByLabelText('下个月'));
    expect(focusableCount()).toBe(1); // 不变量:仍恰好一格
    // 焦点夹进 7 月等价日 7/26
    expect(cell('2026-07-26')).toHaveAttribute('tabindex', '0');
  });

  it('#1 连点两次「下个月」跨到 8 月,roving 仍唯一且在当月', () => {
    render(<Calendar referenceDate={REF} defaultPanelDate={REF} />);
    fireEvent.click(screen.getByLabelText('下个月'));
    fireEvent.click(screen.getByLabelText('下个月'));
    expect(focusableCount()).toBe(1);
    expect(cell('2026-08-26')).toHaveAttribute('tabindex', '0');
  });

  it('#1 受控 panelDate:父组件未翻页时,网格仍保有唯一 tabIndex=0(focused 夹回可见月)', () => {
    // 受控展示 7 月,但 value/focused 初值来自 6 月 → 不能让网格失去落脚点
    render(<Calendar referenceDate={REF} panelDate={d(2026, 7, 1)} value={d(2026, 6, 15)} />);
    expect(focusableCount()).toBe(1);
    // 夹进展示月 7 月(等价日 7/15)
    expect(cell('2026-07-15')).toHaveAttribute('tabindex', '0');
  });

  it('#1 翻页后焦点夹进的等价日被禁用时,落到本月就近可选日(仍唯一 focusable)', () => {
    render(
      <Calendar
        referenceDate={REF}
        defaultPanelDate={REF}
        disabledDate={(x) => x.getMonth() === 6 && x.getDate() === 26}
      />,
    );
    fireEvent.click(screen.getByLabelText('下个月')); // 7 月,7/26 被禁
    expect(focusableCount()).toBe(1);
    expect(cell('2026-07-27')).toHaveAttribute('tabindex', '0'); // 就近向后落 7/27
  });

  it('#2 导航按钮进入 Tab 序(不再硬编码 tabIndex=-1),键盘可达', () => {
    render(<Calendar referenceDate={REF} defaultPanelDate={REF} />);
    for (const label of ['上一年', '上个月', '下个月', '下一年']) {
      const btn = screen.getByLabelText(label);
      expect(btn).not.toHaveAttribute('tabindex', '-1');
    }
  });
});

describe('Calendar Space/Enter 提交去重(#3)', () => {
  it('#3 日格按钮收到 Space keydown 时 preventDefault(掐掉原生 keyup→click 二次提交)', () => {
    render(<Calendar referenceDate={REF} defaultPanelDate={REF} value={d(2026, 6, 15)} />);
    const btn = cell('2026-06-15');
    // fireEvent 返回 false 表示 default 被 preventDefault —— 原生激活被阻断,提交只走 grid keydown 一条路
    expect(fireEvent.keyDown(btn, { key: ' ' })).toBe(false);
    expect(fireEvent.keyDown(btn, { key: 'Enter' })).toBe(false);
  });

  it('#3 multiple 模式:grid 上一次 Space 只提交一次(净选中,不被二次 toggle 抵消)', () => {
    const onMultipleChange = vi.fn();
    render(
      <Calendar
        mode="multiple"
        referenceDate={REF}
        defaultPanelDate={REF}
        onMultipleChange={onMultipleChange}
      />,
    );
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: ' ' }); // 焦点初始在 today=6/26
    expect(onMultipleChange).toHaveBeenCalledTimes(1); // 恰好一次,非双次抵消
    expect(gridcell('2026-06-26')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Calendar range hover 离开清理(#4)', () => {
  it('#4 选中 start 后预览区间,鼠标移出网格 → 预览高亮清除', () => {
    render(<Calendar mode="range" referenceDate={REF} defaultPanelDate={REF} />);
    // 落 start=10(draftStart)
    fireEvent.click(cell('2026-06-10'));
    // 鼠标滑到 15 → 预览区间 10..15,中段 12 高亮
    fireEvent.mouseEnter(cell('2026-06-15'));
    expect(cell('2026-06-12')).toHaveClass('ms-cal__cell--in-range');
    // 鼠标移出网格(tbody.onMouseLeave)→ hover 清空,预览消失
    const tbody = document.querySelector('.ms-cal__weeks');
    if (!tbody) throw new Error('找不到 tbody');
    fireEvent.mouseLeave(tbody);
    expect(cell('2026-06-12')).not.toHaveClass('ms-cal__cell--in-range');
    // start(10)本身仍保持(草稿未丢)
    expect(cell('2026-06-10')).toHaveClass('ms-cal__cell--selected');
  });
});

describe('Calendar 留口 / 合并 / 多态', () => {
  it('dateCellRender 在数字下注入徽标(默认数字保留)', () => {
    render(
      <Calendar
        referenceDate={REF}
        defaultPanelDate={REF}
        dateCellRender={(date) => (date.getDate() === 10 ? <i data-testid="dot" /> : null)}
      />,
    );
    const c = cell('2026-06-10');
    expect(within(c).getByTestId('dot')).toBeInTheDocument();
    expect(c).toHaveTextContent('10'); // 数字仍在
  });

  it('renderCell 完全接管整格', () => {
    render(
      <Calendar
        referenceDate={REF}
        defaultPanelDate={REF}
        renderCell={(date) => <span data-testid="custom">D{date.getDate()}</span>}
      />,
    );
    expect(within(cell('2026-06-10')).getByTestId('custom')).toHaveTextContent('D10');
  });

  it('composeEventHandlers:用户 onKeyDown 先跑,preventDefault 阻断内部导航', () => {
    const userKey = vi.fn((e: React.KeyboardEvent) => e.preventDefault());
    render(
      <Calendar
        referenceDate={REF}
        defaultPanelDate={REF}
        value={d(2026, 6, 15)}
        onKeyDown={userKey}
      />,
    );
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(userKey).toHaveBeenCalledTimes(1);
    // 用户 preventDefault → 内部不移动焦点,仍在 15
    expect(cell('2026-06-15')).toHaveAttribute('tabindex', '0');
    expect(cell('2026-06-16')).toHaveAttribute('tabindex', '-1');
  });

  it('as 多态 + size 类名', () => {
    render(<Calendar as="section" size="compact" referenceDate={REF} />);
    const root = screen.getByRole('grid').closest('.ms-cal');
    expect(root?.tagName).toBe('SECTION');
    expect(root).toHaveClass('ms-cal--compact');
  });
});
