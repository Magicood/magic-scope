/* ============================================================================
 * Vela 站点内容单一真相源。
 * 所有文案集中此处:克制、专业、无中二法术腔。各区块从这里取数,语气统一。
 * ========================================================================== */

export const brand = {
  name: 'Vela',
  tagline: '让产品信号变成决策',
  description:
    'Vela 是面向现代团队的产品分析与可观测性平台。把指标、事件与告警汇到一处,让每一次发布都心里有数。',
} as const;

export const nav = [
  { label: '产品', href: '#features' },
  { label: '工作流', href: '#workflow' },
  { label: '客户', href: '#testimonials' },
  { label: '价格', href: '#pricing' },
  { label: '文档', href: '#faq' },
] as const;

export const hero = {
  eyebrow: '产品分析 · 可观测性',
  title: '把产品的每一个信号,\n汇成清晰的决策',
  subtitle:
    '指标、事件、漏斗、告警,在同一处协同。Vela 让团队不再被割裂的数据拖慢,几分钟接入,实时看清产品发生了什么。',
  primaryCta: '免费开始',
  secondaryCta: '查看实时面板',
  note: '无需信用卡 · 14 天专业版试用',
} as const;

export const logos = ['Northwind', 'Lumio', 'Cobalt', 'Aster', 'Monora', 'Driftwave'] as const;

export interface Feature {
  id: string;
  title: string;
  body: string;
  tag: string;
  span?: 'wide' | 'tall';
}

export const features: Feature[] = [
  {
    id: 'realtime',
    title: '实时指标流',
    body: '事件毫秒级入库,核心指标随产品脉动实时更新。再也不用等到第二天才发现问题。',
    tag: '实时',
    span: 'wide',
  },
  {
    id: 'funnels',
    title: '漏斗与留存',
    body: '拖拽即可搭建转化漏斗与留存曲线,定位流失发生在哪一步。',
    tag: '分析',
  },
  {
    id: 'alerts',
    title: '智能告警',
    body: '为任意指标设阈值或异常检测,异动第一时间推送到团队。',
    tag: '告警',
  },
  {
    id: 'segments',
    title: '用户分群',
    body: '按行为、属性、来源自由组合分群,理解不同用户的真实路径。',
    tag: '分群',
    span: 'tall',
  },
  {
    id: 'sql',
    title: '直达底层数据',
    body: '可视化之外随时切到 SQL,所有图表都能一键导出查询,不锁死在面板里。',
    tag: '开放',
  },
  {
    id: 'collab',
    title: '协作与看板',
    body: '把图表钉成共享看板,评论、订阅、定时报告,让结论在团队里流转。',
    tag: '协作',
    span: 'wide',
  },
];

export interface Metric {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
}

export const metrics: Metric[] = [
  { label: '接入团队', value: '4,200+', delta: '本季 +18%', trend: 'up' },
  { label: '日处理事件', value: '38 亿', delta: '同比 +64%', trend: 'up' },
  { label: '查询 P95 延迟', value: '120ms', delta: '环比 -22%', trend: 'down' },
  { label: '服务可用性', value: '99.98%', delta: '过去 90 天', trend: 'up' },
];

export interface WorkflowStep {
  id: string;
  title: string;
  body: string;
}

export const workflow: WorkflowStep[] = [
  {
    id: 'connect',
    title: '接入数据源',
    body: '几行 SDK 或一次无埋点接入,Web、移动端、服务端事件统一汇入。',
  },
  {
    id: 'explore',
    title: '探索与建模',
    body: '拖拽搭图、定义指标与漏斗,或直接写 SQL,所见即所得。',
  },
  {
    id: 'monitor',
    title: '监控与告警',
    body: '把关键指标做成看板,设好阈值,异动自动推送到 Slack 或邮件。',
  },
  {
    id: 'decide',
    title: '协作做决策',
    body: '分享结论、订阅报告,让数据驱动每一次产品迭代。',
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: '接入第一周就定位到一个埋了三个月的注册流失点,Vela 让我们少走了很多弯路。',
    name: '陈思远',
    role: 'Northwind · 增长负责人',
    initials: 'SC',
  },
  {
    quote: '从可视化一键切到 SQL 这点太关键了,数据团队和产品团队终于看的是同一份事实。',
    name: 'Maya Lindqvist',
    role: 'Lumio · 数据平台主管',
    initials: 'ML',
  },
  {
    quote: '告警准、面板快,P95 延迟比我们自建的方案低一个数量级,运维心智负担小了很多。',
    name: '黄宇航',
    role: 'Cobalt · 平台工程',
    initials: 'YH',
  },
  {
    quote: '看板和定时报告让非技术同事也能自己看数,周会效率肉眼可见地提升。',
    name: 'Priya Nair',
    role: 'Aster · 产品运营',
    initials: 'PN',
  },
];

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  blurb: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

