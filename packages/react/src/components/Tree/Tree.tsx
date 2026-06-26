import type { CSSProperties, ElementType, KeyboardEvent, ReactNode } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildTreeMeta,
  cascadeCheck,
  deriveHalfChecked,
  flattenVisible,
  type TreeNodeLike,
} from './logic';

export type TreeSize = 'sm' | 'md' | 'lg';

/** 树节点(logic 只认 key/children/disabled,title/icon 等富内容在此层)。 */
export interface TreeNode {
  key: string;
  title: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  /** 节点图标(配合 showIcon)。 */
  icon?: ReactNode;
  /** 单独禁用该节点的勾选框(仍可选中/展开)。 */
  disableCheckbox?: boolean;
}

/** 各部件细粒度 className。 */
export interface TreeClassNames {
  root?: string;
  node?: string;
  label?: string;
}

export interface TreeProps {
  /** 树数据。 */
  data: TreeNode[];
  /** 受控展开 key。 */
  expandedKeys?: string[];
  /** 非受控初始展开 key。 */
  defaultExpandedKeys?: string[];
  /** 默认全展开(仅非受控初始)。 */
  defaultExpandAll?: boolean;
  /** 展开变化回调。 */
  onExpandedChange?: (keys: string[]) => void;
  /** 是否可选中。默认 true。 */
  selectable?: boolean;
  /** 多选。默认 false(单选)。 */
  multiple?: boolean;
  /** 受控选中 key。 */
  selectedKeys?: string[];
  /** 非受控初始选中。 */
  defaultSelectedKeys?: string[];
  /** 选中变化回调。 */
  onSelect?: (keys: string[], info: { node: TreeNode; selected: boolean }) => void;
  /** 显示勾选框(级联)。 */
  checkable?: boolean;
  /** 受控勾选 key(完全勾选)。 */
  checkedKeys?: string[];
  /** 非受控初始勾选。 */
  defaultCheckedKeys?: string[];
  /** 勾选变化回调(带半选 key)。 */
  onCheck?: (
    keys: string[],
    info: { node: TreeNode; checked: boolean; halfCheckedKeys: string[] },
  ) => void;
  /** 显示节点图标。 */
  showIcon?: boolean;
  /** 显示缩进引导线。 */
  showLine?: boolean;
  /** 节点整行可点(整行高亮),否则仅标题区。默认 true。 */
  blockNode?: boolean;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: TreeSize;
  /** 各部件 className。 */
  classNames?: TreeClassNames;
  /** 根 className。 */
  className?: string;
  /** 多态根标签(默认 'ul')。 */
  as?: ElementType;
}

