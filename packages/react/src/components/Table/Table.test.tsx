// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Table } from './Table';

const columns = [
  { key: 'name', header: '姓名' },
  { key: 'age', header: '年龄', align: 'end' as const },
];

const data = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

describe('Table', () => {
  it('渲染语义化 table、列表头(th[scope=col])与行数据单元格', () => {
    render(<Table columns={columns} data={data} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass('ms-table');

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveAttribute('scope', 'col');
    expect(headers[0]).toHaveClass('ms-table__th');
    expect(screen.getByRole('columnheader', { name: '姓名' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '年龄' })).toBeInTheDocument();

    // 行:thead 1 行 + tbody 2 行
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByRole('cell', { name: 'Alice' })).toHaveClass('ms-table__td');
    expect(screen.getByRole('cell', { name: 'Bob' })).toBeInTheDocument();
  });

  it('align 非 start 时为表头与单元格加对齐修饰类', () => {
    render(<Table columns={columns} data={data} />);

    // 第二列 align=end
    expect(screen.getByRole('columnheader', { name: '年龄' })).toHaveClass('ms-table__th--end');
    expect(screen.getByRole('cell', { name: '30' })).toHaveClass('ms-table__td--end');

    // 第一列默认 start,不应有对齐修饰类
    const nameHeader = screen.getByRole('columnheader', { name: '姓名' });
    expect(nameHeader).not.toHaveClass('ms-table__th--start');
    expect(nameHeader).not.toHaveClass('ms-table__th--end');
  });

  it('stripe / hoverable / className 反映在外层包裹 div 上', () => {
    const { container } = render(
      <Table columns={columns} data={data} stripe hoverable className="custom-wrap" />,
    );

    const wrap = container.querySelector('.ms-table-wrap');
    expect(wrap).toBeInTheDocument();
    expect(wrap).toHaveClass(
      'ms-table-wrap',
      'ms-table-wrap--stripe',
      'ms-table-wrap--hoverable',
      'custom-wrap',
    );
  });

  it('设置 caption 时渲染 <caption>,并使用 getRowKey 派生行 key', () => {
    const getRowKey = vi.fn((row: Record<string, unknown>) => `row-${row.name as string}`);

    render(<Table columns={columns} data={data} caption="用户列表" getRowKey={getRowKey} />);

    // caption 文本渲染且被 table 当作无障碍标题
    expect(screen.getByText('用户列表')).toHaveClass('ms-table__caption');
    expect(screen.getByRole('table', { name: '用户列表' })).toBeInTheDocument();

    // getRowKey 对每个数据行调用一次,带行索引
    expect(getRowKey).toHaveBeenCalledTimes(2);
    expect(getRowKey).toHaveBeenCalledWith(data[0], 0);
    expect(getRowKey).toHaveBeenCalledWith(data[1], 1);
  });

  it('列 render 自定义单元格内容', () => {
    const cols = [
      {
        key: 'name',
        header: '姓名',
        render: (r: { name: string }) => <b>{r.name.toUpperCase()}</b>,
      },
    ];
    render(<Table columns={cols} data={[{ name: 'alice' }]} />);
    expect(screen.getByText('ALICE')).toBeInTheDocument();
  });

  it('排序(非受控):点表头循环 asc→desc→无序并重排数据,aria-sort 跟随', () => {
    const cols = [
      { key: 'name', header: '姓名' },
      { key: 'age', header: '年龄', sortable: true },
    ];
    render(<Table columns={cols} data={data} />);
    const header = screen.getByRole('columnheader', { name: '年龄' });
    const btn = within(header).getByRole('button');

    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Alice'); // 初始原序
    fireEvent.click(btn);
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Bob'); // 25 在前
    fireEvent.click(btn);
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Alice'); // 30 在前
    fireEvent.click(btn);
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Alice'); // 回原序
  });

  it('排序(受控):aria-sort 跟随 sortState,点击只回调不自排', () => {
    const onSortChange = vi.fn();
    const cols = [{ key: 'age', header: '年龄', sortable: true }];
    const { rerender } = render(
      <Table columns={cols} data={data} sortState={null} onSortChange={onSortChange} />,
    );
    const header = screen.getByRole('columnheader', { name: '年龄' });
    expect(header).toHaveAttribute('aria-sort', 'none');

    fireEvent.click(within(header).getByRole('button'));
    expect(onSortChange).toHaveBeenCalledWith({ columnKey: 'age', direction: 'asc' });
    expect(header).toHaveAttribute('aria-sort', 'none'); // 受控未更新 → 不变

    rerender(
      <Table
        columns={cols}
        data={data}
        sortState={{ columnKey: 'age', direction: 'desc' }}
        onSortChange={onSortChange}
      />,
    );
    expect(header).toHaveAttribute('aria-sort', 'descending');
  });

  it('行选择:全选三态 + 行选回调,选中行高亮', () => {
    function Wrap() {
      const [keys, setKeys] = useState<Array<string | number>>([]);
      return (
        <Table
          columns={columns}
          data={data}
          getRowKey={(r) => (r as { name: string }).name}
          rowSelection={{ selectedKeys: keys, onChange: setKeys }}
        />
      );
    }
    render(<Wrap />);
    const selectAll = screen.getByLabelText('全选') as HTMLInputElement;
    const row1 = screen.getByLabelText('选择第 1 行') as HTMLInputElement;
    const row2 = screen.getByLabelText('选择第 2 行') as HTMLInputElement;

    fireEvent.click(row1);
    expect(row1).toBeChecked();
    expect(selectAll.indeterminate).toBe(true); // 部分选 → 半选

    fireEvent.click(selectAll);
    expect(row1).toBeChecked();
    expect(row2).toBeChecked();
    expect(selectAll.indeterminate).toBe(false);
    expect(selectAll).toBeChecked();
  });

  it('loading:外层 aria-busy + Spinner 遮罩', () => {
    const { container } = render(<Table columns={columns} data={data} loading />);
    expect(container.querySelector('.ms-table-wrap')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('.ms-table__loading')).toBeInTheDocument();
  });

  it('空数据:渲染空态行(默认 / 自定义)', () => {
    const { rerender } = render(<Table columns={columns} data={[]} />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
    rerender(<Table columns={columns} data={[]} empty="没有结果" />);
    expect(screen.getByText('没有结果')).toBeInTheDocument();
  });

  it('stickyHeader:外层加粘性类', () => {
    const { container } = render(<Table columns={columns} data={data} stickyHeader />);
    expect(container.querySelector('.ms-table-wrap')).toHaveClass('ms-table-wrap--sticky-head');
  });
});
