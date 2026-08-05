/**
 * 从组件真实 TS 类型自动抽取 props → playground/showcase/generated/props.json。
 * 唯一真相源:组件源文件;禁止手抄(对应 CI 红线)。
 * 用法:tsx scripts/extract-props.ts [--check]
 *   --check:只校验,不写盘(给 CI 用,检测 props.json 是否与源码漂移)。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';
import { withCompilerOptions } from 'react-docgen-typescript';
import ts from 'typescript';
import { collectComponentFiles } from './lib/component-sources';
import { cleanDescription, extractParamDocs, type PropRow } from './lib/props-doc';

const COMPONENTS_DIR = 'packages/react/src/components';
const OUT = 'playground/showcase/generated/props.json';

// 有意义的标准交互事件白名单(继承自原生元素的也要列进「事件 Events」表;
// 排除 media / image / animation / transition / *Capture 等对交互组件无关或重复的)。
const KEEP_NATIVE_EVENT =
  /^on(Click|DoubleClick|Mouse(Down|Up|Enter|Leave|Move|Over|Out)|ContextMenu|Key(Down|Up|Press)|Focus|Blur|Pointer(Down|Up|Move|Enter|Leave|Over|Out|Cancel)|Touch(Start|Move|End|Cancel)|Wheel|Scroll|Change|Input|BeforeInput|Submit|Reset|Invalid|Select|Copy|Cut|Paste|Composition(Start|Update|End)|Drag(Start|End|Enter|Leave|Over)?|Drop)$/;

const parser = withCompilerOptions(
  { jsx: 4 /* react-jsx */, esModuleInterop: true, skipLibCheck: true },
  {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    // react-docgen 的 displayName 计算有坑:文件里存在 `X.displayName = '...'` 赋值时,
    // 「类型 re-export(export type { ... } from './logic')」这类无值声明的导出会被错误冠上
    // 该赋值的名字(找不到同名赋值就兜底取文件里第一条),产出一个 0 props 的同名 doc;
    // 而 parse 对同名 doc「保留第一个」,真组件(排在后面)被静默丢弃——这正是 12 个主组件键
    // 曾整体消失的根因。这里对无 valueDeclaration 的符号(类型别名 / 接口)强制用其自身名,
    // 让它们各归各名(0 props 会被下游 rows.length 过滤),不再抢占组件名。
    componentNameResolver: (exp) => (exp.valueDeclaration ? undefined : exp.getName()),
    propFilter: (prop) => {
      const own = prop.parent ? !prop.parent.fileName.includes('node_modules') : true;
      // 事件处理器:组件自有的(onValueChange 等)全留;继承自原生元素的只留白名单内的标准交互事件。
      if (/^on[A-Z]/.test(prop.name)) return own || KEEP_NATIVE_EVENT.test(prop.name);
      // 非事件 props:仍只保留组件自有(继承的原生属性用 ...props 一行概括)。
      return own;
    },
  },
);

// 收集组件源文件:每个目录下的**全部** .tsx(主文件在前),而非只有同名主文件 ——
// 公开子部件常写在别的文件里(Form/Field.tsx、Form/Form.parts.tsx)。取舍与排序理由见该模块。
const { files, mainDirs } = collectComponentFiles(COMPONENTS_DIR);

// —— 共享 TS 程序:供 @param 抽取与 *Options 抽取复用(避免建两次 program)。
const program = ts.createProgram(files, {
  jsx: ts.JsxEmit.ReactJSX,
  esModuleInterop: true,
  skipLibCheck: true,
});
const checker = program.getTypeChecker();

// 事件 @param:三层索引 file → 声明接口 → propName(实现与「为何必须按接口分桶」见 lib/props-doc.ts)。
const paramDocs = extractParamDocs(program, checker, files);

const docs = parser.parse(files);

