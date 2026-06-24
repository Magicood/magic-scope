import { z } from 'zod';

/** 溯源元数据:component.json 的核心,「有迹可循 + 可落库」的关键。 */
export const sourceSchema = z.object({
  type: z.enum(['original', 'inspired', 'captured']),
  url: z.string().optional(),
  app: z.string().optional(),
  screenshot: z.string().optional(),
  capturedAt: z.string(),
  requirements: z.string(),
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
  frameworks: z.array(z.enum(['react', 'vue', 'web-component', 'tokens'])),
  source: sourceSchema,
  dependencies: z.array(z.string()).default([]),
  preview: z.string().optional(),
  files: z.array(z.string()).default([]),
});

export type Source = z.infer<typeof sourceSchema>;
export type Component = z.infer<typeof componentSchema>;
