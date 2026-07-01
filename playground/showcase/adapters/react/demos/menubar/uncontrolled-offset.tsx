import { Menubar } from '@magic-scope/react';

// 非受控 + 浮层间距 + typeahead:
// - defaultValue 让「编辑」菜单初始即展开(非受控,后续 ←→ 切换自行接管)
// - offset 加大触发器与下拉面板之间的距离
// - textValue 给 label 为非纯文本节点的菜单补 typeahead 匹配文本
//   (这里「视图」label 是带图标的 JSX,靠 textValue="视图" 才能键入 "s"/"视" 命中)
export default function Demo() {
  return (
    <Menubar defaultValue="edit" offset={10}>
      <Menubar.Menu
        value="file"
        label="文件"
        items={[
          { label: '新建', shortcut: '⌘N', onSelect: () => {} },
          { label: '打开…', shortcut: '⌘O', onSelect: () => {} },
        ]}
      />
      <Menubar.Menu
        value="edit"
        label="编辑"
        items={[
          { label: '撤销', shortcut: '⌘Z', onSelect: () => {} },
          { label: '重做', shortcut: '⇧⌘Z', onSelect: () => {} },
        ]}
      />
      <Menubar.Menu
        value="view"
        textValue="视图"
        label={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span aria-hidden>◫</span>视图
          </span>
        }
        items={[
          { label: '放大', onSelect: () => {} },
          { label: '缩小', onSelect: () => {} },
        ]}
      />
    </Menubar>
  );
}
