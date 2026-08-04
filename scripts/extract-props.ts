/**
 * 从组件真实 TS 类型自动抽取 props → playground/showcase/generated/props.json。
 * 唯一真相源:组件源文件;禁止手抄(对应 CI 红线)。
 * 用法:tsx scripts/extract-props.ts [--check]
 *   --check:只校验,不写盘(给 CI 用,检测 props.json 是否与源码漂移)。
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { withCompilerOptions } from 'react-docgen-typescript';
import ts from 'typescript';

const COMPONENTS_DIR = 'packages/react/src/components';
const OUT = 'playground/showcase/generated/props.json';

/** 事件回调的逐个参数说明(抽自源码 @param;无 @param 则为空)。 */
export interface EventParamDoc {
  name: string;
  description: string;
}

export interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
  required: boolean;
  /** 是否继承自原生元素(透传事件 / 属性);组件自有为 false。 */
  native?: boolean;
  /** 仅事件 prop:逐参 @param 说明(按参数名对应回调签名里的参数)。 */
  params?: EventParamDoc[];
}

// 有意义的标准交互事件白名单(继承自原生元素的也要列进「事件 Events」表;
// 排除 media / image / animation / transition / *Capture 等对交互组件无关或重复的)。
const KEEP_NATIVE_EVENT =
  /^on(Click|DoubleClick|Mouse(Down|Up|Enter|Leave|Move|Over|Out)|ContextMenu|Key(Down|Up|Press)|Focus|Blur|Pointer(Down|Up|Move|Enter|Leave|Over|Out|Cancel)|Touch(Start|Move|End|Cancel)|Wheel|Scroll|Change|Input|BeforeInput|Submit|Reset|Invalid|Select|Copy|Cut|Paste|Composition(Start|Update|End)|Drag(Start|End|Enter|Leave|Over)?|Drop)$/;

// react-docgen 会把 @param/@returns 等 JSDoc 块级标签原文折进 description。
// 事件参数已由 @param 单独抽取并渲染,这里把说明截到第一个块级标签为止,只留摘要,避免重复。
// 例外:@deprecated 的正文对使用者是关键信息(为何废弃 / 用什么替代),截断前先取出、前置标注,
// 否则「JSDoc 只有 @deprecated」的 prop(如 Popconfirm.variant)说明列会整个变空。
function cleanDescription(raw: string): string {
  const dep = /@deprecated\b[ \t]*([\s\S]*?)(?=\n[ \t]*@|$)/.exec(raw);
  const deprecated = dep ? dep[1].replace(/\s+/g, ' ').trim() : '';
  const summary = raw
    .replace(
      /\s*@(param|returns?|example|see|deprecated|remarks|default|defaultValue|template|typeParam|throws)\b[\s\S]*$/i,
      '',
    )
    .trim();
  if (!deprecated) return summary;
  return [`已废弃:${deprecated}`, summary].filter(Boolean).join(' ');
}

// —— displayName 精确归属 ——
// react-docgen 自带的 displayName 解析(getTextValueOfFunctionProperty)有两处缺陷:
//   1. 文件 locals 中恰好只有一个符号带子导出时走「松散分支」,任意 `.displayName = '...'` 赋值对所有导出生效;
//   2. 按符号名找不到赋值时,兜底取文件里第一条 `.displayName` 字符串。
// 后果:`export type { Foo } from './logic'` 这类类型 re-export 符号会被冠上组件的 displayName,
// 产生同名 0-props 幽灵 doc;它们在源码里位于组件之前、解析顺序靠前,经「先到先得」去重把真组件
// 的 doc 顶掉 —— 12 个主组件(Affix/AspectRatio/Calendar/…)整体缺失的根因即在此,与组件写法无关。
// 这里精确重实现归属:仅当存在「<该符号名>.displayName = '<字符串>'」赋值时用其值(Grid.Item 等
// 子部件命名靠它),否则一律用导出名本身 —— 幽灵 doc 保留自己的名字(0 行,随后被丢弃)。
function resolveDisplayName(exp: ts.Symbol, source: ts.SourceFile): string {
  for (const stmt of source.statements) {
    if (!ts.isExpressionStatement(stmt)) continue;
    const e = stmt.expression;
    if (!ts.isBinaryExpression(e) || e.operatorToken.kind !== ts.SyntaxKind.EqualsToken) continue;
    if (!ts.isPropertyAccessExpression(e.left) || e.left.name.text !== 'displayName') continue;
    if (!ts.isIdentifier(e.left.expression) || !ts.isStringLiteral(e.right)) continue;
    if (e.left.expression.text === exp.getName()) return e.right.text;
  }
  return exp.getName();
}