export const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 0,
    priceYearly: 0,
    blurb: '适合个人项目与小团队起步。',
    features: ['每月 100 万事件', '核心指标与漏斗', '7 天数据保留', '社区支持'],
    cta: '免费开始',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 99,
    priceYearly: 79,
    blurb: '成长期团队最常选,功能全开。',
    features: [
      '每月 5000 万事件',
      '智能告警与异常检测',
      '12 个月数据保留',
      'SQL 直查与导出',
      '优先邮件支持',
    ],
    cta: '开始 14 天试用',
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: -1,
    priceYearly: -1,
    blurb: '面向规模化组织的安全与合规。',
    features: [
      '不限事件量',
      'SSO / SAML 与审计日志',
      '私有部署可选',
      '专属 SLA 与客户成功',
      '数据驻留合规',
    ],
    cta: '联系销售',
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: '接入 Vela 需要多久?',
    a: '前端几行 SDK 即可上报事件,常见框架有现成集成。多数团队在半天内就能看到第一批实时数据。',
  },
  {
    q: '我的数据安全吗?',
    a: '传输与存储全程加密,支持数据驻留区域选择;Enterprise 方案提供 SSO、审计日志与私有部署。',
  },
  {
    q: '可以导出原始数据吗?',
    a: '可以。所有图表都能切换到底层 SQL 并导出,也支持定时同步到你自己的数据仓库,绝不锁死。',
  },
  {
    q: '超出套餐事件量会怎样?',
    a: '我们会提前提醒,不会直接停服。你可以平滑升级套餐,或按用量阶梯计费,费用始终可预期。',
  },
  {
    q: '支持团队协作吗?',
    a: '支持。看板可共享、评论、订阅,并能设置定时报告推送到 Slack 或邮箱,让结论在团队里流转。',
  },
];

export const footer = {
  columns: [
    {
      title: '产品',
      links: ['实时指标', '漏斗与留存', '智能告警', '用户分群', '看板'],
    },
    {
      title: '资源',
      links: ['文档', 'API 参考', '更新日志', '状态页', '路线图'],
    },
    {
      title: '公司',
      links: ['关于我们', '博客', '招聘', '联系销售', '隐私政策'],
    },
  ],
  copyright: '© 2026 Vela. 用 @magic-scope 组件库构建。',
} as const;

/* ----- 应用 dashboard 的 mock 数据 ---------------------------------------- */

export interface Kpi {
  id: string;
  label: string;
  value: string;
  delta: number;
  spark: number[];
}

export const kpis: Kpi[] = [
  {
    id: 'active',
    label: '活跃用户',
    value: '24,810',
    delta: 12.4,
    spark: [12, 18, 15, 22, 19, 28, 31, 27, 34, 38],
  },
  {
    id: 'events',
    label: '今日事件',
    value: '1.92M',
    delta: 8.1,
    spark: [40, 38, 44, 41, 49, 52, 48, 56, 61, 64],
  },
  {
    id: 'conv',
    label: '转化率',
    value: '6.8%',
    delta: -1.5,
    spark: [8, 7.5, 7.8, 7.2, 7, 6.9, 7.1, 6.8, 6.6, 6.8],
  },
  {
    id: 'p95',
    label: '查询 P95',
    value: '118ms',
    delta: -9.2,
    spark: [180, 172, 165, 150, 142, 138, 130, 126, 121, 118],
  },
];

