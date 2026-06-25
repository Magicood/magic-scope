import type { ReactNode } from 'react';
import { forwardRef } from 'react';

/** 列定义。`key` 对应 data 行对象的字段名;`header` 为表头内容;`align` 控制该列单元格的文本对齐。 */
export interface TableColumn {
  /** 字段键,用于从行对象取值,同时作为 React key。 */
  key: string;
  /** 表头内容。 */
  header: ReactNode;
  /** 列对齐:start(默认)/ center / end。表头与单元格一致。 */
  align?: 'start' | 'end' | 'center';
}

export interface TableProps {
  /** 列定义数组。 */
  columns: TableColumn[];
  /** 行数据数组,每行是 字段键 -> 单元格内容 的映射。 */
  data: Array<Record<string, ReactNode>>;
  /** 斑马纹:为偶数行加极淡底色,提升长表可读性。默认 false。 */
  stripe?: boolean;
  /** 行 hover 高亮:鼠标悬停整行换 surface-raised 底。默认 false。 */
  hoverable?: boolean;
  /** 自定义行 key 派生,默认用行索引。返回值需在表内唯一。 */
  getRowKey?: (row: Record<string, ReactNode>, index: number) => string | number;
  /** 外框 caption(无障碍标题),设置后渲染 <caption>。 */
  caption?: ReactNode;
  /** 透传给外层包裹 <div> 的 className。 */
  className?: string;
}

/**
 * Table —— 基础数据表格。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 渲染语义化 <table>(自带 role) + thead(th[scope=col]) + tbody;表头用 surface-raised 底并加粗,
 * stripe 为偶数行加淡底,hoverable 行 hover 换 surface-raised 底。外层 div 提供圆角边框与横向 overflow。
 * 样式见同目录 Table.css,需引入 @magic-scope/react/styles.css。
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ columns, data, stripe = false, hoverable = false, getRowKey, caption, className }, ref) => (
    <div
      className={[
        'ms-table-wrap',
        stripe && 'ms-table-wrap--stripe',
        hoverable && 'ms-table-wrap--hoverable',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <table ref={ref} className="ms-table">
        {caption ? <caption className="ms-table__caption">{caption}</caption> : null}
        <thead className="ms-table__head">
          <tr className="ms-table__row">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={[
                  'ms-table__th',
                  col.align && col.align !== 'start' && `ms-table__th--${col.align}`,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="ms-table__body">
          {data.map((row, rowIndex) => (
            <tr key={getRowKey ? getRowKey(row, rowIndex) : rowIndex} className="ms-table__row">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[
                    'ms-table__td',
                    col.align && col.align !== 'start' && `ms-table__td--${col.align}`,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
);
Table.displayName = 'Table';
