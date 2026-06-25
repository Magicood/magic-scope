// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
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
});
