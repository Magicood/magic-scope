import type {
  ComponentPropsWithoutRef,
  ClipboardEvent as ReactClipboardEvent,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefCallback,
} from 'react';
import { Fragment, forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import { addMany, type CanAddOptions, canAdd, splitByDelimiters, toTagArray } from './logic';

export type TagInputSize = 'sm' | 'md' | 'lg';
export type TagInputTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/** 子部件类名插槽:细粒度定制每个内部元素。 */
export interface TagInputClassNames {
  /** 标签换行 / 排布区(<div>)。 */
  list?: string;
  /** 单个标签芯片(<span>)。 */
  tag?: string;
  /** 标签文字(<span>)。 */
  tagLabel?: string;
  /** 标签内移除按钮(<button>)。 */
  remove?: string;
  /** 文本输入框(<input>)。 */
  input?: string;
  /** 末尾清空全部按钮(<button>)。 */
  clear?: string;
}

/** renderTag 的渲染上下文(留口:完全自绘标签时拿到的全部信息与操作)。 */
export interface RenderTagContext {
  /** 标签文本。 */
  value: string;
  /** 在当前标签数组中的下标。 */
  index: number;
  /** 组件是否禁用(自绘时据此关掉交互)。 */
  disabled: boolean;
  /** 默认的「移除该标签的 aria-label」(已走 i18n tag.remove)。 */
  removeLabel: string;
  /** 移除该标签(组件已绑定下标,自绘时直接调用即可)。 */
  onRemove: () => void;
  /**
   * 把自绘标签里「可聚焦的元素」接进组件的标签焦点环。
   * 想让 ←/→/Backspace 标签键盘导航在 renderTag 模式下也生效,
   * 就把这个 ref 挂到你的可聚焦节点(如自绘的移除按钮)上;不挂则该标签不参与键盘导航。
   */
  ref: RefCallback<HTMLElement | null>;
}

export interface TagInputProps
  extends Omit<
    ComponentPropsWithoutRef<'div'>,
    'onChange' | 'defaultValue' | 'children' | 'onSelect'
  > {
  /** 受控值(string[])。传入即受控,配合 onChange。 */
  value?: readonly string[] | undefined;
  /** 初始值(非受控)。 */
  defaultValue?: readonly string[] | undefined;
  /**
   * 标签数组变化(增 / 删 / 编辑后)的核心回调(受控 / 非受控双通道)。
   * @param value 变化后的完整标签数组。
   */
  onChange?: ((value: string[]) => void) | undefined;
  /**
   * 分隔符:命中即把当前输入转成标签。可传单字符 / 多字符 / 数组。默认逗号 `,`(回车始终生效,无需配置)。
   * 也用于粘贴时一次性切分多标签。
   *
   * 键入触发:单字符分隔符走 keydown 即时命中;多字符分隔符(如 `'::'`)无法在 keydown 命中
   * (键盘事件的 key 永远是单字符),改由「检测 draft 末尾后缀」在 onChange 时命中并切分。
   * 两者最终行为一致;粘贴路径(splitByDelimiters)对单/多字符分隔符一视同仁。
   */
  delimiter?: string | readonly string[] | undefined;
  /** 标签数量上限。达到后停止新增(并对输入框设只读语义)。undefined 表不限。 */
  maxTags?: number | undefined;
  /** 是否允许重复标签。默认 false(去重,大小写不敏感)。 */
  allowDuplicates?: boolean | undefined;
  /** 去重是否大小写敏感。默认 false。 */
  caseSensitive?: boolean | undefined;
  /**
   * 业务校验:返回 false(或抛错)则拒绝加入。规整(trim)后的候选标签入参。
   * @param tag 规整后的候选标签文本。
   */
  validate?: ((tag: string) => boolean) | undefined;
  /** 禁用:不可输入 / 增删 / 聚焦,染禁用态。 */
  disabled?: boolean | undefined;
  /** 输入框占位符(无标签且输入为空时可见)。 */
  placeholder?: string | undefined;
  /** 尺寸(随 data-ms-density 缩放)。默认 md。 */
  size?: TagInputSize | undefined;
  /** 校验失败态:染 danger 发光环并设 aria-invalid(供 Form)。 */
  invalid?: boolean | undefined;
  /** 聚焦发光环色调;invalid 时强制 danger。默认 primary。 */
  tone?: TagInputTone | undefined;
  /** 失焦时把残留输入提交为标签。默认 false。 */
  addOnBlur?: boolean | undefined;
  /** 双击标签可改写其文本(回填到输入框,确认后替换原标签)。默认 false。 */
  editable?: boolean | undefined;
  /** 有标签时在末尾显示「清空全部」按钮(复用 input.clear 文案)。默认 false。 */
  clearable?: boolean | undefined;
  /**
   * 自定义渲染每个标签(留口:完全接管标签外观;不传走内置芯片)。
   * 组件已负责列表项 key,无需在返回节点上自写 key。
   * 想让 ←/→/Backspace 标签键盘导航在自绘模式下也生效,需把 `context.ref` 挂到你的可聚焦元素上
   * (不挂则该标签不参与键盘导航 —— 这是 renderTag 模式下的已知契约)。
   */
  renderTag?: ((context: RenderTagContext) => ReactNode) | undefined;
  /** 子部件类名插槽。 */
  classNames?: TagInputClassNames | undefined;
  /** 内层文本输入框的额外属性透传(如 name / inputMode / autoComplete);其受控值 / onChange 由组件接管。 */
  inputProps?: Omit<
    ComponentPropsWithoutRef<'input'>,
    'value' | 'onChange' | 'disabled' | 'placeholder' | 'size' | 'className' | 'ref'
  >;
  /**
   * 任一标签被移除时触发(在内部状态更新之前)。
   * @param value 被移除标签的文本。
   * @param index 被移除标签的下标。
   */
  onRemoveTag?: ((value: string, index: number) => void) | undefined;
  /**
   * 新增标签被拒时触发(超限 / 重复 / 校验失败 / 空)。
   * @param tag 规整后的被拒标签文本。
   * @param reason 拒绝原因:empty / max / duplicate / invalid。
   */
  onReject?: ((tag: string, reason: 'empty' | 'max' | 'duplicate' | 'invalid') => void) | undefined;
}

/** 把 delimiter prop 规整为字符串数组;空 / 未传回退仅逗号。回车在键盘处理里单独硬编码,无需配置。 */
function resolveDelimiters(delimiter: TagInputProps['delimiter']): string[] {
  if (delimiter === undefined) {
    return [','];
  }
  const arr = Array.isArray(delimiter) ? delimiter : [delimiter];
  const seps = (arr as string[]).filter((d) => typeof d === 'string' && d.length > 0);
  return seps.length > 0 ? seps : [','];
}

/**
 * TagInput —— 标签 / 令牌输入(forms,生产级深度)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * 深度:
 * - 受控(value + onChange)/ 非受控(defaultValue)双模式;回车 / 自定义 delimiter 把当前输入转标签;
 *   空输入按 Backspace 删尾;粘贴含分隔符的串一次性切分多标签;←→ 在标签间移动焦点。
 * - 约束:maxTags 上限、allowDuplicates(默认去重,大小写不敏感,可配 caseSensitive)、validate 业务校验,被拒走 onReject。
 * - editable(双击改写)、addOnBlur(失焦提交残留输入)、clearable(末尾清空全部)、renderTag 完全自绘留口。
 * - tone 聚焦发光环(invalid → danger + aria-invalid 供 Form);尺寸随密度 data-ms-density 缩放。
 *
 * 可达性:外层 role="group" + 输入框 role="combobox";每个标签移除按钮 aria-label 走 i18n tag.remove;
 * 多标签换行不撑破容器;尊重 prefers-reduced-motion 与 [data-ms-motion=off]。
 * 可抽取纯逻辑(normalizeTag / splitByDelimiters / canAdd…)在同目录 logic.ts。
 * 样式见同目录 TagInput.css,需引入 @magic-scope/react/styles.css。
 */
export const TagInput = forwardRef<HTMLDivElement, TagInputProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onChange,
      delimiter,
      maxTags,
      allowDuplicates = false,
      caseSensitive = false,
      validate,
      disabled = false,
      placeholder,
      size = 'md',
      invalid = false,
      tone = 'primary',
      addOnBlur = false,
      editable = false,
      clearable = false,
      renderTag,
      classNames,
      className,
      inputProps,
      onRemoveTag,
      onReject,
      onClick,
      onKeyDown: userOnKeyDown,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const tagRefs = useRef<Array<HTMLElement | null>>([]);

    const isControlled = controlledValue !== undefined;
    const [uncontrolled, setUncontrolled] = useState<string[]>(() => toTagArray(defaultValue));
    const tags = isControlled ? toTagArray(controlledValue) : uncontrolled;

    // 当前输入框文本(始终内部受控,与标签数组解耦)。
    const [draft, setDraft] = useState('');
    // editable:正在编辑的标签下标(-1 表无)。确认编辑时替换该下标的标签。
    const [editingIndex, setEditingIndex] = useState(-1);

    // 稳定化 delimiters:作为 useCallback 依赖,需引用稳定才不每帧让处理器失效。
    // delimiterKey 把数组拍平成字符串做依赖,避免每帧重算/新引用。
    const delimiterKey = Array.isArray(delimiter) ? delimiter.join(' ') : (delimiter ?? '');
    // biome-ignore lint/correctness/useExhaustiveDependencies: 用 delimiterKey 代理 delimiter 的内容相等性,避免数组字面量每帧换引用
    const delimiters = useMemo(() => resolveDelimiters(delimiter), [delimiterKey]);
    // 键入路径只能命中单字符分隔符(keydown 的 e.key 永远是单字符/具名键);
    // 多字符分隔符在键入路径靠「检测 draft 末尾后缀」单独处理(见 internalKeyDown)。
    const singleCharDelimiters = useMemo(
      () => delimiters.filter((d) => d.length === 1),
      [delimiters],
    );
    const multiCharDelimiters = useMemo(() => delimiters.filter((d) => d.length > 1), [delimiters]);
    // 稳定化:canAdd / addMany 的选项对象作为 useCallback 依赖,需引用稳定才不每帧失效。
    const addOptions = useMemo<CanAddOptions>(
      () => ({
        maxTags,
        allowDuplicates,
        caseSensitive,
        ...(validate ? { validate } : {}),
      }),
      [maxTags, allowDuplicates, caseSensitive, validate],
    );
    const reachedMax = maxTags !== undefined && tags.length >= maxTags;

    const commit = useCallback(
      (next: string[]) => {
        if (!isControlled) {
          setUncontrolled(next);
        }
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    // 把一个候选文本尝试加入;editingIndex 有效时改为「替换该下标」(去重需排除自身)。返回是否成功。
    const addTag = useCallback(
      (raw: string): boolean => {
        const tag = raw.trim();
        if (editingIndex >= 0) {
          // 编辑提交:把目标位先抽出,对剩余数组校验,通过则原位写回。
          const without = tags.filter((_, i) => i !== editingIndex);
          const result = canAdd(without, tag, addOptions);
          if (!result.ok) {
            onReject?.(tag, result.reason);
            return false;
          }
          const next = [...tags];
          next[editingIndex] = tag;
          commit(next);
          setEditingIndex(-1);
          return true;
        }
        const result = canAdd(tags, tag, addOptions);
        if (!result.ok) {
          onReject?.(tag, result.reason);
          return false;
        }
        commit([...tags, tag]);
        return true;
      },
      [tags, editingIndex, addOptions, commit, onReject],
    );

    const removeAt = useCallback(
      (index: number) => {
        const target = tags[index];
        if (target === undefined) {
          return;
        }
        onRemoveTag?.(target, index);
        commit(tags.filter((_, i) => i !== index));
        // 删除后把焦点交还输入框,避免焦点丢到 body。
        inputRef.current?.focus();
      },
      [tags, commit, onRemoveTag],
    );

    const clearAll = useCallback(() => {
      if (tags.length === 0) {
        return;
      }
      commit([]);
      setEditingIndex(-1);
      inputRef.current?.focus();
    }, [tags.length, commit]);

    // 双击标签进入编辑:把该标签文本回填输入框、聚焦、记录下标。
    const beginEdit = useCallback(
      (index: number) => {
        if (!editable || disabled) {
          return;
        }
        const target = tags[index];
        if (target === undefined) {
          return;
        }
        setEditingIndex(index);
        setDraft(target);
        // 聚焦输入框并把光标移到末尾(下一帧 DOM 已更新 value)。
        requestAnimationFrame(() => {
          const el = inputRef.current;
          if (el) {
            el.focus();
            const len = el.value.length;
            el.setSelectionRange(len, len);
          }
        });
      },
      [editable, disabled, tags],
    );

    const internalKeyDown = useCallback(
      (e: ReactKeyboardEvent<HTMLInputElement>) => {
        // IME 组合输入中的 Enter / 分隔键不算提交(中文/日文等选词确认会发 Enter):
        // 复用全库范式(见 Textarea/logic.ts detectSubmitIntent),组合态直接放行不拦截。
        if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) {
          return;
        }

        const el = e.currentTarget;
        const atStart = el.selectionStart === 0 && el.selectionEnd === 0;

        // 回车 / 单字符分隔键:提交当前输入为标签。
        // 注:keydown 的 e.key 永远是单字符或具名键,只有单字符分隔符能在此命中;
        // 多字符分隔符的键入触发在下方按「draft 末尾后缀」检测。
        if (e.key === 'Enter' || singleCharDelimiters.includes(e.key)) {
          e.preventDefault();
          if (draft.trim() !== '' && addTag(draft)) {
            setDraft('');
          }
          return;
        }

        // 空输入 Backspace:删最后一个标签(若正在编辑则取消编辑)。
        if (e.key === 'Backspace' && draft === '') {
          if (editingIndex >= 0) {
            setEditingIndex(-1);
            return;
          }
          if (tags.length > 0) {
            e.preventDefault();
            removeAt(tags.length - 1);
          }
          return;
        }

        // 光标在最前 + ←:把焦点移到最后一个标签的移除按钮(进入标签导航)。
        if (e.key === 'ArrowLeft' && atStart && tags.length > 0 && editingIndex < 0) {
          e.preventDefault();
          tagRefs.current[tags.length - 1]?.focus();
          return;
        }

        // Escape:取消编辑态并清空草稿。
        if (e.key === 'Escape' && editingIndex >= 0) {
          e.preventDefault();
          setEditingIndex(-1);
          setDraft('');
        }
      },
      [draft, singleCharDelimiters, addTag, editingIndex, tags.length, removeAt],
    );

    // 键入路径多字符分隔符:onChange 时检测 draft 末尾是否命中某个多字符分隔符,
    // 命中则按分隔符切出前段提交为标签、把残余(分隔符之后)留在输入框。
    // (单字符分隔符仍走 keydown;此处只补多字符这条 keydown 命中不了的路径。)
    const handleInputChange = useCallback(
      (next: string) => {
        if (multiCharDelimiters.length === 0) {
          setDraft(next);
          return;
        }
        const hit = multiCharDelimiters.find((d) => next.endsWith(d));
        if (!hit) {
          setDraft(next);
          return;
        }
        const candidate = next.slice(0, next.length - hit.length);
        if (candidate.trim() !== '' && addTag(candidate)) {
          setDraft('');
        } else {
          // 提交失败(空/被拒)则把分隔符去掉、保留用户已打的文本,不吞内容。
          setDraft(candidate);
        }
      },
      [multiCharDelimiters, addTag],
    );

    // 标签移除按钮上的 ←→:在标签间移动;→ 到尾则回输入框;Backspace/Delete 删当前。
    const onTagKeyDown = useCallback(
      (e: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (index > 0) {
            tagRefs.current[index - 1]?.focus();
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (index < tags.length - 1) {
            tagRefs.current[index + 1]?.focus();
          } else {
            inputRef.current?.focus();
          }
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          // 删当前标签后,焦点落到前一个标签或回输入框(removeAt 已聚焦输入框)。
          const fallback = index > 0 ? index - 1 : -1;
          removeAt(index);
          if (fallback >= 0) {
            requestAnimationFrame(() => tagRefs.current[fallback]?.focus());
          }
        }
      },
      [tags.length, removeAt],
    );

    const handlePaste = useCallback(
      (e: ReactClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text');
        // 仅当粘贴内容含分隔符时才接管(否则放行,让用户正常粘贴单段文本继续编辑)。
        if (!delimiters.some((d) => text.includes(d))) {
          return;
        }
        e.preventDefault();
        const candidates = splitByDelimiters(text, delimiters);
        if (candidates.length === 0) {
          return;
        }
        const next = addMany(tags, candidates, addOptions);
        if (next.length !== tags.length) {
          commit(next);
          // 仅在确有新增时才清空草稿:粘贴被全部去重/超限拒掉时,
          // 不吞掉用户正在编辑的 draft(避免「既没加标签又丢了草稿」)。
          setDraft('');
        }
      },
      [delimiters, tags, addOptions, commit],
    );

    const handleBlur = useCallback(
      (e: ReactFocusEvent<HTMLInputElement>) => {
        if (!addOnBlur || draft.trim() === '') {
          return;
        }
        // 焦点仍在组件内部(如点了某个标签删除钮)则不提交,避免误触。
        const nextFocus = e.relatedTarget as Node | null;
        if (nextFocus && e.currentTarget.closest('.ms-tag-input')?.contains(nextFocus)) {
          return;
        }
        if (addTag(draft)) {
          setDraft('');
        }
      },
      [addOnBlur, draft, addTag],
    );

    // 点击组件空白处 / 标签排布区把焦点导向输入框(点标签 / 按钮各自处理,不导流)。
    const handleRootClick = composeEventHandlers(
      onClick as ((e: ReactMouseEvent<HTMLDivElement>) => void) | undefined,
      (e) => {
        if (disabled) {
          return;
        }
        const target = e.target as HTMLElement;
        if (target === e.currentTarget || target.classList.contains('ms-tag-input__list')) {
          inputRef.current?.focus();
        }
      },
    );

    const tn = invalid ? 'danger' : tone;
    const rootClassName = [
      'ms-tag-input',
      `ms-tag-input--${size}`,
      `ms-tone-${tn}`,
      invalid && 'ms-tag-input--invalid',
      disabled && 'ms-tag-input--disabled',
      reachedMax && 'ms-tag-input--full',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const removeLabel = t('tag.remove', undefined, '移除');
    const showClear = clearable && tags.length > 0 && !disabled;

    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: 点击空白仅把焦点导向真实可聚焦输入框,键盘用户本就直达输入框,无需重复键盘处理器
      // biome-ignore lint/a11y/useSemanticElements: 标签输入是控件分组(非表单 fieldset),role="group" 是正确的 ARIA;内部含真实 input/button
      <div
        ref={ref}
        role="group"
        aria-disabled={disabled || undefined}
        className={rootClassName}
        onClick={handleRootClick}
        {...rest}
      >
        <div className={['ms-tag-input__list', classNames?.list].filter(Boolean).join(' ')}>
          {tags.map((tag, index) => {
            // key 不用 index:用「文本 + 该文本在数组中的第几次出现」做稳定标识。
            // 重复值(allowDuplicates)各得不同序号;尾部增删时已存项 key 不变,不丢内部状态 / 不触发无谓重挂。
            const occurrence = tags.slice(0, index).filter((other) => other === tag).length;
            const tagKey = `${tag}#${occurrence}`;
            if (renderTag) {
              // 列表项的 key 由产出 .map() 的一方(组件)负责,不甩给用户:
              // 用 Fragment 包裹并附上与内置芯片同源的稳定 key。
              // ref 下放给用户接可聚焦元素(见 RenderTagContext.ref),接上后才参与 ←/→ 标签键盘导航。
              return (
                <Fragment key={tagKey}>
                  {renderTag({
                    value: tag,
                    index,
                    disabled,
                    removeLabel,
                    onRemove: () => removeAt(index),
                    ref: (node) => {
                      tagRefs.current[index] = node;
                    },
                  })}
                </Fragment>
              );
            }
            const isEditing = editingIndex === index;
            const tagClassName = [
              'ms-tag-input__tag',
              isEditing && 'ms-tag-input__tag--editing',
              classNames?.tag,
            ]
              .filter(Boolean)
              .join(' ');
            return (
              // biome-ignore lint/a11y/noStaticElementInteractions: onDoubleClick 仅是「双击改写」的鼠标增强,核心增删走内部真实 button + 输入框键盘;span 不承载主交互
              <span
                key={tagKey}
                className={tagClassName}
                data-tag-index={index}
                onDoubleClick={editable && !disabled ? () => beginEdit(index) : undefined}
              >
                <span
                  className={['ms-tag-input__tag-label', classNames?.tagLabel]
                    .filter(Boolean)
                    .join(' ')}
                  title={tag}
                >
                  {tag}
                </span>
                <button
                  type="button"
                  ref={(node) => {
                    tagRefs.current[index] = node;
                  }}
                  className={['ms-tag-input__remove', classNames?.remove].filter(Boolean).join(' ')}
                  aria-label={`${removeLabel}: ${tag}`}
                  tabIndex={-1}
                  disabled={disabled}
                  onClick={() => removeAt(index)}
                  onKeyDown={(e) => onTagKeyDown(e, index)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </span>
            );
          })}
          <input
            ref={inputRef}
            type="text"
            // combobox 语义:标签输入是「可编辑 + 可能候选」型控件;此实现无内置弹层故 aria-expanded=false。
            role="combobox"
            aria-expanded={false}
            aria-invalid={invalid || undefined}
            aria-disabled={disabled || undefined}
            className={['ms-tag-input__input', classNames?.input].filter(Boolean).join(' ')}
            value={draft}
            placeholder={tags.length === 0 || editingIndex >= 0 ? placeholder : ''}
            disabled={disabled}
            // 达上限且非编辑态时只读(仍可聚焦 / Backspace 删尾,但不能键入触发新增)
            readOnly={reachedMax && editingIndex < 0}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={composeEventHandlers(
              userOnKeyDown as ((e: ReactKeyboardEvent<HTMLInputElement>) => void) | undefined,
              internalKeyDown,
            )}
            onPaste={handlePaste}
            onBlur={handleBlur}
            {...inputProps}
          />
        </div>
        {showClear && (
          <button
            type="button"
            className={['ms-tag-input__clear', classNames?.clear].filter(Boolean).join(' ')}
            aria-label={t('input.clear')}
            onClick={clearAll}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    );
  },
);
TagInput.displayName = 'TagInput';
