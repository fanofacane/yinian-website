// 路由表：构建时会遍历这里的每个路径，各自输出一个 index.html
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import Products from './pages/Products.jsx';
import Cases from './pages/Cases.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

export const routes = [
  {
    path: '/', component: Home,
    title: '一念智能 · 企业AI落地一站式服务商',
    description: '一念智能——企业AI落地一站式服务商。从战略咨询、企业培训、AI 转型陪跑到智能体开发，助力企业高效拥抱人工智能时代。',
  },
  {
    path: '/services/', component: Services, title: '服务体系 - 一念智能',
    description: '一念智能企业 AI 落地服务体系：AI 战略咨询、企业 AI 培训、AI 转型陪跑、Agent 开发、Token 充值，五位一体完整闭环。',
  },
  {
    path: '/products/', component: Products, title: '课程产品 - 一念智能',
    description: '一念智能服务产品：老板课、方案班、企业 AI 落地，从管理者认知、场景方案到业务落地。',
  },
  {
    path: '/cases/', component: Cases, title: '客户案例 - 一念智能',
    description: '一念智能客户案例：制造、零售、专业服务、供应链、跨境贸易与职业教育等行业的 AI 落地实践。',
  },
  {
    path: '/about/', component: About, title: '关于我们 - 一念智能',
    description: '一念智能专注企业 AI 应用与落地，围绕咨询、培训、陪跑、产品与算力，提供覆盖企业 AI 转型全过程的一站式服务。',
  },
  {
    path: '/contact/', component: Contact, title: '联系我们 - 一念智能',
    description: '联系一念智能，预约企业 AI 落地咨询，了解老板课、方案班、企业 AI 落地等服务。',
  },
];

export const notFound = { path: '/404/', component: NotFound, title: '页面未找到 - 一念智能', description: '页面未找到' };

export function matchRoute(path) {
  return routes.find((r) => r.path === path) || notFound;
}
