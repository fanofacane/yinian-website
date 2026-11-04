# 动效迁移记录 · 2026-10-24

## 根因与实现边界

上一版把优势插图保存为 HTML/CSS，移除了原组件状态；首屏另写了轮播，流程线只按 active 索引更新。页面外观和按钮测试无法发现这些丢失。此次按发布脚本和原运行页面分别核对，将交互迁入单一 React 应用的 `site/src/motion/`，原项目没有改动。

Sevora、Launchfolio 已恢复脚本的 REA 记录已复用，未重复完整分析：

- Sevora `ev_8550f27865f82f50105eb8a8193d9ee6238885842ec038b076e7230f18301950`
- Launchfolio `ev_62456801bf5b15c01327688960d88ebaf0c2457e76444911b47bf7e2f20cba9d`

这些是静态应用图证据；实际触发位置、位移和速度另用本机原复刻运行时 4173/4175 观测。此次未重新访问在线站点，不能证明站点之后没有更新。

## 按区块核对

后续修正：用户指出 Benefits 标题区域仍为静态。原首页 `.framer-193i921` Header 包含 Benefits 徽标、标题和说明，整体 `y64 → 0`，两端 opacity 均为1，spring stiffness500/damping60/mass1，onInView。此前只给下方卡片接入动画，遗漏了这个父级。现对完整标题容器接入同一动画系统，并使 spring 的刚度、阻尼和初始透明度可按来源分别配置，不将此标题错误做成淡入或逐词效果。专项对照脚本：`benefits_heading_checks.py`。

| 区块 | 原始证据与观测 | 当前实现 |
| --- | --- | --- |
| Sevora 导航 | `6b318a57-XWc81DvYX.js`，顶部普通导航与固定 Flyout；scroll marker top148/height32，Flyout y−84→0，内层52px高；桌面断点1200 | 一个语义导航在两个位置切换，148–180px区间浮出；品牌、链接、CTA保留。字体按用户要求为 Switzer。 |
| 手机菜单 | `dacdf076-OjqPar11G.js`，全屏白色、链接top84、gap8、底部CTA；原回弹过渡0.4s | 全屏菜单、滚动锁定、Escape、锚点跳转，0.4s过渡。未复制原Framer Portal。 |
| Hero 文本 | `976934f6-augiA20Il.js`，blur5/y10、逐词0.05s、初始delay0.2s、duration0.8s、ease(.4,0,.2,1)，入视50%一次触发 | Web Animations + IntersectionObserver，使用对应参数；标题、说明、状态标签和CTA分别入场。 |
| Hero 叠图 | 原四张图来自下方 Projects，x/y/scale/rotate随滚动回到网格，初始角度10/15/−5/5 | 保留角度与入场opacity/scale.8/y200，删除误加轮播，首屏内做有界滚动展开。**没有作品区，无法复制原终点**；图片查看弹层是组合预览功能，非原站详情页。 |
| Logo ticker | `c4c97358-iBXfMY010.js`，draggable、velocity100、hoverModifier100；实际约100px/s | 原速度、可拖拽、悬停继续、无限衔接；离屏/后台暂停、减少动画停止自动移动。 |
| Benefits | `72ea7b69-augiA20Il.js`，内部元素x±96/−128或y96入场，spring300/60，数据层250/60；四处dragMomentum false、snapToOrigin、bounce400/30 | 原DOM/SVG加独立事件和物理弹簧；设计面板、数据浮层、资料卡、爱心可拖动回弹；向上滚离后重播。没有添加无证据的无限漂浮动画。 |
| Process | `808ffcc7-CardCenterScrollProgress.js`、`5682203a-yuy6JgevM.js`、`c2cdcbeb-NfOkyOHnu.js`；轨道按视口中心与卡片中心分段映射，白底以卡片顶部到达50%触发 | 轨道、图标、卡片表面独立。卡片采用500/60/mass1弹簧，透明度.8→1；图标即时切换。轨道使用真实高度与各卡中心分段计算，ResizeObserver同步手机卡片高度变化，支持反向滚动。 |
| Reviews | 标题逐词入场；6卡初始x−5/−10/−15，delay0/.1/.2/.3/.4/.5，duration.6；手机<=767禁用卡片入场 | 对应桌面入场；手机原生横滑，去掉原本误加的mandatory scroll snap，不添加自动轮播。 |
| FAQ | `61545cd2-BSkxH9F6S.js`，独立开关，spring600/60，plus45°，桌面hover背景f7f7f8；首页标题y64/条目y96、opacity0→1、spring500/60入视 | 标题和条目独立入视；高度和加号按同一600/60弹簧采样，快速反向操作从当前高度/角度接续。点击卡片答案区域也可收起，键盘按钮保持可访问。桌面悬停反馈保留。 |
| Cursor | `fd33d3f2-TMY2tIZqI.js`与`0e8b49e4-aQoZMpzSK.js`；16px、exclusion、跟随spring500/60；实测相对鼠标x0/y8 | 桌面圆点按同弹簧跟随；触屏/减少动画关闭，不给所有按钮虚构Grow变体。 |
| 页面滚动 | `dd6473e4-Lenis.js`，Lenis1.3.25，duration.8、smoothWheel、autoRaf、autoToggle、anchors、allowNestedScroll、syncTouch false | 提取原包纯核心，文件头保留来源与SHA256；模态弹窗/手机菜单锁定，减少动画时销毁，触屏保持原生。 |

