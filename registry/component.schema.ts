import { z } from 'zod';

/** 溯源元数据:component.json 的核心,「有迹可循 + 可落库」的关键。 */
export const sourceSchema = z
  .object({
    /** original=自研原创;inspired=受外部启发重做;captured=按截图 / 页面复刻。 */
    type: z.enum(['original', 'inspired', 'captured']),
    /** 来源链接(在线 URL / 设计稿);inspired·captured 至少给一项证据。 */
    url: z.string().url().optional(),
    /** 来源应用 / 产品名(如 Linear、Figma 文件)。 */
    app: z.string().optional(),
    /** 截图 / 设计稿的相对路径或链接。 */
    screenshot: z.string().optional(),
    /** 收录日期,YYYY-MM-DD。 */
    capturedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'capturedAt 需为 YYYY-MM-DD'),
    /** 当时的需求原文 / 设计意图 —— 溯源的「为什么」。 */
    requirements: z.string().min(10, 'requirements 太短,应写真实需求原文 / 设计意图'),
  })
  // 受启发 / 复刻的组件必须至少留一项外部证据,否则「可追溯」名存实亡;original 自研免证据。
  .refine((s) => s.type === 'original' || Boolean(s.url || s.app || s.screenshot), {
    path: ['type'],
    message:
      'source.type 为 inspired / captured 时,需至少提供 url / app / screenshot 之一作为溯源证据',
  });

/** 每个组件一份 component.json,经此 schema 校验后写入 registry/manifest.json。 */
export const componentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'stable', 'deprecated']).default('draft'),
  version: z.string(),
  frameworks: z.array(z.enum(['react', 'vue', 'angular', 'web-component', 'tokens'])),
  /** 复杂度层级:primitive=基础原子件 / composite=多基础件组合的复合件(Form/DataTable…)。可选,过渡期用 tag 兜底。 */
  tier: z.enum(['primitive', 'composite']).optional(),
  source: sourceSchema,
  dependencies: z.array(z.string()).default([]),
  preview: z.string().optional(),
  files: z.array(z.string()).default([]),
});

export type Source = z.infer<typeof sourceSchema>;
export type Component = z.infer<typeof componentSchema>;
