# 自有官网 · 页面组合版

构建预览：http://127.0.0.1:4178/ （完整预渲染 HTML + 真实404）

开发服务器：http://127.0.0.1:4177/ （Vite热更新，仅供开发，不作为SEO验收入口）

本项目独立于 Sevora（4173）和 Launchfolio（4175）。当前品牌与正文已填入《一念智能官网内容清单.md》，图片、头像、字体、视觉与动画继续保留参考组合。客户名称和评价为本地拟稿，尚未核实为真实背书。

## 已确认的组合

1. Sevora 导航栏与统一斜纹背景。
2. Launchfolio 首屏布局，叠图替换为四张AI生成的企业实际业务场景示意素材（工作台、培训、流程、知识库），保留四项服务数据和客户 Logo；标题采用中文黑体。旧抽象科技图已停用。
3. 原Benefits三卡布局：老板课、方案班、企业AI落地；各自使用AI生成的具体业务场景图片。
4. 原Process双栏布局：咨询、培训、陪跑、Agent开发、AI使用资源支持五项服务。
5. 原Testimonials布局：四条拟定评价，加重复前两条，共六张卡片。
6. 原FAQ布局：清单中的六项问答。

7. 用户新指定的深色纹理页脚，以及首页/404页共用的四个右侧悬浮按钮。

整站保留 Launchfolio 的 Switzer，首屏标题按最新要求明确使用中文黑体回退。导航保留滚动行为，右端改为电话和“免费方案”，菜单对应当前首页的五个锚点。手机首屏沿用内容优先布局，隐藏桌面叠图。

联系方式集中在 `site/src/SiteChrome.jsx`。用户确认电话使用4000000占位；微信面板使用本地生成的SVG二维码，扫码内容为“一念智能官网预览占位”，不连接真实微信。没有复制第三方公司地址、备案和二维码。页脚使用一念智能服务信息。

## 交互

- 顶部导航随文档滚动离开，滚动后浮出紧凑导航；手机和平板使用全屏菜单，支持 Escape 关闭和区块跳转。
- 首屏文字逐词模糊入场、叠图入场和滚动展开；删除原本误加的前后切换轮播。原叠图的终点属于未保留的作品区，当前限定在首屏内展开。大图查看仍是组合版预览功能。
- 服务区标题和卡片保留进入视口的弹簧动画；旧设计工具插图及内部拖拽已由用户新指定的三张服务场景图片替代。
- 客户 Logo 按原速度自动移动，可拖动，悬停继续播放。
- 流程标题随滚动固定，右侧步骤在顶部到达视口中心时高亮，进度线连续跟随视口中心。
- 客户评价桌面采用三列网格，手机沿用原站的横向滑动卡片。
- FAQ 按原弹簧参数独立展开/关闭，保留加号旋转、悬停背景和键盘操作。
- 使用原发布脚本里的 Lenis 1.3.25 核心平滑滚动；桌面保留跟随鼠标的圆点。
- 联系按钮打开预览表单，草稿仅保存在当前浏览器，不发送邮件。正式联系方式接入留待后续品牌内容确定。
- 四个右侧按钮支持返回顶部、电话悬停展开/触屏点击、在线咨询弹窗、微信面板。使用原生details保留无JS点击能力；404页使用同一组件进行预渲染与水合。
- 系统减少动画偏好生效。

## 项目结构

服务配图：`assets/generated-services/`保存原图，`research/service-image-prompts.json`保存完整内置image_gen提示词，`site/src/service-images.json`映射480/800/1200宽WebP版本，`research/prepare_service_images.py`负责网页编码。

首屏原创素材：`assets/generated-hero/`保存四张生成原图；`research/hero-image-prompts.json`记录内置image_gen完整提示词；`site/src/hero-images.json`管理中文名称、alt、640/1024/1672宽WebP版本。`research/prepare_generated_hero.py`仅负责网页编码与尺寸版本，不修改原图。其他图片保持原样。点击叠图打开1672宽版本。

