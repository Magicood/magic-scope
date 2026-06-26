// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildRange, clampPage, pageRange } from './logic';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('当前页标记 aria-current', () => {
    render(<Pagination page={2} total={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: '第 2 页' })).toHaveAttribute('aria-current', 'page');
  });

  it('点击页码触发 onPageChange', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} total={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: '第 3 页' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('根 nav 透传原生属性与事件(...rest 留口)', () => {
    const onMouseEnter = vi.fn();
    render(
      <Pagination
        page={1}
        total={3}
        onPageChange={() => {}}
        data-testid="pg"
        onMouseEnter={onMouseEnter}
      />,
    );
    const nav = screen.getByTestId('pg');
    fireEvent.mouseEnter(nav);
    expect(onMouseEnter).toHaveBeenCalled();
  });

  it('onItemClick 先于内部翻页触发(用户处理器与内部处理器都跑)', () => {
    const onItemClick = vi.fn();
    const onPageChange = vi.fn();
    render(<Pagination page={1} total={5} onPageChange={onPageChange} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByRole('button', { name: '第 3 页' }));
    expect(onItemClick).toHaveBeenCalledWith(3, 'page', expect.anything());
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('onItemClick 内 preventDefault 可阻断内部翻页', () => {
    const onPageChange = vi.fn();
    const blocked = vi.fn((_p: number, _t: string, e: { preventDefault: () => void }) =>
      e.preventDefault(),
    );
    render(<Pagination page={1} total={5} onPageChange={onPageChange} onItemClick={blocked} />);
    fireEvent.click(screen.getByRole('button', { name: '第 4 页' }));
    expect(blocked).toHaveBeenCalled();
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('每页条数选择触发 onPageSizeChange 与 onChange 聚合', () => {
    const onPageSizeChange = vi.fn();
    const onChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalItems={200}
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={() => {}}
        onPageSizeChange={onPageSizeChange}
        onChange={onChange}
      />,
    );
    const select = screen.getByLabelText('每页条数') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '20' } });
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
    expect(onChange).toHaveBeenCalledWith(1, 20);
  });

  it('快速跳页:回车触发 onQuickJump 与 onPageChange', () => {
    const onQuickJump = vi.fn();
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={1}
        total={10}
        showQuickJumper
        onPageChange={onPageChange}
        onQuickJump={onQuickJump}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onQuickJump).toHaveBeenCalledWith(7);
    expect(onPageChange).toHaveBeenCalledWith(7);
  });

  it('simple 精简变体只渲染当前/总页且方向键可用', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} total={9} simple onPageChange={onPageChange} />);
    // 没有具体页码按钮(只剩 prev/next)
    expect(screen.queryByRole('button', { name: '第 5 页' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '下一页' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('showTotal 收到 total 与当前页区间', () => {
    const showTotal = vi.fn(() => 'x');
    render(
      <Pagination
        page={2}
        totalItems={95}
        pageSize={10}
        showTotal={showTotal}
        onPageChange={() => {}}
      />,
    );
    expect(showTotal).toHaveBeenCalledWith(95, [11, 20]);
  });

  it('itemRender 可把页码包成 <a> 且仍触发翻页', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <Pagination
        page={1}
        total={5}
        onPageChange={onPageChange}
        itemRender={(p, _type, el) => <a href={`#p${p}`}>{el}</a>}
      />,
    );
    const link = container.querySelector('a[href="#p3"]');
    expect(link).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '第 3 页' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});

describe('Pagination logic(纯函数,可平移 core)', () => {
  it('clampPage 夹取越界与 NaN', () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(99, 5)).toBe(5);
    expect(clampPage(Number.NaN, 5)).toBe(1);
  });

  it('buildRange 首尾恒显且用省略号折叠', () => {
    const r = buildRange(5, 20, 1);
    expect(r[0]).toBe(1);
    expect(r[r.length - 1]).toBe(20);
    expect(r).toContain('ellipsis-start');
    expect(r).toContain('ellipsis-end');
  });

  it('pageRange 计算当前页覆盖区间', () => {
    expect(pageRange(2, 10, 95)).toEqual([11, 20]);
    expect(pageRange(1, undefined, 95)).toBeNull();
    expect(pageRange(1, 10, 0)).toEqual([0, 0]);
  });
});
