import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { useMessages } from '../../i18n';
import { composeEventHandlers } from '../../utils/compose';
import {
  applyMaxCount,
  clampPercent,
  formatFileSize,
  isAccepted,
  nextStatus,
  patchFile,
  removeFile,
  type UploadFile,
  type UploadFileStatus,
  wrapFile,
} from './logic';

export type {
  UploadFile,
  UploadFileStatus,
} from './logic';

export type UploadTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';
export type UploadListType = 'text' | 'picture';

/** customRequest 的回调集合:组件把这些注入,真正的网络层(XHR/fetch)由用户实现并按需调用它们。 */
export interface UploadRequestHandlers {
  /**
   * 报告进度(0–100,内部会夹取)。
   * @param percent 当前上传进度百分比(0–100,超出区间会被内部夹取)。
   */
  onProgress: (percent: number) => void;
  /**
   * 成功:可附带服务端返回的可访问 url 与原始响应。
   * @param payload 成功载荷,可选;`url` 为服务端返回的可访问地址,`response` 为原始响应对象。
   */
  onSuccess: (payload?: { url?: string | undefined; response?: unknown }) => void;
  /**
   * 失败:可附带错误信息(展示用)。
   * @param error 错误信息,可选;含 `message` 字段时取其文案展示,否则忽略。
   */
  onError: (error?: { message?: string | undefined } | unknown) => void;
}

/** customRequest 入参:本条文件的视图模型 + 原始 File + 三个状态回调。 */
export interface UploadRequestOption {
  file: UploadFile;
  /** 原始 File(可能为空:受控注入的既有文件没有 raw)。 */
  raw: File | undefined;
  handlers: UploadRequestHandlers;
}

/** Upload 各部件的细粒度 className 槽位。 */
export interface UploadClassNames {
  /** 拖拽 / 点击触发区。 */
  trigger?: string | undefined;
  /** 触发区主文案。 */
  triggerText?: string | undefined;
  /** 触发区提示文案。 */
  hint?: string | undefined;
  /** 文件列表容器。 */
  list?: string | undefined;
  /** 单条文件项。 */
  item?: string | undefined;
  /** 单条文件名。 */
  itemName?: string | undefined;
  /** 单条进度条轨道。 */
  progress?: string | undefined;
  /** 单条操作按钮区。 */
  actions?: string | undefined;
}

/** 根容器可透传的原生属性(排除被内部接管的键)。 */
type UploadRootProps = Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'children'>;