```text
our-studio/
├── AGENTS.md                    # 用户确认的组合及字体约定
├── README.md
├── design-qa.md                 # 视觉及交互验收
├── package.json                 # 独立 dev/build/preview 入口
├── asset-provenance.json        # 资源来源
├── source-inspection.json       # 两站结构与样式证据
├── references/                 # 用户提供的六张参考图
├── qa/                         # 浏览器截图、配对图、检查结果
├── extract_design.py            # 原图形、字体、内容采集
├── prepare_content.py           # 形成干净的内容数据
├── verify.py                    # 多尺寸页面检查
├── interaction_checks.py        # 主要交互检查
├── motion_checks.py             # 动画、拖拽、连续进度、滚动锁定回归
├── motion-audit.md              # 原始脚本依据及组合适配边界
├── capture_comparisons.py       # 同视口来源区块配对
└── site/
    ├── src/App.jsx              # 导航、首屏、优势、流程、评价、FAQ
    ├── src/content.js           # 导航与内容映射
    ├── src/styles.css           # Switzer、统一背景、布局与断点
    ├── src/motion/              # 入场、拖拽、Ticker、光标、平滑滚动
    ├── src/reference/           # 原装饰图形、对应 CSS 与内容数据
    ├── public/assets/           # 独立复制的图片、图标与字体
    ├── scripts/prune-art-css.mjs # 仅保留装饰图形使用的原 CSS
    └── package.json             # React + Vite + Phosphor
```

运行代码只有一个 React 应用。优势卡片里的原装饰 DOM/CSS 被隔离在 Shadow DOM 内，保留原图形细节；没有将两个完整 Framer 运行时放在一起，也不通过 iframe 或运行时跨项目请求拼接页面。

## 使用

```powershell
# 在 projects/our-studio 目录
npm run dev
npm run build
```

当前依赖已安装。新环境先执行 `npm install --prefix site`。构建后运行 `npm run preview`，默认在4178提供静态成品；4177开发服务器可以同时运行。

## 预渲染与 SEO

构建先由Vite输出浏览器资源，再生成仅在构建阶段使用的SSR模块，由`renderToString`将同一套App组件写入`dist/client/index.html`，最后保留Sites打包产物。浏览器用`hydrateRoot`接管现有正文。渲染模块位于`dist/render`，不在公开静态目录内。

无JS或脚本请求失败时，全部FAQ答案直接显示、移动导航展示普通链接；交互初始化后恢复原折叠和动画。运行时未捕获错误会取消动画隐藏状态并展开FAQ。联系表单和装饰插图仍需JS；无JS时隐藏不可用的联系按钮，正文始终保留。图片链接可直接打开图片，JS正常时继续使用原弹层。

首页包含title、description、canonical、robots、Open Graph和Twitter基础信息；生成robots.txt和只含首页的sitemap.xml。404页面自身noindex，服务端返回真实404和X-Robots-Tag。不存在的详情页不会伪装成首页；`/index.html`以308归一到`/`。

用户当前只需要本地版本，因此`SITE_URL`默认是`http://127.0.0.1:4178`。未来换域名时设置SITE_URL后重新构建，不要直接部署带localhost canonical/sitemap的产物。`PORT`可调整本地预览端口，需同步SITE_URL并重建。未部署线上，未宣称已经被搜索引擎收录。

验证：`python -X utf8 seo_checks.py`；`npm --prefix site run test:sites`。交互回归可设置`PREVIEW_URL=http://127.0.0.1:4178`后运行`motion_checks.py`、`touch_checks.py`、`faq_checks.py`和`process_checks.py`。首屏WebP转换与体积记录见`research/optimize_hero_images.py`及`qa/image-optimization.json`。

品牌内容保存在`site/src/brand-content.json`；导航与媒体映射在`site/src/content.js`，区块标题在`site/src/App.jsx`，SEO文案在`site/scripts/prerender.mjs`。`site/src/reference/content-data.json`保留原站资源数据，不再承担当前品牌正文。此次不新增案例区、统计区或页脚；Logo条保留原图片并补充企业/机构名称。中文使用现有字体栈的系统回退，未另换字体。