const parser = withCompilerOptions(
  { jsx: 4 /* react-jsx */, esModuleInterop: true, skipLibCheck: true },
  {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    componentNameResolver: resolveDisplayName,
    propFilter: (prop) => {
      const own = prop.parent ? !prop.parent.fileName.includes('node_modules') : true;
      // 事件处理器:组件自有的(onValueChange 等)全留;继承自原生元素的只留白名单内的标准交互事件。
      if (/^on[A-Z]/.test(prop.name)) return own || KEEP_NATIVE_EVENT.test(prop.name);
      // 非事件 props:仍只保留组件自有(继承的原生属性用 ...props 一行概括)。
      return own;
    },
  },
);

// 收集每个组件目录的主源文件(<Dir>/<Dir>.tsx)。
// 显式排序:readdir 顺序依赖文件系统,而 props.json 是已提交、被 check:props 逐字节比对的红线产物,
// 键序必须与遍历环境无关。
const dirs = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const files: string[] = [];
for (const dir of dirs) {
  const main = join(COMPONENTS_DIR, dir, `${dir}.tsx`);
  try {
    readFileSync(main);
    files.push(main);
  } catch {
    // 没有同名主文件的目录跳过。
  }
}

// —— 共享 TS 程序:供 @param 抽取与 *Options 抽取复用(避免建两次 program)。
const program = ts.createProgram(files, {
  jsx: ts.JsxEmit.ReactJSX,
  esModuleInterop: true,
  skipLibCheck: true,
});
const checker = program.getTypeChecker();

// 抽「事件 prop 的 @param」:file → 声明接口 → propName → EventParamDoc[]。
// react-docgen 只给 description(JSDoc 首段),逐参 @param 用编译器 API 单独取。
// 按「声明接口」隔离建索引:同一文件里多个接口常声明同名事件(Checkbox/CheckboxGroup 的 onChange、
// Confirm/Alert/PromptOptions 的 onConfirm),若只按 prop 名建键会互相覆盖、@param 串味(全库曾 33 条污染)。
// 键取属性签名的直接父节点:InterfaceDeclaration 用接口名;type 别名的对象字面量成员没有具名父接口,
// 与 react-docgen 给 PropItem.parent 的口径一致(彼时 parent 为 undefined),归入 '' 键。
function extractParamDocs(
  filePaths: string[],
): Record<string, Record<string, Record<string, EventParamDoc[]>>> {
  const byFile: Record<string, Record<string, Record<string, EventParamDoc[]>>> = {};
  for (const file of filePaths) {
    const sf = program.getSourceFile(file);
    if (!sf) continue;
    const map: Record<string, Record<string, EventParamDoc[]>> = {};
    const visit = (node: ts.Node) => {
      if (
        (ts.isPropertySignature(node) || ts.isMethodSignature(node)) &&
        node.name &&
        ts.isIdentifier(node.name) &&
        /^on[A-Z]/.test(node.name.text)
      ) {
        const parentName =
          node.parent && ts.isInterfaceDeclaration(node.parent) ? node.parent.name.text : '';
        const sym = checker.getSymbolAtLocation(node.name);
        const tags = sym?.getJsDocTags(checker) ?? [];
        const params: EventParamDoc[] = [];
        for (const tag of tags) {
          if (tag.name !== 'param' || !tag.text) continue;
          const namePart = tag.text.find((p) => p.kind === 'parameterName');
          let pname: string;
          let desc: string;
          if (namePart) {
            pname = namePart.text;
            desc = tag.text
              .filter((p) => p !== namePart)
              .map((p) => p.text)
              .join('')
              .trim();
          } else {
            const full = ts.displayPartsToString(tag.text).trim();
            const m = /^(\S+)\s+([\s\S]*)$/.exec(full);
            pname = m ? m[1] : full;
            desc = m ? m[2] : '';
          }
          desc = desc
            .replace(/^[\s\-:]+/, '')
            .replace(/\s+/g, ' ')
            .trim();
          if (pname) params.push({ name: pname, description: desc });
        }
        if (params.length) {
          map[parentName] ??= {};
          map[parentName][node.name.text] = params;
        }
      }
      ts.forEachChild(node, visit);
    };
    ts.forEachChild(sf, visit);
    if (Object.keys(map).length) byFile[file] = map;
  }
  return byFile;
}

