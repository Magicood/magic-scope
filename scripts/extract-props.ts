/**
 * 从组件真实 TS 类型自动抽取 props → playground/showcase/generated/props.json。
 * 唯一真相源:组件源文件;禁止手抄(对应 CI 红线)。
 * 用法:tsx scripts/extract-props.ts [--check]
 *   --check:只校验,不写盘(给 CI 用,检测 props.json 是否与源码漂移)。
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
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
function cleanDescription(raw: string): string {
  return raw
    .replace(
      /\s*@(param|returns?|example|see|deprecated|remarks|default|defaultValue|template|typeParam|throws)\b[\s\S]*$/i,
      '',
    )
    .trim();
}

const parser = withCompilerOptions(
  { jsx: 4 /* react-jsx */, esModuleInterop: true, skipLibCheck: true },
  {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
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
const dirs = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

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

// 抽「事件 prop 的 @param」:file → propName → EventParamDoc[]。
// react-docgen 只给 description(JSDoc 首段),逐参 @param 用编译器 API 单独取。
function extractParamDocs(filePaths: string[]): Record<string, Record<string, EventParamDoc[]>> {
  const byFile: Record<string, Record<string, EventParamDoc[]>> = {};
  for (const file of filePaths) {
    const sf = program.getSourceFile(file);
    if (!sf) continue;
    const map: Record<string, EventParamDoc[]> = {};
    const visit = (node: ts.Node) => {
      if (
        (ts.isPropertySignature(node) || ts.isMethodSignature(node)) &&
        node.name &&
        ts.isIdentifier(node.name) &&
        /^on[A-Z]/.test(node.name.text)
      ) {
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
        if (params.length) map[node.name.text] = params;
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
    if (/^on[A-Z]/.test(p.name) && fileParams[p.name]) row.params = fileParams[p.name];
    return row;
  });
  if (rows.length === 0) continue;
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
        const description = sym
          ? cleanDescription(ts.displayPartsToString(sym.getDocumentationComment(checker)).trim())
          : '';
        const name = member.name.getText(sf);
        const row: PropRow = {
          name,
          type: member.type ? member.type.getText(sf).replace(/\s+/g, ' ').trim() : 'unknown',
          default: '—',
          description,
          required: !member.questionToken,
        };
        if (/^on[A-Z]/.test(name) && fileParams[name]) row.params = fileParams[name];
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