// —— 跨文件同名 displayName ——
// 扫描扩到目录内全部 .tsx 后,目录私有的实现件可能与另一个公开组件重名
// (DatePicker 内部的日历面板同样叫 `Calendar`,与公开的 Calendar 组件撞键)。
// 撞键会被下方 `concat` 静默合并成一张混着两个组件参数的表,故:登记在册的文件整份不参与 props.json,
// 未登记的重名一律硬失败。登记的是「被忽略的文件」而非「胜出者」,判定与遍历顺序无关。
const IGNORED_DOCS: Record<string, string[]> = {
  // DatePicker 的内嵌日历面板(私有实现,不从包导出);公开的日历是 components/Calendar。
  Calendar: ['packages/react/src/components/DatePicker/Calendar.tsx'],
};

// 组件目录名(`.../components/<Dir>/<file>` → `<Dir>`);不在组件目录下的返回 null。
const componentDirOf = (file: string): string | null =>
  /(?:^|\/)components\/([^/]+)\//.exec(file.replace(/\\/g, '/'))?.[1] ?? null;

// displayName → PropRow[](同名多导出合并)。
const out: Record<string, PropRow[]> = {};
// displayName → 首次产出它的文件(跨文件撞键判定用)。
const owners: Record<string, string> = {};
const collisions: string[] = [];
// 被 rows.length === 0 丢掉的「命名空间子组件」(displayName 形如 'Menu.Trigger')。
const droppedNamespaced: string[] = [];
// 「继承自其它组件」而未重复列出的 props(见下方过滤),仅作一行提示,便于发现新增的跨组件继承。
const inheritedNotes: string[] = [];
for (const doc of docs) {
  const filePath = (doc as { filePath?: string }).filePath ?? '';
  // react-docgen 回传的 filePath 时而绝对时而相对(同名 basename 的第二个文件走绝对路径),
  // 统一成「仓库根为起点的 posix 相对路径」再做登记 / 比对。
  const relPath = relative(process.cwd(), filePath).replace(/\\/g, '/');
  if (IGNORED_DOCS[doc.displayName]?.includes(relPath)) continue;

  const fileParams = paramDocs[filePath] ?? {};
  // 继承自**别的组件**的 props 不重复列出:Form.Submit / Form.Reset 原样透传 Button 的全部 props,
  // 铺进表里既是 Button 文档的复制品,又因 JSDoc 归属前缀写不进 Button 源码而无法标明出处
  // (alsoProps 是扁平合并,并进 Form 后会被读成 Form 自己的参数)。改由子部件自己的 JSDoc 一句话指向 Button。
  // 原生透传(parent 在 node_modules)不走这条:它们已由 native 标记 + meta.spread 的「...props」行概括。
  const docDir = componentDirOf(relPath);
  const ownProps = Object.values(doc.props).filter((p) => {
    const parentFile = p.parent?.fileName;
    if (!parentFile || parentFile.includes('node_modules')) return true;
    if (componentDirOf(parentFile) === docDir) return true;
    inheritedNotes.push(`${doc.displayName} ← ${p.parent?.name}.${p.name}`);
    return false;
  });
  const rows: PropRow[] = ownProps.map((p) => {
    // enum 优先用 raw 联合字符串;否则拼字面量;再否则用 name。
    const t = p.type as { name?: string; raw?: string; value?: { value: string }[] };
    let typeStr = t.name ?? 'unknown';
    if (t.name === 'enum') {
      if (Array.isArray(t.value)) {
        typeStr = t.value.map((v) => v.value).join(' | ');
      } else if (t.raw) {
        typeStr = t.raw;
      }
    } else if (t.raw && t.name === undefined) {
      typeStr = t.raw;
    }
    const native = p.parent ? p.parent.fileName.includes('node_modules') : false;
    const row: PropRow = {
      name: p.name,
      type: typeStr.replace(/\s+/g, ' ').trim(),
      default: p.defaultValue?.value != null ? String(p.defaultValue.value) : '—',
      description: cleanDescription((p.description ?? '').trim(), !native),
      required: Boolean(p.required),
      native,
    };
    // @param 按「声明该 prop 的接口」取:react-docgen 对接口成员给 parent.name,
    // 对 type 字面量成员给 undefined(对应 '' 桶);原生透传 prop 的 parent 在 node_modules,
    // 本文件不存在同名桶,自然拿不到 params —— Breadcrumb 根 onClick 被冠上 BreadcrumbItem 三参即此类。
    const params = fileParams[p.parent?.name ?? '']?.[p.name];
    if (/^on[A-Z]/.test(p.name) && params) row.params = params;
    return row;
  });
  if (rows.length === 0) {
    // 只记候选,判定交给下方守卫②:一是同名符号可能产出多条 doc(见上方 componentNameResolver
    // 注释),另一条有行则键仍完整;二是带点还不足以说明是人工声明的子组件(react-docgen 会给
    // 静态成员自动合成带点名),得比对源码里的 displayName 赋值才能定性。
    if (doc.displayName.includes('.')) droppedNamespaced.push(doc.displayName);
    continue;
  }
  // 撞键登记只对「真的会写进 props.json 的 doc」做:0 行的幽灵 doc 本就整条丢弃
  // (Menu 家族四个文件各产出一条 0 行的 `MenuItem` 类型 doc),拿来报错纯属误伤。
  const prevOwner = owners[doc.displayName];
  if (prevOwner && prevOwner !== relPath) {
    collisions.push(`${doc.displayName}(${prevOwner} 与 ${relPath})`);
  }
  owners[doc.displayName] ??= relPath;
  // 同 displayName 合并(如 RadioGroup + Radio 各自一条 displayName,这里按名分别存)。
  out[doc.displayName] = (out[doc.displayName] ?? []).concat(rows);
}