const cssEsc = (s: string): string =>
  typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(s) : s.replace(/["\\]/g, '\\$&');

const allExpandableKeys = (nodes: TreeNode[]): string[] => {
  const out: string[] = [];
  const walk = (ns: TreeNode[]) => {
    for (const n of ns) {
      if (n.children?.length) {
        out.push(n.key);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return out;
};

/**
 * Tree —— 树形控件(旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 展开/折叠、单选/多选、级联勾选(含半选)、节点图标、引导线;完整 ARIA tree 键盘导航
 * (方向键展开折叠/进出层级、Home/End、Enter 选中、Space 勾选)。受控/非受控三态(expanded/selected/checked)。
 * 纯树操作(扁平化、级联、半选派生)走同目录 logic.ts(可平移 core)。样式见 Tree.css。
 */
export const Tree = forwardRef<HTMLElement, TreeProps>(
  (
    {
      data,
      expandedKeys: expandedProp,
      defaultExpandedKeys,
      defaultExpandAll = false,
      onExpandedChange,
      selectable = true,
      multiple = false,
      selectedKeys: selectedProp,
      defaultSelectedKeys,
      onSelect,
      checkable = false,
      checkedKeys: checkedProp,
      defaultCheckedKeys,
      onCheck,
      showIcon = false,
      showLine = false,
      blockNode = true,
      size = 'md',
      classNames,
      className,
      as,
    },
    ref,
  ) => {
    const meta = useMemo(() => buildTreeMeta(data as TreeNodeLike[]), [data]);

    // 受控/非受控三套
    const isExpandedControlled = expandedProp !== undefined;
    const [expandedInternal, setExpandedInternal] = useState<Set<string>>(
      () => new Set(defaultExpandAll ? allExpandableKeys(data) : (defaultExpandedKeys ?? [])),
    );
    const expanded = useMemo(
      () => (isExpandedControlled ? new Set(expandedProp) : expandedInternal),
      [isExpandedControlled, expandedProp, expandedInternal],
    );

    const isSelectedControlled = selectedProp !== undefined;
    const [selectedInternal, setSelectedInternal] = useState<Set<string>>(
      () => new Set(defaultSelectedKeys ?? []),
    );
    const selected = useMemo(
      () => (isSelectedControlled ? new Set(selectedProp) : selectedInternal),
      [isSelectedControlled, selectedProp, selectedInternal],
    );

    const isCheckedControlled = checkedProp !== undefined;
    const [checkedInternal, setCheckedInternal] = useState<Set<string>>(
      () => new Set(defaultCheckedKeys ?? []),
    );
    const checked = useMemo(
      () => (isCheckedControlled ? new Set(checkedProp) : checkedInternal),
      [isCheckedControlled, checkedProp, checkedInternal],
    );

    const halfChecked = useMemo(
      () => (checkable ? deriveHalfChecked(data as TreeNodeLike[], checked) : new Set<string>()),
      [checkable, data, checked],
    );

    const flat = useMemo(() => flattenVisible(data as TreeNodeLike[], expanded), [data, expanded]);

    const [focusedKey, setFocusedKey] = useState<string | null>(null);
    const [focusVersion, setFocusVersion] = useState(0);
    const treeRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (focusVersion === 0 || !focusedKey) return;
      treeRef.current?.querySelector<HTMLElement>(`[data-key="${cssEsc(focusedKey)}"]`)?.focus();
    }, [focusVersion, focusedKey]);

    // roving tabindex 必须恒有唯一可聚焦项:focusedKey 若因折叠从 flat 消失,回退到首个可见节点
    const focusedVisible = focusedKey != null && flat.some((f) => f.node.key === focusedKey);
    const tabbableKey = focusedVisible ? focusedKey : (flat[0]?.node.key ?? null);

    const commitExpanded = (next: Set<string>) => {
      if (!isExpandedControlled) setExpandedInternal(next);
      onExpandedChange?.([...next]);
    };
    const toggleExpand = (key: string) => {
      const next = new Set(expanded);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      commitExpanded(next);
    };

    const handleSelect = (node: TreeNode) => {
      if (!selectable || node.disabled) return;
      const isSelected = !selected.has(node.key);
      let next: Set<string>;
      if (multiple) {
        next = new Set(selected);
        if (isSelected) next.add(node.key);
        else next.delete(node.key);
      } else {
        next = new Set([node.key]); // 单选:再点保持选中(对齐 antd,不取消)
      }
      if (!isSelectedControlled) setSelectedInternal(next);
      onSelect?.([...next], { node, selected: multiple ? isSelected : true });
    };

    const handleCheck = (node: TreeNode) => {
      if (node.disabled || node.disableCheckbox) return;
      const value = !checked.has(node.key);
      const next = cascadeCheck(meta, checked, node.key, value);
      if (!isCheckedControlled) setCheckedInternal(next);
      onCheck?.([...next], {
        node,
        checked: value,
        halfCheckedKeys: [...deriveHalfChecked(data as TreeNodeLike[], next)],
      });
    };

    const moveFocus = (key: string | undefined) => {
      if (!key) return;
      setFocusedKey(key);
      setFocusVersion((v) => v + 1);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
      const idx = focusedKey ? flat.findIndex((f) => f.node.key === focusedKey) : 0;
      const cur = flat[idx];
      if (!cur) return;
      let handled = true;
      switch (e.key) {
        case 'ArrowDown':
          moveFocus(flat[Math.min(idx + 1, flat.length - 1)]?.node.key);
          break;
        case 'ArrowUp':
          moveFocus(flat[Math.max(idx - 1, 0)]?.node.key);
          break;
        case 'ArrowRight':
          if (cur.hasChildren && !cur.expanded) toggleExpand(cur.node.key);
          else if (cur.hasChildren && cur.expanded) moveFocus(flat[idx + 1]?.node.key);
          break;
        case 'ArrowLeft':
          if (cur.hasChildren && cur.expanded) toggleExpand(cur.node.key);
          else moveFocus(cur.parentKey ?? undefined);
          break;
        case 'Home':
          moveFocus(flat[0]?.node.key);
          break;
        case 'End':
          moveFocus(flat[flat.length - 1]?.node.key);
          break;
        case 'Enter':
          handleSelect(cur.node as TreeNode);
          break;
        case ' ':
          if (checkable) handleCheck(cur.node as TreeNode);
          else handleSelect(cur.node as TreeNode);
          break;
        default:
          handled = false;
      }
      if (handled) e.preventDefault();
    };

    const Root = (as ?? 'ul') as ElementType;
    const rootClass = [
      'ms-tree',
      `ms-tree--${size}`,
      showLine && 'ms-tree--line',
      blockNode && 'ms-tree--block',
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Root
        ref={(node: HTMLElement | null) => {
          treeRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as { current: HTMLElement | null }).current = node;
        }}
        className={rootClass}
        role="tree"
        aria-multiselectable={multiple || undefined}
        onKeyDown={onKeyDown}
      >
        {flat.map((f) => {
          const node = f.node as TreeNode;
          const isChecked = checked.has(node.key);
          const isHalf = halfChecked.has(node.key);
          const isSelected = selected.has(node.key);
          const nodeClass = [
            'ms-tree__node',
            f.hasChildren && 'ms-tree__node--parent',
            isSelected && 'ms-tree__node--selected',
            node.disabled && 'ms-tree__node--disabled',
            classNames?.node,
          ]
            .filter(Boolean)
            .join(' ');
          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: treeitem 点击=选中,键盘等价(Enter/Space/方向键)由 tree 容器的 onKeyDown 统一处理(ARIA tree 复合控件范式)
            <li
              key={node.key}
              data-key={node.key}
              className={nodeClass}
              role="treeitem"
              aria-level={f.level + 1}
              aria-posinset={f.posInSet}
              aria-setsize={f.setSize}
              aria-expanded={f.hasChildren ? f.expanded : undefined}
              aria-selected={selectable ? isSelected : undefined}
              aria-checked={checkable ? (isHalf ? 'mixed' : isChecked) : undefined}
              aria-disabled={node.disabled || undefined}
              tabIndex={node.key === tabbableKey ? 0 : -1}
              onClick={() => handleSelect(node)}
              onFocus={(e) => {
                if (e.target === e.currentTarget && node.key !== focusedKey)
                  setFocusedKey(node.key);
              }}
              style={{ '--ms-tree-level': f.level } as CSSProperties}
            >
              <span className="ms-tree__indent" aria-hidden="true" />
              {f.hasChildren ? (
                <button
                  type="button"
                  className="ms-tree__toggle"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(node.key);
                  }}
                >
                  <span className={`ms-tree__arrow${f.expanded ? ' ms-tree__arrow--open' : ''}`}>
                    ▸
                  </span>
                </button>
              ) : (
                <span className="ms-tree__toggle ms-tree__toggle--leaf" aria-hidden="true" />
              )}
              {checkable && (
                <span
                  className={[
                    'ms-tree__checkbox',
                    isChecked && 'ms-tree__checkbox--checked',
                    isHalf && 'ms-tree__checkbox--half',
                    (node.disabled || node.disableCheckbox) && 'ms-tree__checkbox--disabled',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheck(node);
                  }}
                />
              )}
              {showIcon && node.icon != null && (
                <span className="ms-tree__icon" aria-hidden="true">
                  {node.icon}
                </span>
              )}
              <span className={['ms-tree__label', classNames?.label].filter(Boolean).join(' ')}>
                {node.title}
              </span>
            </li>
          );
        })}
      </Root>
    );
  },
);
Tree.displayName = 'Tree';
