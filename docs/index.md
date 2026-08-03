# magic-scope

可发布到 npm 的多框架 UI 组件库 + 自动化收录流水线。主题:**魔法**(深色奥术为默认预设)。

设计语言与地基蓝图见仓库 `DESIGN.md`,背景与路线图见 `FOUNDATION.md`。

库内已收录 **94** 个组件,每个组件一页:描述、从真实 TS 类型抽取的 props 表、溯源档案,其中 35 个附静态预览。**完整交互演示以 [展示站](https://magicood.github.io/magic-scope/) 为准**——参数旋钮实时改组件、逛主题画廊、一键切换主题 / 密度 / 动效 / 光影。

## 操作 Actions

触发动作 · 4 个

| 组件 | 简介 |
| --- | --- |
| [Button](/components/button) | 主操作按钮,五种视觉变体与三档尺寸,solid 带发光。 |
| [CopyButton](/components/copy-button) | 复制按钮,点击写入剪贴板并进入「已复制」反馈态(图标切对勾 + 可选 Tooltip),超时自动还原。 |
| [Toggle](/components/toggle) | 双态切换按钮,用 aria-pressed 表达按下 / 未按下,典型用于工具栏里的图标按钮(加粗 / 斜体 / 静音)。 |
| [Toolbar](/components/toolbar) | role=toolbar + roving tabindex 的复合动作容器,聚合按钮 / 链接 / 分隔 / 分组 / 单多选切换组,一组只占一个 Tab 位、方向键在项间移焦。 |

## 文字排版 Typography

文字与排印 · 10 个

| 组件 | 简介 |
| --- | --- |
| [Kbd](/components/kbd) | 键盘按键样式,展示快捷键如 ⌘K、Ctrl + C,带键帽立体感。 |
| [Blockquote](/components/blockquote) | 块级引用,四种视觉变体 × 语义色调 × 三档尺寸,带出处槽与装饰大引号、渐变强调条/光晕。 |
| [Code](/components/code) | 代码原语,行内随文流式 / 块级 pre,四变体 × 七 tone,块级带复制与行号。 |
| [Heading](/components/heading) | 语义标题 h1–h6,视觉与语义解耦(level 定标签、variant 定视觉),渐变/光晕/anchor。 |
| [Link](/components/link) | 内联超链接,下划线四态、tone 着色、外链一键安全化与禁用模拟。 |
| [List](/components/list) | 列表排版,无序 / 有序 / 描述三态,原生与自定义标记、tone 着色与光晕效果一把收口。 |
| [Mark](/components/mark) | 文本高亮:把命中搜索词的片段包进语义化 &lt;mark&gt;,着色走 tone 槽位。 |
| [Paragraph](/components/paragraph) | 块级正文段落,围绕 &lt;p&gt; 的生产级排版原语:size/leading/tone/dimmed/align,多行省略与一键复制。 |
| [Prose](/components/prose) | 富文本 / HTML 内容容器排版,一键给整块 markdown/CMS 内容套上全库排版规范。 |
| [Text](/components/text) | 文字排版旗舰原语,多态 as,全字号/字重/字距,渐变/光晕/描边与入场动效。 |

## 布局 Layout

容器与分隔 · 12 个

| 组件 | 简介 |
| --- | --- |
| [Card](/components/card) | 内容卡片容器,elevated(底+柔影)与 outline(描边)两种变体,可选 interactive 上浮发光。 |
| [Divider](/components/divider) | 分隔线,语义 &lt;hr&gt;(隐含 separator role),支持水平 / 垂直两种朝向。 |
| [AspectRatio](/components/aspect-ratio) | 宽高比盒,用 CSS aspect-ratio 维持任意比例,子媒体绝对铺满并可裁剪。 |
| [Center](/components/center) | 居中盒,把子内容在水平 / 垂直 / 双轴上居中,支持多态根标签与响应式。 |
| [Container](/components/container) | 居中定宽容器,限宽 + 水平居中 + 响应式内边距,把页面骨架一把收口。 |
| [Flex](/components/flex) | 通用 flexbox 布局原语,direction/align/justify/wrap/gap 全经 CSS 变量驱动,支持断点对象响应式。 |
| [Grid](/components/grid) | CSS Grid 布局原语,columns/gap/对齐全经 CSS 变量驱动,支持 minChildWidth 自适应列、容器查询与断点对象响应式。 |
| [ScrollArea](/components/scroll-area) | 自定义滚动区,原生 overflow 滚动 + 自绘 track / thumb 叠在内容上不占布局,几何与原生 scrollTop / scrollHeight 实时同步。 |
| [Splitter](/components/splitter) | 可拖拽分栏布局,拖中缝实时调占比,夹 min/max 且总和守恒,键盘可达、可折叠。 |
| [Stack](/components/stack) | 一维堆叠原语,纵/横向 + 间距 token + 对齐 + 分布 + 换行,全部支持断点响应式。 |
| [VisuallyHidden](/components/visually-hidden) | 无障碍隐藏原语:内容对视觉隐身、却仍留在无障碍树里供屏幕阅读器朗读;支持 focusable 的 skip-link 聚焦还原。 |
| [Watermark](/components/watermark) | 在任意内容上平铺旋转的文字 / 图片水印,pointer-events:none 绝不挡下层交互。 |

## 表单 Forms

录入与选择 · 22 个

| 组件 | 简介 |
| --- | --- |
| [Input](/components/input) | 文本输入框,三档尺寸,带聚焦发光与校验失败态。 |
| [Textarea](/components/textarea) | 多行文本输入框,三档尺寸 + 校验失败态,透传原生 textarea。 |
| [Label](/components/label) | 表单标签,基于原生 &lt;label&gt;;htmlFor 关联控件,required 时文末追加装饰星号。 |
| [Checkbox](/components/checkbox) | 复选框,基于原生 input&#91;type=checkbox],checked 染主色画对勾、支持半选态。 |
| [Switch](/components/switch) | 开关,基于原生 input&#91;type=checkbox],checked 时轨道染 primary、滑块右移并发光。 |
| [Radio](/components/radio) | 单选组,基于原生 input&#91;type=radio],方向键导航与 roving tabindex 开箱即用。 |
| [Select](/components/select) | 下拉选择,Popover API + CSS Anchor Positioning,键盘全可达。 |
| [Slider](/components/slider) | 滑块,基于原生 input&#91;type=range],自绘轨道 / 填充 / 发光滑块。 |
| [NumberInput](/components/number-input) | 数字步进输入,− / ＋ 按钮配原生 spinbutton,支持 min/max/step 与三档尺寸。 |
| [AutoComplete](/components/auto-complete) | 自由文本输入 + 下拉补全建议;Popover API + CSS Anchor Positioning,键盘全可达。 |
| [Cascader](/components/cascader) | 级联选择,多列同屏展开沿一条路径逐级收窄,键盘四向全可达。 |
| [ColorPicker](/components/color-picker) | 颜色选择器:2D 饱和度-明度面板 + hue/alpha 滑条 + 三格式互转 + 预设 + 屏幕取色。 |
| [DatePicker](/components/date-picker) | 日期选择器,single/range 双模 + 三视图日历,自研零依赖、键盘全可达。 |
| [Editable](/components/editable) | 行内编辑,点击 / 聚焦文本切换为输入态,Enter 或失焦提交、Esc 取消还原;支持多行、受控双通道与两态渲染留口。 |
| [Form](/components/form) | 表单子系统 + 零依赖校验引擎,订阅式切片 store 让打字只重渲单字段。 |
| [Mentions](/components/mentions) | @提及输入,敲触发前缀即弹候选浮层,键盘全可达、可异步搜索。 |
| [PinInput](/components/pin-input) | OTP/验证码分段输入,逐格单字符、自动跳格、整串粘贴自动分填,受控/非受控两用。 |
| [Rate](/components/rate) | 星级评分,受控/非受控双通道,支持半星、再点清零与自定义图标。 |
| [Segmented](/components/segmented) | 分段选择控件,单选 toggle,滑块 indicator 平滑跨段,接全库 tone。 |
| [TagInput](/components/tag-input) | 标签 / 令牌输入,输入框内把已添加项渲染成可删除芯片,回车或分隔符成标签,空输入 Backspace 删尾。 |
| [TimePicker](/components/time-picker) | 时间选择器,只读 Input + 浮层内可滚动的时/分/秒列,逐列选值。 |
| [Upload](/components/upload) | 文件上传:虚线拖拽区 + 点击触发,把「上传编排」与「真实传输」彻底解耦。 |

## 数据展示 Data Display

呈现信息 · 14 个

| 组件 | 简介 |
| --- | --- |
| [Badge](/components/badge) | 小标签,用于状态、计数或分类标记。三种视觉变体 × 六档语义色调。 |
| [Tag](/components/tag) | 语义色标签,六档 tone 柔和底色,可选关闭按钮,用于分类、过滤与可移除项。 |
| [Avatar](/components/avatar) | 头像,展示用户图片或姓名首字母占位,两种形状与三档尺寸。 |
| [Table](/components/table) | 数据表格,列定义 + 行数据驱动,支持斑马纹与行 hover 高亮。 |
| [Timeline](/components/timeline) | 时间线 / 信息流,语义化 &lt;ol&gt;,竖向轴 + 节点圆点 + 连线,节点可换图标按变体着色。 |
| [Calendar](/components/calendar) | 独立月历,整月铺展的日期网格,支持单选 / 范围 / 多选、今天高亮、禁用规则、周起始切换、单元格自定义渲染与完整键盘网格导航。 |
| [Carousel](/components/carousel) | 内容轮播,children 即一屏:slide / fade 双效果、自动播放、拖拽切换,活动指示点随 tone 发光。 |
| [Collapsible](/components/collapsible) | 单项折叠原语,Trigger 切换按钮 + Content 可折叠区,高度过渡平滑展开收起,Content 常驻挂载保活子树。 |
| [Descriptions](/components/descriptions) | 描述列表,键值对成组展示,支持多列折行、跨列 span、bordered 表格态与语义色调。 |
| [Image](/components/image) | 图片,原生懒加载 + 加载骨架 + 失败兜底链,内建点击预览灯箱(缩放/旋转/还原)。 |
| [Marquee](/components/marquee) | 无限跑马灯,children 沿主轴无缝无限滚动(内容克隆 N 份首尾相接,CSS transform 位移后回卷)。 |
| [Statistic](/components/statistic) | 单指标数值展示,千分位 / 精度格式化 + 趋势染色 + 挂载滚动动画。 |
| [Transfer](/components/transfer) | 双列穿梭框,把数据项在「源池」与「目标」之间移动,移动逻辑为可单测纯函数。 |
| [Tree](/components/tree) | 树形控件:展开折叠、单选/多选、级联勾选(含半选),纯逻辑内核 + 完整 ARIA 键盘导航。 |

## 反馈 Feedback

状态与通知 · 9 个

| 组件 | 简介 |
| --- | --- |
| [Alert](/components/alert) | 语义提示框,四种变体(信息 / 成功 / 警告 / 危险),起始边强调条 + 柔和底色。 |
| [Progress](/components/progress) | 进度条,确定态按 value 驱动填充宽度,不确定态填充段左右往返流动。 |
| [Spinner](/components/spinner) | 加载旋转器,持续旋转的发光圆环,三档尺寸,尊重 reduced-motion。 |
| [Skeleton](/components/skeleton) | 加载占位,三种形状(文本行 / 矩形 / 圆形),底色叠一道微光。 |
| [Toast](/components/toast) | 命令式轻提示,无需 Provider,任意处调用 toast() 即可弹出。 |
| [Empty](/components/empty) | 空状态占位,内置极简插画 + 描述 + 操作区,7 档语义色驱动着色与光晕。 |
| [Result](/components/result) | 结果页,七态(成功 / 失败 / 信息 / 警告 + 404 / 403 / 500)派生默认图标与配色,四槽位。 |
| [Spin](/components/spin) | 加载遮罩,就地盖在任意区域上方,内容不卸载、保留布局、屏蔽交互。 |
| [Tour](/components/tour) | 引导漫游,遮罩在目标处镂空高亮 + 浮动引导卡,逐步带新手走完功能巡览。 |

## 导航 Navigation

结构与跳转 · 13 个

| 组件 | 简介 |
| --- | --- |
| [Breadcrumb](/components/breadcrumb) | 面包屑导航,语义化 nav/ol 结构,自动把末项识别为当前页。 |
| [Pagination](/components/pagination) | 分页导航,首尾恒显、当前页两侧对称展开,页数过多时省略号折叠。 |
| [Tabs](/components/tabs) | 标签页,受控 / 非受控双模式,完整 ARIA 与方向键导航,underline / pill 两变体。 |
| [Accordion](/components/accordion) | 手风琴折叠面板组,single / multiple 两种展开模式,键盘可达。 |
| [Affix](/components/affix) | 滚动吸附容器:滚到阈值时吸顶 / 吸底固定,等尺寸占位防跳动。 |
| [Anchor](/components/anchor) | 滚动锚点导航(scroll-spy),跟随滚动高亮当前小节,墨条平滑指示。 |
| [BackTop](/components/back-top) | 回到顶部浮钮:滚过阈值淡入,点击缓动滚回顶部,接 tone 色调与密度缩放。 |
| [Command](/components/command) | 命令面板(⌘K),带模糊 / 子串过滤、命中高亮、键盘导航与分组的可组合命令搜索框,可独立内嵌或包成 Command.Dialog 模态。 |
| [Dropdown](/components/dropdown) | 下拉菜单便捷封装,trigger 元素 + 数据驱动菜单项(或 children 复合),点击 / 悬停展开;复用 Popover 定位与 Menu 渲染契约。 |
| [FloatButton](/components/float-button) | 悬浮操作钮(FAB):圆/方形 × 7 色调,带角标、tooltip,配套可展开 speed-dial 菜单。 |
| [Menubar](/components/menubar) | 应用菜单栏,横向一排顶级菜单触发器(文件 / 编辑 / 视图…),各自打开一个 Menu 面板,同一时刻至多一个打开。 |
| [NavigationMenu](/components/navigation-menu) | 网站导航菜单,横向一排导航项,每项可是纯链接或带下拉 panel(mega-menu)的触发器;同一时刻至多一个 panel 打开,带平滑过渡。 |
| [Steps](/components/steps) | 步骤条 / 向导,线性流程指引,逐步派生 wait/process/finish/error 状态。 |

## 浮层 Overlay

弹层与浮窗 · 8 个

| 组件 | 简介 |
| --- | --- |
| [Dialog](/components/dialog) | 模态对话框,基于原生 &lt;dialog&gt; + showModal(),自带焦点陷阱与 top-layer。 |
| [Drawer](/components/drawer) | 侧边抽屉,基于原生 &lt;dialog&gt; + showModal(),支持四向滑入与焦点陷阱。 |
| [Popover](/components/popover) | 点击浮层,基于原生 Popover API + CSS Anchor Positioning,贴合触发器四向弹出。 |
| [Tooltip](/components/tooltip) | 提示气泡,Popover API 进 top-layer + CSS Anchor 定位,hover / focus 触发,触屏 tap-to-toggle。 |
| [Menu](/components/menu) | 下拉菜单,Popover API + CSS Anchor Positioning,键盘可达,支持禁用项与危险项。 |
| [ContextMenu](/components/context-menu) | 右键菜单,在光标处弹出,越界自动夹回视口,portal 到 body,键盘可达。 |
| [AlertDialog](/components/alert-dialog) | 命令式 confirm / alert / prompt,await 一行拿到用户决策,无需自管 open 状态。 |
| [HoverCard](/components/hover-card) | 悬停富预览卡,trigger(链接 / 头像)hover 或 focus 延时弹出可交互富内容卡,指针可从 trigger 移入卡内而不关闭。 |

## 复合 Composite

组合基础件、自成体系 · 2 个

| 组件 | 简介 |
| --- | --- |
| [Popconfirm](/components/popconfirm) | 锚定在元素旁的轻量确认气泡,内建确认 / 取消按钮流,常用于内联删除确认。 |
| [ConfigProvider](/components/config-provider) | 全局配置上下文:一处统一设置全库设计开关(密度 / 动效 / 发光 / 色调),经 data-ms-* 沿 CSS 级联下发。 |