export interface UploadProps extends UploadRootProps {
  /** 受控文件列表。传入即受控,增删/状态推进只通过 onChange 反映,组件不持有内部副本。 */
  fileList?: UploadFile[] | undefined;
  /** 非受控初始列表。 */
  defaultFileList?: UploadFile[] | undefined;
  /**
   * 列表变化回调(增删、状态/进度推进都会触发,入参为最新整表)。
   * @param fileList 变化后的最新文件整表(含各条最新 status / percent / url)。
   */
  onChange?: (fileList: UploadFile[]) => void;
  /** 允许多选。默认 false。 */
  multiple?: boolean;
  /** 原生 accept 串(逗号分隔扩展名 / MIME / 通配),同时用于客户端过滤。 */
  accept?: string | undefined;
  /** 最大条数(含已有)。超出的新文件被拒。<=0 / 未给视为不限。 */
  maxCount?: number | undefined;
  /** 禁用整个组件。 */
  disabled?: boolean;
  /** 列表形态:文本行 / 图片缩略(picture 用 url 显缩略图)。默认 text。 */
  listType?: UploadListType;
  /** 语义色调,经全库 tone resolver 派生触发区高亮 / 进度发光。默认 primary。 */
  tone?: UploadTone;
  /**
   * 添加前钩子:返回 false 阻止该文件入列;返回新的 File 则替换(如压缩 / 改名);
   * 返回 Promise 同理(异步校验)。不实现网络,只做准入与改写。
   * @param file 当前待准入的单个原始 File。
   * @param fileList 本批次经 accept 过滤后的全部待准入 File 列表(供做批量级校验参考)。
   */
  beforeUpload?: (
    file: File,
    fileList: File[],
  ) => boolean | File | undefined | Promise<boolean | File | undefined>;
  /**
   * 自定义上传实现(可插拔):组件把 file + 三个状态回调交给你,你用 XHR/fetch 真正传,
   * 并在合适时机调用 onProgress / onSuccess / onError。**组件本身不内置任何网络请求**——
   * 不提供 customRequest 时,文件停在 pending(仅做选择/校验/展示)。
   * @param option 单条上传入参,含 `file` 视图模型、原始 `raw` File 与 `handlers`(onProgress/onSuccess/onError 三个状态回调)。
   */
  customRequest?: (option: UploadRequestOption) => void;
  /** 触发区主文案(覆盖 i18n upload.trigger)。 */
  triggerText?: ReactNode;
  /** 触发区提示文案(覆盖 i18n upload.hint)。 */
  hint?: ReactNode;
  /** 触发区自定义内容(完全替换默认图标+文案);受控的拖拽/点击仍由根接管。 */
  children?: ReactNode;
  /**
   * 点击列表项预览图标 / 缩略图时回调(组件不内置 lightbox,交由用户)。
   * @param file 被点击预览的那条文件视图模型。
   */
  onPreview?: (file: UploadFile) => void;
  /**
   * 删除某条时回调(在列表更新之前)。
   * @param file 即将被删除的那条文件视图模型(此时尚未从列表移除)。
   */
  onRemove?: (file: UploadFile) => void;
  /** 各部件细粒度 className 槽位。 */
  classNames?: UploadClassNames | undefined;
}

const STATUS_ICON: Record<UploadFileStatus, string> = {
  pending: '○',
  uploading: '◴',
  done: '✓',
  error: '✕',
  removed: '',
};

/**
 * Upload —— 文件上传(forms 旗舰深度组件)。自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。
 *
 * **编排与传输分离**:组件只负责「选文件 → 准入校验(accept/maxCount/beforeUpload)→ 维护每条
 * status/percent/list 的 UI」;**真正的网络上传由用户的 `customRequest` 提供**(XHR/fetch 自理,
 * 通过注入的 onProgress/onSuccess/onError 把进度与结果回灌组件)。不内置任何 XHR —— 诚实地把传输权交给用户。
 *
 * 能力:拖拽区(dragover 高亮 / dragleave 还原 / drop 收文件)+ 点击触发隐藏 input[type=file];
 * 受控(fileList+onChange)/非受控(defaultFileList);multiple / accept / maxCount / disabled;
 * 每条:名 / 体积 / 进度条 / 状态图标 / 删除 / 失败重试 / 预览;listType text|picture;
 * tone 经全库 resolver 驱动高亮与进度发光;尺寸随 data-ms-density;尊重 reduced-motion / motion=off。
 * 留口:根 spread 透传原生属性、beforeUpload 准入改写、classNames 细粒度槽位、onPreview/onRemove。
 * a11y:触发区 role=button + 键盘 Enter/Space 触发;每条删除/重试/预览按钮带 aria-label。样式见同目录 Upload.css。
 */
