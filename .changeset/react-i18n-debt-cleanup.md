---
"@magic-scope/react": patch
---

i18n 存量债清理:硬编码文案全部接入字典,消除绕过字典的类型逃逸

**新增 20 个 key。** 此前散落在组件里的用户可见中文全部收进字典:`anchor.nav`、`navigationMenu.nav`、`breadcrumb.expand`(`{count}` 插值)、`image.zoomIn / zoomOut / rotate / reset / close`、`pinInput.cell`(`{label}` / `{index}` 插值)、`progress.label`、`tabs.add`、`statistic.trendUp / trendDown`、`timePicker.hour / minute / second / meridiem`、`pagination.sizeLabel / pageSize / jump`。**默认文案与改动前逐字一致,行为不变**,新增的是可被 `MessagesProvider` 覆盖的能力。

其中 `Anchor` 的 `ariaLabel` 与 `NavigationMenu` 的 `aria-label` 原先在解构处写死中文默认值,现改为不传时回落字典;显式传入仍然优先。`Image` 的 `toolbarLabels` 同理:不传走字典,传了以 prop 为准。

**`form.validating` 接上真实消费。** `Form.css` 早已备好 `.ms-form__validating-rune` 旋转指示器(含 reduced-motion 降级),store 也一直在维护 per-path 的 validating 态,唯独没有任何地方渲染它。`Form.Field` 现在会在异步校验进行中、且该字段尚无错误时,渲染一行 `role="status"` 的状态行。**这是新增的可见输出**:用了异步 `validate` 的表单会在校验期间多出一行「校验中…」提示。

**删除 3 个无场景的 key(破坏性,`patch` 内的类型收窄)。** `select.create`(全仓没有 creatable / 新建选项能力)、`select.selected`(Select 多选逐条渲染 tag,没有折叠/摘要形态)、`form.submitError`(表单级错误由 `Form.ErrorSummary` 经 `form.errorSummary` 承担)。`MessageKey` 是导出类型,**覆盖过这三条的用户会拿到类型错误,需删掉对应覆盖项**;默认字典行为不受影响。

**消除两处绕过字典的类型逃逸。** `Avatar` 的 `as MessageKey` 断言(`avatar.status.*` 早已登记,模板串本就被 TS 收窄到合法 key,断言从来没必要)与 `Pagination` 的 `t as unknown as (key: string, …)` 强转(三个 key 未登记,现已补齐)。这两处让拼错 key 只会在运行时静默回退,现在由 `tsc` 编译期把关。

**其它:**`Image.tsx` 里以裸 NUL 字节写死的 `fallbackKey` 分隔符改为转义写法(运行时等价;裸字节会让 grep / ripgrep 判定整个文件为二进制而静默跳过);清掉 4 处已失效的 `biome-ignore`;`Upload` 的迟到 `onProgress` 守卫改可选链写法(语义等价)。至此 `biome check` 全仓零错误零警告。
