export interface EventParam {
  name: string;
  type: string;
  optional: boolean;
}

/**
 * 把事件回调签名拆成逐个参数。
 * 输入如 "(value: string | string[], option?: SelectOption) => void"
 * 输出 [{name:'value',type:'string | string[]',optional:false},{name:'option',type:'SelectOption',optional:true}]
 * 顶层逗号分隔(尊重 <> () {} [] 嵌套,避免把 MouseEvent<A, B> 的逗号当分隔)。
 */
export function parseEventParams(signature: string): EventParam[] {
  const s = signature.trim();
  const open = s.indexOf('(');
  if (open < 0) return [];
  let depth = 0;
  let close = -1;
  for (let i = open; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  if (close < 0) return [];
  const inner = s.slice(open + 1, close).trim();
  if (!inner) return [];

  const parts: string[] = [];
  let d = 0;
  let start = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '<' || ch === '(' || ch === '{' || ch === '[') d++;
    else if (ch === '>' || ch === ')' || ch === '}' || ch === ']') d--;
    else if (ch === ',' && d === 0) {
      parts.push(inner.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(inner.slice(start));

  return parts.map((p) => {
    const m = /^\s*([\w$]+)(\?)?\s*:\s*([\s\S]+)$/.exec(p.trim());
    if (!m) return { name: p.trim(), type: '', optional: false };
    return { name: m[1], type: m[3].trim(), optional: m[2] === '?' };
  });
}

/** 生成事件调用示例:<Name onX={(p1, p2) => { … }} />。 */
export function eventExample(
  componentName: string,
  eventName: string,
  params: EventParam[],
): string {
  const args = params.map((p) => p.name).join(', ');
  return `<${componentName}\n  ${eventName}={(${args}) => {\n    // 在此处理${eventName}\n  }}\n/>`;
}
