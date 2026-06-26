---
"@magic-scope/react": minor
---

Table 增强(P1):排序 / 行选择 / 空态·加载态 / 粘性表头

Table 从基础表升级为数据表格,新能力默认关闭、旧 `columns/data` 用法零改动(`TableProps<T>` 泛型默认 `Record<string, ReactNode>`):

- **排序**:`column.sortable` + `sortState`/`defaultSortState`/`onSortChange`,受控(只回调、外部排好)与非受控(内置 `sorter`/默认比较器)双轨;三态 asc→desc→无序;表头原生 `<button>` + `aria-sort`,键盘可达。
- **行选择**:`rowSelection`(受控 `selectedKeys`/`onChange`),全选三态(复用 Checkbox `indeterminate`),选中行高亮 `data-ms-selected`;每个选择框带 `aria-label`。
- **空态 / 加载态**:`empty`(默认「暂无数据」)、`loading`(Spinner 遮罩 + `aria-busy`)、`skeletonRows`(骨架行)。
- **粘性表头**:`stickyHeader` + `maxHeight`,限高可滚、表头吸顶(`border-collapse` 下用 inset 阴影画底线规避边框丢失)。
- **列**:`render` 自定义单元格、`headerClassName`/`cellClassName`;斑马纹迁到 `.ms-table__row--data`(为后续展开行让路)。
- 新增 `.ms-sr-only` 工具类(`device.css`,统一隐藏-但-可读出口)。

分页不内建(组合现有 `<Pagination>`);展开行 / 列固定 / 列宽调整 / 虚拟滚动属后续阶段。
