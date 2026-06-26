import type { ChangeEvent, ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef, useCallback, useId, useMemo, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { Checkbox } from '../Checkbox/Checkbox';
import {
  checkStateOf,
  countOf,
  filterBySearch,
  moveKeys as moveKeysLogic,
  splitByTargetKeys,
  type TransferDirection,
  type TransferItemLike,
  toggleSelectAllByKeys,
  toggleSelectedKey,
} from './logic';

export type { TransferDirection, TransferItemLike } from './logic';

/** 穿梭项数据契约;render 缺省时展示 title,disabled 项不可选不可移动。 */
export interface TransferItem extends TransferItemLike {
  /** 唯一标识。 */
  key: string;
  /** 默认展示文本。 */
  title: string;
  /** 禁用该项:不可选、不参与全选、不可移动。 */
  disabled?: boolean | undefined;
}

/** 细粒度槽位 className —— 允许只覆盖某一部位而不夺走根 className。 */
export interface TransferClassNames {
  /** 单侧面板容器。 */
  panel?: string | undefined;
  /** 面板表头(全选框 + 计数 + 标题)。 */
  header?: string | undefined;
  /** 搜索框外层。 */
  search?: string | undefined;
  /** 列表 ul。 */
  list?: string | undefined;
  /** 单个列表项 li。 */
  item?: string | undefined;
  /** 空态容器。 */
  empty?: string | undefined;
  /** 中间方向按钮区。 */
  operations?: string | undefined;
}

export interface TransferProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'title'> {
  /** 全量数据源(左右两栏合并的真相源)。 */
  dataSource: readonly TransferItem[];
  /** 受控:位于右栏(目标)的 key 集合。 */
  targetKeys?: readonly string[] | undefined;
  /** 非受控初始右栏 key 集合。 */
  defaultTargetKeys?: readonly string[] | undefined;
  /**
   * 右栏 key 集合变化回调。
   * @param targetKeys 移动后的新右栏 key 集合(按 dataSource 原序)。
   * @param direction 本次移动方向(`right` 左→右 / `left` 右→左)。
   * @param moveKeys 本次实际移动的 key(已剔除禁用 / 不存在的)。
   */
  onChange?:
    | ((targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => void)
    | undefined;
  /** 自定义每项渲染(覆盖默认 title 文本);返回内联节点。 */
  render?: ((item: TransferItem) => ReactNode) | undefined;
  /** 两栏标题 [左, 右]。 */
  titles?: readonly [ReactNode, ReactNode] | undefined;
  /** 是否显示搜索框(两栏均显示)。默认 false。 */
  showSearch?: boolean | undefined;
  /** 自定义过滤匹配器(返回 true 保留);缺省按 title 包含匹配。 */
  filterOption?: ((query: string, item: TransferItem) => boolean) | undefined;
  /** 单向模式:仅保留「左→右」方向按钮,右栏不显示移回控件。默认 false。 */
  oneWay?: boolean | undefined;
  /** 整体禁用:两栏不可选、方向按钮不可用。 */
  disabled?: boolean | undefined;
  /** 细粒度槽位 className。 */
  classNames?: TransferClassNames | undefined;
}

const DENSITY_NONE: readonly string[] = [];

interface PanelProps {
  side: 'left' | 'right';
  title: ReactNode;
  items: readonly TransferItem[];
  selectedKeys: readonly string[];
  disabled: boolean;
  showSearch: boolean;
  render: ((item: TransferItem) => ReactNode) | undefined;
  filterOption: ((query: string, item: TransferItem) => boolean) | undefined;
  classNames: TransferClassNames;
  searchLabel: string;
  emptyLabel: string;
  selectedText: string;
  /**
   * 表头全选切换。affectedKeys = 当前可见(已过滤)且可选(未禁用)的 key —— 全选作用域必须与表头态
   * 一致,只动「看得见」的项,绝不波及被搜索隐藏的项。
   */
  onToggleAll: (checked: boolean, affectedKeys: string[]) => void;
  onToggleKey: (key: string) => void;
}

function TransferPanel({
  side,
  title,
  items,
  selectedKeys,
  disabled,
  showSearch,
  render,
  filterOption,
  classNames,
  searchLabel,
  emptyLabel,
  selectedText,
  onToggleAll,
  onToggleKey,
}: PanelProps) {
  const [query, setQuery] = useState('');
  const titleId = useId();

  const filtered = useMemo(
    () => (showSearch ? filterBySearch(items, query, filterOption) : [...items]),
    [items, query, showSearch, filterOption],
  );

  // 全选态只看「当前可见(已过滤)」的可选项,避免被搜索隐藏的项干扰勾选语义。
  const headState = checkStateOf(filtered, selectedKeys);
  const allChecked = headState === 'all';
  const indeterminate = headState === 'some';

  const handleSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, []);

  const hasEnabled = filtered.some((item) => !item.disabled);

  // 全选作用域 = 当前可见(已过滤)的可选项,与表头态(headState 看 filtered)严格一致。
  const handleToggleAll = useCallback(
    (checked: boolean) => {
      const affectedKeys = filtered.filter((item) => !item.disabled).map((item) => item.key);
      onToggleAll(checked, affectedKeys);
    },
    [filtered, onToggleAll],
  );

  return (
    <div
      className={['ms-transfer__panel', classNames.panel].filter(Boolean).join(' ')}
      data-side={side}
    >
      <div className={['ms-transfer__header', classNames.header].filter(Boolean).join(' ')}>
        <Checkbox
          checked={allChecked}
          indeterminate={indeterminate}
          disabled={disabled || !hasEnabled}
          onCheckedChange={handleToggleAll}
          inputProps={{ 'aria-labelledby': titleId }}
        />
        <span className="ms-transfer__header-text" id={titleId}>
          <span className="ms-transfer__count">{selectedText}</span>
          {title != null && <span className="ms-transfer__title">{title}</span>}
        </span>
      </div>

      {showSearch && (
        <div className={['ms-transfer__search', classNames.search].filter(Boolean).join(' ')}>
          <input
            type="search"
            className="ms-transfer__search-input"
            value={query}
            onChange={handleSearch}
            placeholder={searchLabel}
            aria-label={searchLabel}
            disabled={disabled}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div
          className={['ms-transfer__empty', classNames.empty].filter(Boolean).join(' ')}
          role="status"
        >
          {emptyLabel}
        </div>
      ) : (
        <ul className={['ms-transfer__list', classNames.list].filter(Boolean).join(' ')}>
          {filtered.map((item) => {
            const itemDisabled = disabled || item.disabled === true;
            const checked = selectedKeys.includes(item.key);
            return (
              <li
                key={item.key}
                className={[
                  'ms-transfer__item',
                  itemDisabled && 'ms-transfer__item--disabled',
                  checked && 'ms-transfer__item--checked',
                  classNames.item,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Checkbox
                  checked={checked}
                  disabled={itemDisabled}
                  onCheckedChange={() => onToggleKey(item.key)}
                >
                  <span className="ms-transfer__item-label">
                    {render ? render(item) : item.title}
                  </span>
                </Checkbox>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Transfer —— 双列穿梭框(data-display 旗舰)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 * 两个列表面板(各带表头全选框 + 「已选 X/Y」计数 + 标题、可选搜索框、空态、每项 Checkbox)+ 中间方向按钮
 * (→ ← 按两侧选中态启用)。受控 targetKeys / 非受控 defaultTargetKeys;移动经纯逻辑 logic.ts(零 React,可平移 core)
 * 计算,onChange 回传 (targetKeys, direction, moveKeys)。oneWay 单向只保留左→右。
 * a11y:list(ul/li)+ 每项 checkbox + 表头全选 checkbox + 方向 button(aria-label / aria-disabled);
 * 长 title 截断不撑破。尊重 prefers-reduced-motion 与 [data-ms-motion=off]。
 * 留口:...rest 透传根 div、classNames 细粒度槽位、render 自定义项、filterOption 自定义过滤。
 * 样式见同目录 Transfer.css,需引入 @magic-scope/react 的 styles.css。
 */
export const Transfer = forwardRef<HTMLDivElement, TransferProps>(
  (
    {
      dataSource,
      targetKeys: controlledTargetKeys,
      defaultTargetKeys,
      onChange,
      render,
      titles,
      showSearch = false,
      filterOption,
      oneWay = false,
      disabled = false,
      classNames,
      className,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const slots = classNames ?? {};

    const [internalTarget, setInternalTarget] = useState<readonly string[]>(
      defaultTargetKeys ?? DENSITY_NONE,
    );
    const targetKeys = controlledTargetKeys ?? internalTarget;

    // 两侧各自的选中态(待移动),互不影响;移动后清空对应侧已移走的 key。
    const [selectedLeft, setSelectedLeft] = useState<readonly string[]>(DENSITY_NONE);
    const [selectedRight, setSelectedRight] = useState<readonly string[]>(DENSITY_NONE);

    const { left, right } = useMemo(
      () => splitByTargetKeys(dataSource, targetKeys),
      [dataSource, targetKeys],
    );

    const leftCount = countOf(left, selectedLeft);
    const rightCount = countOf(right, selectedRight);

    const commitMove = useCallback(
      (direction: TransferDirection) => {
        if (disabled) {
          return;
        }
        const selected = direction === 'right' ? selectedLeft : selectedRight;
        const result = moveKeysLogic(dataSource, targetKeys, selected, direction);
        if (result.moveKeys.length === 0) {
          return;
        }
        // 已移走的 key 从对应侧选中态剔除。
        const movedSet = new Set(result.moveKeys);
        if (direction === 'right') {
          setSelectedLeft((prev) => prev.filter((k) => !movedSet.has(k)));
        } else {
          setSelectedRight((prev) => prev.filter((k) => !movedSet.has(k)));
        }
        if (controlledTargetKeys === undefined) {
          setInternalTarget(result.targetKeys);
        }
        onChange?.(result.targetKeys, result.direction, result.moveKeys);
      },
      [
        disabled,
        selectedLeft,
        selectedRight,
        dataSource,
        targetKeys,
        controlledTargetKeys,
        onChange,
      ],
    );

    const moveRight = useCallback(() => commitMove('right'), [commitMove]);
    const moveLeft = useCallback(() => commitMove('left'), [commitMove]);

    // 全选作用域由 Panel 上抛的 affectedKeys 决定(只含当前可见 / 已过滤的可选项),
    // 父组件不再用全量 left/right —— 否则搜索激活时会误选 / 误移被隐藏的项。
    const toggleAll = useCallback(
      (side: 'left' | 'right', checked: boolean, affectedKeys: string[]) => {
        const apply = (prev: readonly string[]) =>
          toggleSelectAllByKeys(prev, affectedKeys, checked);
        if (side === 'left') {
          setSelectedLeft(apply);
        } else {
          setSelectedRight(apply);
        }
      },
      [],
    );

    const toggleKey = useCallback((side: 'left' | 'right', key: string) => {
      if (side === 'left') {
        setSelectedLeft((prev) => toggleSelectedKey(prev, key));
      } else {
        setSelectedRight((prev) => toggleSelectedKey(prev, key));
      }
    }, []);

    // 方向按钮启用条件:对应侧有「可移动(选中且未禁用)」的项,且组件未禁用。
    const canMoveRight =
      !disabled && left.some((item) => !item.disabled && selectedLeft.includes(item.key));
    const canMoveLeft =
      !disabled && right.some((item) => !item.disabled && selectedRight.includes(item.key));

    const searchLabel = t('transfer.search');
    const emptyLabel = t('transfer.empty');
    const leftSelectedText = `${leftCount.checked}/${leftCount.total}`;
    const rightSelectedText = `${rightCount.checked}/${rightCount.total}`;
    // 方向按钮无专属 i18n key,用「已选 X 项 + →/←」复用 transfer.search 之外的现有计数文案语义;
    // 这里直接拼方向箭头以保证 aria-label 自描述(可访问名),避免裸符号缺名。
    const moveRightLabel = `${leftSelectedText} →`;
    const moveLeftLabel = `← ${rightSelectedText}`;

    return (
      <div
        ref={ref}
        className={['ms-transfer', disabled && 'ms-transfer--disabled', className]
          .filter(Boolean)
          .join(' ')}
        data-disabled={disabled || undefined}
        data-one-way={oneWay || undefined}
        {...rest}
      >
        <TransferPanel
          side="left"
          title={titles?.[0]}
          items={left}
          selectedKeys={selectedLeft}
          disabled={disabled}
          showSearch={showSearch}
          render={render}
          filterOption={filterOption}
          classNames={slots}
          searchLabel={searchLabel}
          emptyLabel={emptyLabel}
          selectedText={leftSelectedText}
          onToggleAll={(checked, affectedKeys) => toggleAll('left', checked, affectedKeys)}
          onToggleKey={(key) => toggleKey('left', key)}
        />

        <div className={['ms-transfer__operations', slots.operations].filter(Boolean).join(' ')}>
          <button
            type="button"
            className="ms-transfer__op-button ms-transfer__op-button--right"
            disabled={!canMoveRight}
            aria-disabled={!canMoveRight || undefined}
            aria-label={moveRightLabel}
            onClick={composeEventHandlers(undefined, moveRight)}
          >
            <span aria-hidden="true">→</span>
          </button>
          {!oneWay && (
            <button
              type="button"
              className="ms-transfer__op-button ms-transfer__op-button--left"
              disabled={!canMoveLeft}
              aria-disabled={!canMoveLeft || undefined}
              aria-label={moveLeftLabel}
              onClick={composeEventHandlers(undefined, moveLeft)}
            >
              <span aria-hidden="true">←</span>
            </button>
          )}
        </div>

        <TransferPanel
          side="right"
          title={titles?.[1]}
          items={right}
          selectedKeys={selectedRight}
          disabled={disabled}
          showSearch={showSearch}
          render={render}
          filterOption={filterOption}
          classNames={slots}
          searchLabel={searchLabel}
          emptyLabel={emptyLabel}
          selectedText={rightSelectedText}
          onToggleAll={(checked, affectedKeys) => toggleAll('right', checked, affectedKeys)}
          onToggleKey={(key) => toggleKey('right', key)}
        />
      </div>
    );
  },
);
Transfer.displayName = 'Transfer';
