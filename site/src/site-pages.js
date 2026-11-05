import { caseStudies } from './case-studies.js';

export const productGroups = [
  { id: 'courses', title: '课程', subtitle: '从理解 AI，到用好 AI', items: [
    { slug: 'boss-course', title: '老板课', label: '管理者的 AI 第一课', description: '建立 AI 认知，把经营问题转化为可以行动的方向。', image: 0, points: ['管理者 AI 认知与场景判断', '围绕日常任务进行工具实操', '形成可重复使用的任务模板'] },
    { slug: 'solution-workshop', title: '方案班', label: '带着问题来，带着方案走', description: '梳理业务场景、明确优先级，形成企业自己的实施计划。', image: 1, points: ['梳理真实业务问题与现有流程', '评估场景价值和实施条件', '明确试点方向、分工与实施路径'] },
  ] },
  { id: 'enterprise', title: '企业陪跑', subtitle: '让 AI 进入真实业务', items: [
    { slug: 'ai-delivery', title: '企业 AI 落地', label: '把方案推进到日常使用', description: '结合团队培训、流程改造与应用开发，推进真实场景落地。', image: 2, points: ['确认业务目标和实施前基线', '搭建应用并组织团队试用', '通过业务验收与复盘持续优化'] },
    { slug: 'ai-coaching', title: 'AI 转型陪跑', label: '有人一起，把流程做顺', description: '跟进场景试点与团队应用，培养企业内部的 AI 种子团队。', image: 1, points: ['选择优先试点的业务场景', '配合团队推进流程改造', '沉淀操作流程与阶段复盘'] },
    { slug: 'agent-development', title: 'Agent 定制开发', label: '把企业经验变成 AI 能力', description: '围绕知识库、业务助手与工作流，开发可调用的业务应用。', image: 2, points: ['明确资料范围与系统对接需求', '开发智能体或自动化工作流', '交付场景测试记录与维护文档'] },
  ] },
];
export const products = productGroups.flatMap(group => group.items.map(item => ({ ...item, category: group.title })));
export const pageRegistry = [
  { path: '/', title: '一念智能｜让每一家企业都能用好 AI', description: '企业 AI 落地一站式服务商，提供咨询、培训、陪跑与智能体开发服务。' },
  { path: '/cases', title: '案例与应用场景｜一念智能', description: '了解企业知识库、销售分析与方案自动化等 AI 业务应用场景。' },
  { path: '/about', title: '关于我们｜一念智能', description: '从实际业务需求出发，帮助企业把 AI 真正用出业务价值。' },
  ...caseStudies.map(item => ({ path:`/cases/${item.slug}`, title:`${item.title}｜一念智能`, description:item.problem })),
  ...products.map(item => ({ path: `/solutions/${item.slug}`, title: `${item.title}｜一念智能`, description: item.description })),
];
export const primaryLinks = [
  ['服务体系', '/#process'], ['案例', '/cases'], ['评价', '/#reviews'], ['FAQ', '/#faqs'], ['关于', '/about'],
];
