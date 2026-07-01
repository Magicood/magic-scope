import { Toolbar } from '@magic-scope/react';

// 非受控 ToggleGroup:defaultValue 初始选中、allowDeselect 允许点已选项取消、
// attached 相邻项吸附合并边界;Toolbar.Button 的 rightIcon 后置图标。
export default function Demo() {
  return (
    <Toolbar aria-label="视图工具栏">
      <Toolbar.ToggleGroup type="single" label="视图" defaultValue="grid" allowDeselect attached>
        <Toolbar.ToggleItem value="grid">网格</Toolbar.ToggleItem>
        <Toolbar.ToggleItem value="list">列表</Toolbar.ToggleItem>
        <Toolbar.ToggleItem value="board">看板</Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
      <Toolbar.Separator />
      <Toolbar.Button variant="outline" rightIcon={<span aria-hidden="true">▾</span>}>
        更多
      </Toolbar.Button>
    </Toolbar>
  );
}