export const Upload = forwardRef<HTMLDivElement, UploadProps>(
  (
    {
      fileList: controlledList,
      defaultFileList,
      onChange,
      multiple = false,
      accept,
      maxCount,
      disabled = false,
      listType = 'text',
      tone = 'primary',
      beforeUpload,
      customRequest,
      triggerText,
      hint,
      children,
      onPreview,
      onRemove,
      className,
      classNames,
      // 这些事件取出来与内部 compose,避免末尾 ...rest 覆盖。
      onDragEnter: userOnDragEnter,
      onDragOver: userOnDragOver,
      onDragLeave: userOnDragLeave,
      onDrop: userOnDrop,
      ...rest
    },
    ref,
  ) => {
    const t = useMessages();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [internalList, setInternalList] = useState<UploadFile[]>(defaultFileList ?? []);
    const [dragOver, setDragOver] = useState(false);

    const isControlled = controlledList !== undefined;
    const list = isControlled ? controlledList : internalList;

    // 最新整表用 ref 留存,供 customRequest 的异步回调里基于最新值做局部更新(避免闭包过期)。
    const listRef = useRef<UploadFile[]>(list);
    listRef.current = list;

    // 统一的写表入口:更新内部态(非受控)+ 派发 onChange。所有增删/推进都走这里。
    const commit = useCallback(
      (next: UploadFile[]) => {
        listRef.current = next;
        if (!isControlled) {
          setInternalList(next);
        }
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    // 按 uid 局部 patch 一条(基于 ref 最新值,异步回调安全)。
    const patchByUid = useCallback(
      (uid: string, patch: Partial<UploadFile>) => {
        commit(patchFile(listRef.current, uid, patch));
      },
      [commit],
    );

    // 把一条文件交给 customRequest 真正上传(组件只注入回调 + 管 status/percent)。
    const startRequest = useCallback(
      (item: UploadFile) => {
        if (!customRequest || !item.raw) {
          return;
        }
        patchByUid(item.uid, { status: 'uploading', percent: 0, error: undefined });
        customRequest({
          file: { ...item, status: 'uploading' },
          raw: item.raw,
          handlers: {
            onProgress: (percent) => {
              const cur = listRef.current.find((f) => f.uid === item.uid);
              // 只在 uploading 态接受进度:迟到的 onProgress 不得篡改已终态(done/error)条目。
              if (!cur || cur.status !== 'uploading') {
                return;
              }
              patchByUid(item.uid, { percent: clampPercent(percent) });
            },
            onSuccess: (payload) => {
              const cur = listRef.current.find((f) => f.uid === item.uid);
              if (!cur || cur.status === 'removed') {
                return;
              }
              patchByUid(item.uid, {
                status: nextStatus(cur.status, 'done'),
                percent: 100,
                url: payload?.url,
              });
            },
            onError: (error) => {
              const cur = listRef.current.find((f) => f.uid === item.uid);
              if (!cur || cur.status === 'removed') {
                return;
              }
              const message =
                error && typeof error === 'object' && 'message' in error
                  ? String((error as { message?: unknown }).message ?? '')
                  : undefined;
              patchByUid(item.uid, {
                status: nextStatus(cur.status, 'error'),
                error: message,
              });
            },
          },
        });
      },
      [customRequest, patchByUid],
    );

    // 收一批原生 File:beforeUpload 准入/改写 → accept 过滤 → maxCount 截断 → 入列 → 逐条发起上传。
    const ingest = useCallback(
      async (incoming: File[]) => {
        if (disabled || incoming.length === 0) {
          return;
        }
        // accept 客户端再过滤一道(原生 accept 仅作 UI 提示,可被绕过)。
        const byAccept = incoming.filter((f) => isAccepted(f, accept));

        // beforeUpload 逐个准入:false 丢弃,返回新 File 则替换。
        const admitted: File[] = [];
        for (const file of byAccept) {
          if (beforeUpload) {
            const result = await beforeUpload(file, byAccept);
            if (result === false) {
              continue;
            }
            admitted.push(result instanceof File ? result : file);
          } else {
            admitted.push(file);
          }
        }

        if (admitted.length === 0) {
          return;
        }

        // maxCount:基于已有条数截断(removed 不计入,但 ref 里本就不留 removed 条)。
        const { accepted } = applyMaxCount(listRef.current.length, admitted, maxCount);
        if (accepted.length === 0) {
          return;
        }

        const wrapped = accepted.map((f) => wrapFile(f));
        commit([...listRef.current, ...wrapped]);
        // 有 customRequest 才真正发起;否则停在 pending(仅选择/展示)。
        if (customRequest) {
          for (const item of wrapped) {
            startRequest(item);
          }
        }
      },
      [disabled, accept, beforeUpload, maxCount, commit, customRequest, startRequest],
    );

    const handleInputChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
          void ingest(Array.from(files));
        }
        // 复位 value,允许连续选同一文件再次触发 change。
        event.target.value = '';
      },
      [ingest],
    );

    const openPicker = useCallback(() => {
      if (disabled) {
        return;
      }
      inputRef.current?.click();
    }, [disabled]);

    const handleTriggerKeyDown = useCallback(
      (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (disabled) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPicker();
        }
      },
      [disabled, openPicker],
    );

    // 拖拽:dragover 必须 preventDefault 才能触发 drop;进入高亮、离开还原、drop 收文件。
    const handleDragEnter = useCallback(
      (event: DragEvent<HTMLDivElement>) => {
        if (disabled) {
          return;
        }
        event.preventDefault();
        setDragOver(true);
      },
      [disabled],
    );

    const handleDragOver = useCallback(
      (event: DragEvent<HTMLDivElement>) => {
        if (disabled) {
          return;
        }
        event.preventDefault();
        setDragOver(true);
      },
      [disabled],
    );

    const handleDragLeave = useCallback(
      (event: DragEvent<HTMLDivElement>) => {
        if (disabled) {
          return;
        }
        // 仅当真正离开触发区(而非进入子元素)才还原。
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
          return;
        }
        setDragOver(false);
      },
      [disabled],
    );

    const handleDrop = useCallback(
      (event: DragEvent<HTMLDivElement>) => {
        if (disabled) {
          return;
        }
        event.preventDefault();
        setDragOver(false);
        const dropped = event.dataTransfer?.files;
        if (dropped && dropped.length > 0) {
          // 非 multiple 时只取第一个。
          const files = Array.from(dropped);
          void ingest(multiple ? files : files.slice(0, 1));
        }
      },
      [disabled, multiple, ingest],
    );

    const handleRemove = useCallback(
      (item: UploadFile) => {
        if (disabled) {
          return;
        }
        onRemove?.(item);
        commit(removeFile(listRef.current, item.uid));
      },
      [disabled, onRemove, commit],
    );

    const handleRetry = useCallback(
      (item: UploadFile) => {
        if (disabled) {
          return;
        }
        startRequest(item);
      },
      [disabled, startRequest],
    );

    const reachedMax = maxCount !== undefined && maxCount > 0 ? list.length >= maxCount : false;
    const triggerDisabled = disabled || reachedMax;

    const rootClassName = [
      'ms-upload',
      `ms-upload--${listType}`,
      `ms-tone-${tone}`,
      disabled && 'ms-upload--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const triggerClassName = [
      'ms-upload__trigger',
      dragOver && 'ms-upload__trigger--dragover',
      triggerDisabled && 'ms-upload__trigger--disabled',
      classNames?.trigger,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={rootClassName} data-ms-listtype={listType} {...rest}>
        {/* 隐藏的原生 input:点击触发区 / 拖拽收文件后由它接管选择语义(multiple/accept 直接复用原生) */}
        <input
          ref={inputRef}
          type="file"
          className="ms-upload__input"
          multiple={multiple}
          accept={accept}
          disabled={triggerDisabled}
          onChange={handleInputChange}
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* 拖拽 / 点击触发区:role=button 语义 + 键盘 Enter/Space;拖拽事件 compose 用户处理器 */}
        {/* biome-ignore lint/a11y/useSemanticElements: 触发区内含进度/缩略等非按钮内容,用 role=button 而非 <button> 以免嵌套交互元素 */}
        <div
          className={triggerClassName}
          role="button"
          tabIndex={triggerDisabled ? -1 : 0}
          aria-disabled={triggerDisabled || undefined}
          data-dragover={dragOver || undefined}
          onClick={openPicker}
          onKeyDown={handleTriggerKeyDown}
          onDragEnter={composeEventHandlers(userOnDragEnter, handleDragEnter)}
          onDragOver={composeEventHandlers(userOnDragOver, handleDragOver)}
          onDragLeave={composeEventHandlers(userOnDragLeave, handleDragLeave)}
          onDrop={composeEventHandlers(userOnDrop, handleDrop)}
        >
          {children ?? (
            <>
              <span className="ms-upload__trigger-icon" aria-hidden="true">
                ⤒
              </span>
              <span
                className={['ms-upload__trigger-text', classNames?.triggerText]
                  .filter(Boolean)
                  .join(' ')}
              >
                {triggerText ?? t('upload.trigger')}
              </span>
              <span className={['ms-upload__hint', classNames?.hint].filter(Boolean).join(' ')}>
                {hint ?? t('upload.hint')}
              </span>
            </>
          )}
        </div>

        {list.length > 0 && (
          <ul className={['ms-upload__list', classNames?.list].filter(Boolean).join(' ')}>
            {list.map((item) => {
              const itemClassName = [
                'ms-upload__item',
                `ms-upload__item--${item.status}`,
                classNames?.item,
              ]
                .filter(Boolean)
                .join(' ');
              const isUploading = item.status === 'uploading';
              const isError = item.status === 'error';
              const canPreview = onPreview && (item.url || item.status === 'done');
              return (
                <li key={item.uid} className={itemClassName} data-status={item.status}>
                  {/* picture 列表:有 url 显缩略,否则显占位图标 */}
                  {listType === 'picture' && (
                    <span className="ms-upload__thumb" aria-hidden={canPreview ? undefined : true}>
                      {item.url ? (
                        <img src={item.url} alt="" className="ms-upload__thumb-img" />
                      ) : (
                        <span className="ms-upload__thumb-placeholder">🖼</span>
                      )}
                    </span>
                  )}

                  <span className="ms-upload__item-main">
                    <span
                      className={['ms-upload__item-name', classNames?.itemName]
                        .filter(Boolean)
                        .join(' ')}
                      title={item.name}
                    >
                      <span
                        className={`ms-upload__status-icon ms-upload__status-icon--${item.status}`}
                        aria-hidden="true"
                      >
                        {STATUS_ICON[item.status]}
                      </span>
                      {canPreview ? (
                        <button
                          type="button"
                          className="ms-upload__name-btn"
                          onClick={() => onPreview?.(item)}
                          aria-label={`${t('upload.preview')} ${item.name}`}
                        >
                          {item.name}
                        </button>
                      ) : (
                        <span className="ms-upload__name-text">{item.name}</span>
                      )}
                    </span>

                    <span className="ms-upload__item-meta">
                      {isUploading
                        ? `${t('upload.uploading')} ${item.percent}%`
                        : formatFileSize(item.size)}
                    </span>

                    {/* 进度条:仅上传中 / 失败时占位(失败显满轨红) */}
                    {(isUploading || isError) && (
                      <span
                        className={['ms-upload__progress', classNames?.progress]
                          .filter(Boolean)
                          .join(' ')}
                        role="progressbar"
                        aria-valuenow={item.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <span
                          className="ms-upload__progress-bar"
                          style={{ inlineSize: `${item.percent}%` }}
                        />
                      </span>
                    )}
                  </span>

                  <span
                    className={['ms-upload__actions', classNames?.actions]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {/* 重试仅在有 raw 且有 customRequest 时渲染:否则 startRequest 会因 !item.raw 静默 return = 死按钮。 */}
                    {isError && item.raw && customRequest && (
                      <button
                        type="button"
                        className="ms-upload__action ms-upload__action--retry"
                        onClick={() => handleRetry(item)}
                        disabled={disabled}
                        aria-label={`${t('upload.retry')} ${item.name}`}
                      >
                        ↻
                      </button>
                    )}
                    <button
                      type="button"
                      className="ms-upload__action ms-upload__action--remove"
                      onClick={() => handleRemove(item)}
                      disabled={disabled}
                      aria-label={`${t('upload.remove')} ${item.name}`}
                    >
                      ✕
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  },
);
Upload.displayName = 'Upload';