// —— 额外抽取命令式 API 的 *Options 接口 ——
// react-docgen 只抓「组件 props」,toast()/confirm() 的 options 是普通接口,用 TS 编译器 API 补抽。
function extractOptionInterfaces(filePaths: string[]): Record<string, PropRow[]> {
  const result: Record<string, PropRow[]> = {};
  for (const file of filePaths) {
    const sf = program.getSourceFile(file);
    if (!sf) continue;
    const fileParams = paramDocs[file] ?? {};
    sf.forEachChild((node) => {
      if (!ts.isInterfaceDeclaration(node) || !/Options$/.test(node.name.text)) return;
      const exported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!exported) return;
      const rows: PropRow[] = [];
      for (const member of node.members) {
        if (!ts.isPropertySignature(member) || !member.name) continue;
        const sym = checker.getSymbolAtLocation(member.name);
        // getDocumentationComment 天然不含块级标签,@deprecated 正文须从 tags 单独取回,
        // 再拼回原始形态交给 cleanDescription 统一标注(与 docgen 分支同一套口径)。
        const depTag = sym
          ?.getJsDocTags(checker)
          .find((tag) => tag.name === 'deprecated' && tag.text?.length);
        const rawDoc = sym
          ? ts.displayPartsToString(sym.getDocumentationComment(checker)).trim() +
            (depTag ? `\n@deprecated ${ts.displayPartsToString(depTag.text)}` : '')
          : '';
        const description = cleanDescription(rawDoc);
        const name = member.name.getText(sf);
        const row: PropRow = {
          name,
          type: member.type ? member.type.getText(sf).replace(/\s+/g, ' ').trim() : 'unknown',
          default: '—',
          description,
          required: !member.questionToken,
        };
        // 同样按声明接口取(node 即本接口),避免同文件多个 *Options 的同名 onConfirm 串味。
        const params = fileParams[node.name.text]?.[name];
        if (/^on[A-Z]/.test(name) && params) row.params = params;
        rows.push(row);
      }
      if (rows.length) result[node.name.text] = rows;
    });
  }
  return result;
}

for (const [name, rows] of Object.entries(extractOptionInterfaces(files))) {
  out[name] = rows;
}

// —— 守卫③:跨文件同名 displayName 必须显式登记 ——
// 两份不同的组件文档合进同一个键(concat)后,展示站 / docs 会把它们的参数混列成一张表,
// 且没有任何一条既有守卫看得见(键存在、行数也非零)。这里在合并阶段就拦下。
if (collisions.length) {
  console.error(
    `✖ 以下 displayName 由多个文件同时产出,会被合并成一张混着两个组件参数的表:${collisions.join('、')}\n  若其中一份是目录私有实现件,请登记进 extract-props.ts 的 IGNORED_DOCS;否则改名。`,
  );
  process.exit(1);
}

