/**
 * extract-props 的纯逻辑部分(JSDoc 说明清洗 + 事件 @param 抽取)。
 * 单独成模块只为一件事:extract-props.ts 是「导入即执行、跑完写盘」的脚本,无法被测试直接 import;
 * 这两段是全脚本仅有的、能脱离文件系统独立验证的逻辑,拆出来配套单测(见 scripts/extract-props.test.ts)。
 */
import ts from 'typescript';

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

/** file → 声明接口名(type 字面量成员归 '' 桶)→ propName → @param 列表。 */
export type ParamDocIndex = Record<string, Record<string, Record<string, EventParamDoc[]>>>;

// react-docgen 会把 @param/@returns 等 JSDoc 块级标签原文折进 description。
// 事件参数已由 @param 单独抽取并渲染,这里把说明截到第一个块级标签为止,只留摘要,避免重复。
//
// 例外:@deprecated 的正文是使用者最需要的信息(为何废弃 / 换用什么),一刀切截断会连它一起丢 ——
// 「JSDoc 里只有 @deprecated」的 prop(Popconfirm.variant)说明列会整个变空;
// 「正文 + @deprecated」的 prop(Collapsible.forceMount)则丢掉「本属性已无效果」这条关键提示。
// 故先单独取出 @deprecated 正文,前置「已废弃:」再接摘要。
//
// keepDeprecated=false 用于原生透传 prop:React 官方类型里 onKeyPress 等自带英文 @deprecated
// (「Use `onKeyUp` or `onKeyDown` instead」),全库 100+ 行,注入后与项目中文文案风格割裂;
// 这些 prop 本就由 `...props` 一行概括,废弃与否交给 React 自己的类型提示。只给自家 prop 标注。
export function cleanDescription(raw: string, keepDeprecated = true): string {
  const summary = raw
    .replace(
      /\s*@(param|returns?|example|see|deprecated|remarks|default|defaultValue|template|typeParam|throws)\b[\s\S]*$/i,
      '',
    )
    .trim();
  if (!keepDeprecated) return summary;
  // 正文取到下一个块级标签(行首 @)或文本结束为止,允许跨行。
  const dep = /@deprecated\b[ \t]*([\s\S]*?)(?=\n[ \t]*@|$)/.exec(raw);
  const deprecated = dep?.[1] ? dep[1].replace(/\s+/g, ' ').trim() : '';
  if (!deprecated) return summary;
  return [`已废弃:${deprecated}`, summary].filter(Boolean).join(' ');
}

// 抽「事件 prop 的 @param」:file → 声明接口名 → propName → EventParamDoc[]。
// react-docgen 只给 description(JSDoc 首段),逐参 @param 用编译器 API 单独取。
//
// 必须按「声明接口」分桶:同一文件里多个接口常声明同名事件(Checkbox / CheckboxGroup 的 onChange、
// Confirm / Alert / PromptOptions 的 onConfirm、Breadcrumb 根透传的 onClick 与 BreadcrumbItem.onClick),
// 只按 prop 名建键会互相覆盖,把别家接口的 @param 串到本接口上(全库曾 28 行被串味)。
// 键取属性签名的直接父节点:InterfaceDeclaration 用接口名;type 别名里的对象字面量成员没有具名父接口,
// 归入 '' 桶 —— 与 react-docgen 给 PropItem.parent 的口径一致(此时 parent 为 undefined)。
export function extractParamDocs(
  program: ts.Program,
  checker: ts.TypeChecker,
  filePaths: string[],
): ParamDocIndex {
  const byFile: ParamDocIndex = {};
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
        const ownerName =
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
            pname = m?.[1] ?? full;
            desc = m?.[2] ?? '';
          }
          desc = desc
            .replace(/^[\s\-:]+/, '')
            .replace(/\s+/g, ' ')
            .trim();
          if (pname) params.push({ name: pname, description: desc });
        }
        if (params.length) {
          map[ownerName] ??= {};
          const bucket = map[ownerName];
          if (bucket) bucket[node.name.text] = params;
        }
      }
      ts.forEachChild(node, visit);
    };
    ts.forEachChild(sf, visit);
    if (Object.keys(map).length) byFile[file] = map;
  }
  return byFile;
}