const paramDocs = extractParamDocs(files);

const docs = parser.parse(files);

// displayName → PropRow[](同名多导出合并)。
const out: Record<string, PropRow[]> = {};
for (const doc of docs) {
  const filePath = (doc as { filePath?: string }).filePath ?? '';
  const fileParams = paramDocs[filePath] ?? {};
  const rows: PropRow[] = Object.values(doc.props).map((p) => {
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
      description: cleanDescription((p.description ?? '').trim()),
      required: Boolean(p.required),
      native,
    };
    // @param 按声明接口取:react-docgen 对接口成员给 parent.name,对 type 字面量成员给 undefined(对应 '' 键)。
    const params = fileParams[p.parent?.name ?? '']?.[p.name];
    if (/^on[A-Z]/.test(p.name) && params) row.params = params;
    return row;
  });
  if (rows.length === 0) continue;
  // 同 displayName 合并(如 RadioGroup + Radio 各自一条 displayName,这里按名分别存)。
  out[doc.displayName] = (out[doc.displayName] ?? []).concat(rows);
}

// —— 额外抽取命令式 API 的 *Options 接口 ——
// react-docgen 只抓「组件 props」,toast()/confirm() 的 options 是普通接口,用 TS 编译器 API 补抽。
function extractOptionInterfaces(
  filePaths: string[],
): { file: string; name: string; rows: PropRow[] }[] {
  const result: { file: string; name: string; rows: PropRow[] }[] = [];
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
        // getDocumentationComment 天然不含块级标签,@deprecated 正文需从 tags 单独取回再交给 cleanDescription 统一标注。
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
        const params = fileParams[node.name.text]?.[name];
        if (/^on[A-Z]/.test(name) && params) row.params = params;
        rows.push(row);
      }
      if (rows.length) result.push({ file, name: node.name.text, rows });
    });
  }
  return result;
}

const optionEntries = extractOptionInterfaces(files);
for (const { name, rows } of optionEntries) {
  out[name] = rows;
}

// 红线守卫:每个组件目录的主文件必须产出「与目录同名」的主组件键(至少一行 props)。
// docgen 的归属/去重缺陷曾静默吞掉 12 个主组件(键整体缺失、展示站与 docs 参数表跟着变空)——
// 一旦回归,这里硬失败而非无声缺键。例外:命令式 API 组件(AlertDialog/Toast)不导出同名组件,
// 参数表走 *Options 接口键(meta.propsName 指向),按「该目录产出过 Options 键」豁免。
const optionDirs = new Set(optionEntries.map((e) => basename(dirname(e.file))));
const missingMain = files
  .map((f) => basename(dirname(f)))
  .filter((dir) => !out[dir]?.length && !optionDirs.has(dir));
if (missingMain.length > 0) {
  console.error(`✖ 以下组件目录未抽取到主组件 props(docgen 归属回归?):${missingMain.join('、')}`);
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
}