## 精度限制

这是保留指定区块后的行为迁移，不是将两个完整 Framer 应用嵌入页面。容器、导航锚点、统一字体及项目区删减使部分跨区块动画需要适配。导航浮出采用直接滚动插值，菜单采用CSS过渡；流程卡片采用原弹簧参数采样，但并未复用完整Framer动画驱动。Benefits内部元素目前按各插图host进入视口触发，与原七个元素各自触发的时间可能相差几十像素。流程右列原本在整页加载时执行的y192入场未迁入；左侧标题已接入原y64入视弹簧。无逐帧完全一致的声明。

## Process 二次结构核对

此前右列把图标和文字一起置于淡化卡片内，使用偏大的尺寸与贯穿容器的轨道，导致层级、对齐和滚动状态均有偏差。此次恢复独立图标/卡片表面/轨道结构：桌面1200px容器、双栏96px间距、右列576px（1440px视口）；卡片24/24/24/88px内边距、16px圆角、标题20/30px、正文16/24px。图标40px，左/上偏移24px；轨道从图标内部起止，移除头尾外露线段。小于1200px改单列，手机卡片间距8px、正文14/20px、激活后内部间距8→4px。字体保留用户指定的Switzer，因此换行与原字体可能不同。

证据为 `research/process-source-fragment.txt`、`qa/process-audit.json` 和原/组合截图。`process_checks.py` 在390/768/1024/1440/1920宽度检查中线触发、弹簧中间态、图标即时切换、反向恢复、连续线条、减少动画、六卡终点、字体和横向溢出，全部通过。结果见 `qa/process-checks.json`。

## 回归入口

FAQ二次核对：之前使用了公共标题样式、大屏960px列表和偏大的行高，且只实现开关，遗漏父级及条目入场。现恢复768px列表、560px标题容器、标题36/48px、说明及问题/答案16/24px、24px内边距、16px圆角。桌面条目gap12，平板/手机gap8；手机标题左对齐，标题至列表40px（桌面64px）。答案最大文字宽度640px。全站Switzer要求继续保留。原脚本和本地原版运行时证据记录于`qa/faq-audit.json`，修正后证据见`qa/faq-checks.json`、`qa/faq-corrected-*.png`。原Framer布局驱动未整包加载，悬停背景仍采用0.2s CSS过渡。

- `python -X utf8 faq_checks.py`：390/768/1024/1440/1920五档，入场初始/结束状态、布局、展开与图标同步中间态、答案点击收起、快速反向、八项独立开关、键盘Enter/Space、减少动画和溢出。全部通过。

- `python -X utf8 motion_checks.py`：实际滚轮惯性、导航浮出/菜单、光标、4处拖动回弹、连续流程线、16次FAQ切换、横向评价、Logo速度/拖动、表单与弹窗锁定、减少动画、非本地请求检查。
- `python -X utf8 verify.py`：360/390/768/1440/1920尺寸、资源、溢出、字体、区块顺序及截图。
- `python -X utf8 final_checks.py`：可见文字与Shadow DOM字体、手机横滑、流程终点、减少动画。
- `python -X utf8 touch_checks.py`：coarse pointer下用TouchEvent验证菜单、拖拽回弹、横滑评价、FAQ点击与触屏隐藏光标。

结果写入 `qa/motion-checks.json`、`qa/layout-checks.json`、`qa/final-checks.json` 和 `qa/touch-checks.json`，全部通过。浏览器为Edge/Chromium，包含触屏事件模拟；真实iOS/Android设备与Safari未覆盖。

2026-10-24 用户要求为三项服务配置业务场景图片后，原Benefits装饰图及内部拖拽已被照片替代，旧插图保真记录仅作历史证据；标题和卡片入场仍沿用原spring参数。当前运行时不再导入benefitMotion或benefit-art资源。
