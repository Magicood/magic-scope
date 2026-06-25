import type { ComponentType } from 'react';
import type { Control, ControlValues } from '../types';

/**
 * 新架构契约(三层):
 *  - ComponentMeta：框架无关元数据(唯一真相源,可映射多框架)
 *  - ReactAdapter：React 适配(controls→组件的实时演示 + 真实 demo 文件)
 *  - props 不在此手写,由 scripts/extract-props.ts 从真实 TS 抽取进 generated/props.json
 */

/** 从真实 TS 抽取的一行 prop(与 extract-props.ts 的 PropRow 对齐)。 */
export interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
  required: boolean;
}

/** 框架无关的组件元数据。 */
export interface ComponentMeta {
  /** kebab id（路由）。 */
  id: string;
  /** displayName，必须与 props.json 的键一致（如 'Button'）。 */
  name: string;
  category: string;
  /** 一句话简介（i18n：将来可换成 LocalizedString）。 */
  summary: string;
  description?: string;
  /** 可交互参数旋钮（框架无关定义）。 */
  controls: Control[];
  /** 透传的原生元素，用于 props 表的「…props」行，如 'button'；无则不显示。 */
  spread?: string;
  /** props 表要并入的其它 displayName（多导出，如 Radio 并 'RadioGroup'）。 */
  alsoProps?: string[];
}

/** 支持的框架（多框架代码切换用；现仅 react，vue/angular 预留）。 */
export type FrameworkId = 'react' | 'vue' | 'angular';

/** 一个真实 demo 文件（既实时渲染，又展示其源码）。 */
export interface DemoEntry {
  /** 文件名（无扩展），如 'variants'。 */
  name: string;
  /** demo 组件本体（import 渲染，当前框架）。 */
  Comp: ComponentType;
  /**
   * 各框架的真实源码（?raw，与渲染同一文件，永不漂移）。
   * 现仅 react;vue/angular 将来由对应 adapters 注入,代码块自动多一个可切换标签。
   */
  sources: Partial<Record<FrameworkId, string>>;
}

/** React 适配层。 */
export interface ReactAdapter {
  id: string;
  /** 受参数旋钮驱动的主交互演示。 */
  Playground: ComponentType<{ values: ControlValues }>;
  /** 真实 demo 文件集合。 */
  demos: DemoEntry[];
}

/** 一个组件在展示站里的完整条目（元数据 + 当前框架适配）。 */
export interface ComponentDoc {
  meta: ComponentMeta;
  react: ReactAdapter;
}
