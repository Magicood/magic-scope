/**
 * Tree 纯逻辑(零 React)—— 树结构操作 + 勾选级联的框架无关内核,可平移 `@magic-scope/core`。
 *
 * 勾选模型(级联,非 checkStrictly):checkedKeys 仅含「完全勾选」的节点;
 * 半选(halfChecked)由 deriveHalfChecked 从 checkedKeys 派生。toggle 时向下传播到后代、
 * 向上重算祖先(全部子节点勾选才勾选)。disabled 节点及其子树不参与级联。
 */

/** 树节点最小约定(logic 只认 key/children/disabled,title 等富内容留组件层)。 */
export interface TreeNodeLike {
  key: string;
  children?: readonly TreeNodeLike[];
  disabled?: boolean;
}

/** 扁平化后的可见节点(供渲染与键盘导航,顺序即视觉顺序)。 */
export interface FlatNode<N extends TreeNodeLike = TreeNodeLike> {
  node: N;
  /** 缩进层级(根为 0)。 */
  level: number;
  parentKey: string | null;
  hasChildren: boolean;
  expanded: boolean;
  /** 在同级中的序号(1 基,供 aria-posinset)。 */
  posInSet: number;
  /** 同级节点数(供 aria-setsize)。 */
  setSize: number;
}

/** 预解析的树元信息(父子映射 + 全部/叶子 key)。 */
export interface TreeMeta<N extends TreeNodeLike = TreeNodeLike> {
  nodeMap: Map<string, N>;
  parentMap: Map<string, string | null>;
  childrenKeys: Map<string, string[]>;
  allKeys: string[];
  leafKeys: string[];
}

const isDev = (): boolean => {
  const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env;
  return env ? env.NODE_ENV !== 'production' : false;
};

/** 预解析树:父子映射、全部 key、叶子 key。O(n)。key 必须全局唯一(重复会 dev warn)。 */
export function buildTreeMeta<N extends TreeNodeLike>(tree: readonly N[]): TreeMeta<N> {
  const nodeMap = new Map<string, N>();
  const parentMap = new Map<string, string | null>();
  const childrenKeys = new Map<string, string[]>();
  const allKeys: string[] = [];
  const leafKeys: string[] = [];
  const walk = (nodes: readonly N[], parent: string | null): void => {
    for (const node of nodes) {
      if (nodeMap.has(node.key) && isDev()) {
        console.warn(
          `[magic-scope Tree] 重复的节点 key「${node.key}」会导致状态错乱,key 必须全局唯一。`,
        );
      }
      nodeMap.set(node.key, node);
      parentMap.set(node.key, parent);
      allKeys.push(node.key);
      const kids = (node.children ?? []) as readonly N[];
      childrenKeys.set(
        node.key,
        kids.map((c) => c.key),
      );
      if (kids.length === 0) leafKeys.push(node.key);
      else walk(kids, node.key);
    }
  };
  walk(tree, null);
  return { nodeMap, parentMap, childrenKeys, allKeys, leafKeys };
}

/** 扁平化可见节点:只展开 expandedKeys 中的节点。顺序即视觉/键盘顺序。 */
export function flattenVisible<N extends TreeNodeLike>(
  tree: readonly N[],
  expandedKeys: ReadonlySet<string>,
): FlatNode<N>[] {
  const out: FlatNode<N>[] = [];
  const walk = (nodes: readonly N[], level: number, parentKey: string | null): void => {
    nodes.forEach((node, index) => {
      const kids = (node.children ?? []) as readonly N[];
      const hasChildren = kids.length > 0;
      const expanded = expandedKeys.has(node.key);
      out.push({
        node,
        level,
        parentKey,
        hasChildren,
        expanded,
        posInSet: index + 1,
        setSize: nodes.length,
      });
      if (hasChildren && expanded) walk(kids, level + 1, node.key);
    });
  };
  walk(tree, 0, null);
  return out;
}

/** 某节点的全部后代 key(不含自身)。 */
export function getDescendantKeys<N extends TreeNodeLike>(node: N): string[] {
  const out: string[] = [];
  const stack: N[] = [...((node.children ?? []) as readonly N[])];
  while (stack.length) {
    const n = stack.pop() as N;
    out.push(n.key);
    for (const c of (n.children ?? []) as readonly N[]) stack.push(c);
  }
  return out;
}

/** 某节点到根的祖先 key(从近到远)。 */
export function getAncestorKeys<N extends TreeNodeLike>(meta: TreeMeta<N>, key: string): string[] {
  const out: string[] = [];
  let p = meta.parentMap.get(key) ?? null;
  while (p) {
    out.push(p);
    p = meta.parentMap.get(p) ?? null;
  }
  return out;
}

/**
 * 级联勾选:把 key 设为 value,向下传播到后代、向上重算祖先。
 * disabled 节点及其子树不被改动;祖先「全部(非禁用)子节点勾选」才勾选。
 */
export function cascadeCheck<N extends TreeNodeLike>(
  meta: TreeMeta<N>,
  checked: ReadonlySet<string>,
  key: string,
  value: boolean,
): Set<string> {
  const next = new Set(checked);
  // 向下:disabled 节点自身的勾选态不改,但仍遍历其 enabled 后代(不连坐跳过整棵子树)
  const stack = [key];
  while (stack.length) {
    const k = stack.pop() as string;
    if (!meta.nodeMap.get(k)?.disabled) {
      if (value) next.add(k);
      else next.delete(k);
    }
    for (const c of meta.childrenKeys.get(k) ?? []) stack.push(c);
  }
  // 向上:disabled 祖先自身不动;非禁用祖先「全部非禁用子节点勾选」才勾选,否则取消
  let p = meta.parentMap.get(key) ?? null;
  while (p) {
    if (!meta.nodeMap.get(p)?.disabled) {
      const kids = (meta.childrenKeys.get(p) ?? []).filter((c) => !meta.nodeMap.get(c)?.disabled);
      const allChecked = kids.length > 0 && kids.every((c) => next.has(c));
      if (allChecked) next.add(p);
      else next.delete(p);
    }
    p = meta.parentMap.get(p) ?? null;
  }
  return next;
}

/** 从 checkedKeys 派生半选集:未完全勾选但有后代被勾选的节点。 */
export function deriveHalfChecked<N extends TreeNodeLike>(
  tree: readonly N[],
  checked: ReadonlySet<string>,
): Set<string> {
  const half = new Set<string>();
  // 返回「该子树是否有任意勾选」,后序遍历自下而上标记半选
  const visit = (node: N): boolean => {
    const kids = (node.children ?? []) as readonly N[];
    let anyChecked = checked.has(node.key);
    for (const c of kids) {
      if (visit(c)) anyChecked = true;
    }
    if (!checked.has(node.key) && anyChecked) half.add(node.key);
    return anyChecked;
  };
  for (const n of tree) visit(n);
  return half;
}