/** 7×24 折线主图的样本序列(两条:本周 / 上周)。 */
export const trafficSeries = {
  thisWeek: [820, 932, 901, 1190, 1230, 1620, 1480, 1720, 1650, 1980, 2140, 2010],
  lastWeek: [700, 760, 810, 880, 940, 1120, 1080, 1260, 1190, 1410, 1520, 1490],
  labels: [
    '08:00',
    '10:00',
    '12:00',
    '14:00',
    '16:00',
    '18:00',
    '20:00',
    '22:00',
    '00:00',
    '02:00',
    '04:00',
    '06:00',
  ],
} as const;

export interface EventRow {
  id: string;
  name: string;
  user: string;
  source: 'Web' | 'iOS' | 'Android' | 'API';
  status: 'success' | 'warning' | 'failed';
  count: number;
  time: string;
}

export const eventRows: EventRow[] = [
  {
    id: 'e1',
    name: 'checkout.completed',
    user: 'u_4821',
    source: 'Web',
    status: 'success',
    count: 1284,
    time: '2 分钟前',
  },
  {
    id: 'e2',
    name: 'signup.started',
    user: 'u_9930',
    source: 'iOS',
    status: 'success',
    count: 842,
    time: '5 分钟前',
  },
  {
    id: 'e3',
    name: 'payment.retry',
    user: 'u_1177',
    source: 'API',
    status: 'warning',
    count: 96,
    time: '8 分钟前',
  },
  {
    id: 'e4',
    name: 'export.failed',
    user: 'u_5540',
    source: 'Web',
    status: 'failed',
    count: 14,
    time: '12 分钟前',
  },
  {
    id: 'e5',
    name: 'session.start',
    user: 'u_2093',
    source: 'Android',
    status: 'success',
    count: 3120,
    time: '14 分钟前',
  },
  {
    id: 'e6',
    name: 'feature.enabled',
    user: 'u_7781',
    source: 'Web',
    status: 'success',
    count: 408,
    time: '20 分钟前',
  },
  {
    id: 'e7',
    name: 'webhook.timeout',
    user: 'u_6620',
    source: 'API',
    status: 'warning',
    count: 31,
    time: '26 分钟前',
  },
];

export interface Activity {
  id: string;
  who: string;
  what: string;
  when: string;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

export const activity: Activity[] = [
  { id: 'a1', who: 'Maya', what: '创建了看板「Q3 北极星指标」', when: '刚刚', tone: 'primary' },
  {
    id: 'a2',
    who: '系统',
    what: '告警:支付失败率超过 2% 阈值',
    when: '18 分钟前',
    tone: 'warning',
  },
  { id: 'a3', who: '宇航', what: '将「注册漏斗」订阅为每日报告', when: '1 小时前', tone: 'info' },
  { id: 'a4', who: 'Priya', what: '导出了「留存队列」查询结果', when: '3 小时前', tone: 'success' },
  { id: 'a5', who: '思远', what: '邀请了 2 位成员加入工作区', when: '昨天', tone: 'primary' },
];

export interface Member {
  name: string;
  email: string;
  role: '管理员' | '成员' | '只读';
  initials: string;
  active: boolean;
}

export const members: Member[] = [
  { name: '陈思远', email: 'siyuan@vela.app', role: '管理员', initials: 'SC', active: true },
  { name: 'Maya Lindqvist', email: 'maya@vela.app', role: '成员', initials: 'ML', active: true },
  { name: '黄宇航', email: 'yuhang@vela.app', role: '成员', initials: 'YH', active: false },
  { name: 'Priya Nair', email: 'priya@vela.app', role: '只读', initials: 'PN', active: true },
];

export const sidebarNav = [
  { id: 'overview', label: '概览', view: 'overview' },
  { id: 'events', label: '事件流', view: 'events' },
  { id: 'funnels', label: '漏斗', view: 'overview' },
  { id: 'segments', label: '分群', view: 'overview' },
  { id: 'alerts', label: '告警', view: 'overview' },
  { id: 'team', label: '团队', view: 'team' },
] as const;
