import { CodeBlock } from '../ui/CodeBlock';

interface EventGroup {
  title: string;
  handler: string;
  desc: string;
  example: string;
  events: [string, string][];
}

// 标准 React DOM 事件(透传原生元素的组件均支持;此处统一文档一次,组件页只引用不重复)。
const GROUPS: EventGroup[] = [
  {
    title: '鼠标 Mouse',
    handler: 'MouseEventHandler<T>',
    desc: '鼠标交互;回调入参 e: React.MouseEvent<T>(含 clientX/Y、button、ctrlKey 等)。',
    example: '<Button onClick={(e) => console.log(e.clientX, e.clientY)} />',
    events: [
      ['onClick', '单击'],
      ['onDoubleClick', '双击'],
      ['onMouseDown', '按下'],
      ['onMouseUp', '抬起'],
      ['onMouseEnter', '移入(不冒泡)'],
      ['onMouseLeave', '移出(不冒泡)'],
      ['onMouseMove', '移动'],
      ['onMouseOver', '移入(冒泡)'],
      ['onMouseOut', '移出(冒泡)'],
      ['onContextMenu', '右键(上下文菜单)'],
    ],
  },
  {
    title: '键盘 Keyboard',
    handler: 'KeyboardEventHandler<T>',
    desc: '键盘交互;回调入参 e: React.KeyboardEvent<T>(含 key、code、altKey/ctrlKey/shiftKey/metaKey)。',
    example: "<Input onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />",
    events: [
      ['onKeyDown', '按下'],
      ['onKeyUp', '抬起'],
      ['onKeyPress', '字符键(已废弃,用 onKeyDown)'],
    ],
  },
  {
    title: '焦点 Focus',
    handler: 'FocusEventHandler<T>',
    desc: '获焦 / 失焦;回调入参 e: React.FocusEvent<T>(含 relatedTarget)。',
    example: '<Input onBlur={(e) => validate(e.target.value)} />',
    events: [
      ['onFocus', '获得焦点'],
      ['onBlur', '失去焦点'],
    ],
  },
  {
    title: '指针 Pointer',
    handler: 'PointerEventHandler<T>',
    desc: '统一鼠标 / 触摸 / 笔的指针事件;回调入参 e: React.PointerEvent<T>(含 pointerType、pressure)。',
    example: '<Slider onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)} />',
    events: [
      ['onPointerDown', '按下'],
      ['onPointerUp', '抬起'],
      ['onPointerMove', '移动'],
      ['onPointerEnter', '移入'],
      ['onPointerLeave', '移出'],
      ['onPointerOver', '移入(冒泡)'],
      ['onPointerOut', '移出(冒泡)'],
      ['onPointerCancel', '取消'],
    ],
  },
  {
    title: '触摸 Touch',
    handler: 'TouchEventHandler<T>',
    desc: '触屏事件;回调入参 e: React.TouchEvent<T>(含 touches、changedTouches)。',
    example: '<Card onTouchStart={(e) => track(e.touches[0])} />',
    events: [
      ['onTouchStart', '触摸开始'],
      ['onTouchMove', '触摸移动'],
      ['onTouchEnd', '触摸结束'],
      ['onTouchCancel', '触摸取消'],
    ],
  },
  {
    title: '滚动 Wheel / Scroll',
    handler: 'WheelEventHandler / UIEventHandler<T>',
    desc: '滚轮与滚动;onWheel 入参 React.WheelEvent(含 deltaX/Y),onScroll 入参 React.UIEvent。',
    example: '<Container onScroll={(e) => setTop(e.currentTarget.scrollTop)} />',
    events: [
      ['onWheel', '滚轮'],
      ['onScroll', '滚动'],
    ],
  },
  {
    title: '剪贴板 Clipboard',
    handler: 'ClipboardEventHandler<T>',
    desc: '复制 / 剪切 / 粘贴;回调入参 e: React.ClipboardEvent<T>(含 clipboardData)。',
    example: '<Input onPaste={(e) => e.clipboardData.getData("text")} />',
    events: [
      ['onCopy', '复制'],
      ['onCut', '剪切'],
      ['onPaste', '粘贴'],
    ],
  },
  {
    title: '输入法 Composition',
    handler: 'CompositionEventHandler<T>',
    desc: '中文 / 日文等输入法组合;回调入参 e: React.CompositionEvent<T>(含 data)。',
    example: '<Input onCompositionEnd={(e) => commit(e.data)} />',
    events: [
      ['onCompositionStart', '组合开始'],
      ['onCompositionUpdate', '组合更新'],
      ['onCompositionEnd', '组合结束'],
    ],
  },
  {
    title: '拖拽 Drag',
    handler: 'DragEventHandler<T>',
    desc: '原生拖放;回调入参 e: React.DragEvent<T>(含 dataTransfer)。',
    example: '<Card draggable onDragStart={(e) => e.dataTransfer.setData("id", id)} />',
    events: [
      ['onDragStart', '开始拖拽'],
      ['onDrag', '拖拽中'],
      ['onDragEnd', '拖拽结束'],
      ['onDragEnter', '进入目标'],
      ['onDragLeave', '离开目标'],
      ['onDragOver', '悬于目标'],
      ['onDrop', '放下'],
    ],
  },
  {
    title: '表单 Form',
    handler: 'FormEventHandler / ChangeEventHandler<T>',
    desc: '表单与值变化;onChange 入参 React.ChangeEvent<T>(从 e.target.value / e.target.checked 取值)。',
    example: '<Input onChange={(e) => setValue(e.target.value)} />',
    events: [
      ['onChange', '值变化'],
      ['onInput', '输入'],
      ['onBeforeInput', '输入前'],
      ['onSubmit', '提交'],
      ['onReset', '重置'],
      ['onInvalid', '校验失败'],
      ['onSelect', '文本选区变化'],
    ],
  },
];

export function CommonEvents() {
  return (
    <article className="sc-view">
      <header className="sc-view__head">
        <div className="sc-view__crumb">参考 Reference</div>
        <h1 className="sc-h1">通用事件 Common Events</h1>
        <p className="sc-summary">
          所有「透传原生元素」的组件(Button / Input / Card / Switch 等)都支持下列标准 React DOM
          事件。此处统一文档一次,组件页只列其专有事件并引用此页。
        </p>
        <p className="sc-desc">
          绑定方式与原生一致:<code>{'onClick={(e) => …}'}</code>。回调入参是 React
          合成事件(SyntheticEvent),用 <code>e.currentTarget</code> 取触发元素、
          <code>e.preventDefault()</code> 阻止默认、<code>e.stopPropagation()</code> 阻止冒泡。
        </p>
      </header>

      {GROUPS.map((g) => (
        <section key={g.title} className="sc-section">
          <h2 className="sc-h2">
            {g.title} · <code className="sc-code-type">{g.handler}</code>
          </h2>
          <p className="sc-desc" style={{ marginBlockStart: 0 }}>
            {g.desc}
          </p>
          <div className="sc-table-wrap">
            <table className="sc-proptable">
              <thead>
                <tr>
                  <th>事件</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                {g.events.map(([name, meaning]) => (
                  <tr key={name}>
                    <td>
                      <code className="sc-code-name">{name}</code>
                    </td>
                    <td>{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginBlockStart: '0.6rem' }}>
            <CodeBlock sources={{ react: g.example }} />
          </div>
        </section>
      ))}
    </article>
  );
}