// —— 守卫①:每个组件目录必须产出「与目录同名的主 displayName」且 props 非空,否则报错 ——
// react-docgen 在多种导出形态下会静默丢主组件(见上方 componentNameResolver 注释;
// `as` 断言导出 + displayName 挂在局部名上是另一触发形态),丢了页面只剩 ...props 合成行,
// 却仍声称「自动抽取、永不漂移」。这里硬性拦截,任何形态的复发都会让 gen/check 直接失败。
const GUARD_EXCEPTIONS: Record<string, string[]> = {
  // 命令式 API 目录:无与目录同名的组件本体,以其真实产出键代为把关。
  AlertDialog: ['ConfirmOptions', 'AlertOptions', 'PromptOptions'],
  Toast: ['Toaster', 'ToastOptions'],
};
const missingMain = mainDirs.filter((dir) => {
  const expected = GUARD_EXCEPTIONS[dir] ?? [dir];
  return !expected.some((k) => (out[k] ?? []).length > 0);
});
if (missingMain.length) {
  console.error(
    `✖ 以下组件目录未产出主组件 displayName(被 react-docgen 静默丢弃,须排查导出形态):${missingMain.join(', ')}`,
  );
  process.exit(1);
}

// —— 守卫②:显式声明了 displayName 的命名空间子组件,不得抽出 0 行 ——
// 抽出 0 行整条 doc 会被丢,props.json 里连键都没有,展示站 / docs 那一段参数无声消失
// (Menu.Trigger 曾如此:唯一自有 prop 是无 JSDoc 的 children,被 react-docgen 的
// skipChildrenPropWithoutDoc 在自定义 propFilter 之前剔掉,又没有原生事件兜底)。
//
// 判据必须是「源码里确有 `X.displayName = 'A.B'` 赋值」,不能只看 displayName 带点:
// react-docgen 会给挂在导出组件上的静态成员**自动**合成 `导出名.成员名`(parser.js 的
// static sub-components 分支),那类没人显式声明、0 行也可能是合理的,拿来报错就是误伤。
const declaredDisplayNames = new Set(
  files.flatMap((f) =>
    [...readFileSync(f, 'utf8').matchAll(/\.displayName\s*=\s*['"]([^'"]+)['"]/g)].map((m) => m[1]),
  ),
);
const lostNamespaced = droppedNamespaced.filter(
  (name) => declaredDisplayNames.has(name) && !out[name]?.length,
);
if (lostNamespaced.length) {
  console.error(
    `✖ 以下命名空间子组件抽出 0 行 props,已被整条丢弃(props.json 里将无此键):${lostNamespaced.join(', ')}\n  多半是唯一的自有 prop 是无 JSDoc 的 children——给它补文档注释即可。`,
  );
  process.exit(1);
}

const json = `${JSON.stringify(out, null, 2)}\n`;

if (process.argv.includes('--check')) {
  const existing = (() => {
    try {
      return readFileSync(OUT, 'utf8');
    } catch {
      return '';
    }
  })();
  if (existing.trim() !== json.trim()) {
    console.error('✖ props.json 与源码漂移!请运行 `tsx scripts/extract-props.ts` 重新生成。');
    process.exit(1);
  }
  console.log('✓ props.json 与源码一致');
} else {
  writeFileSync(OUT, json, 'utf8');
  const names = Object.keys(out);
  console.log(
    `已写入 ${OUT}:${names.length} 个组件,共 ${Object.values(out).reduce((s, r) => s + r.length, 0)} 行 props`,
  );
  if (inheritedNotes.length) {
    console.log(
      `ℹ 继承自其它组件的 ${inheritedNotes.length} 个 prop 未重复列出(由子部件自己的 JSDoc 指向来源组件):${inheritedNotes.join('、')}`,
    );
  }
}
