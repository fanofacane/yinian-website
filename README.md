# 一念智能 官网

React + Vite 开发，构建时预渲染（SSG）：遍历路由表里的每个页面路径，把页面正文渲染成 HTML，输出到各自路径的 `index.html`。浏览器加载后由 React 接管（hydrate），交互随即生效。

- 每个页面都有完整的 HTML 正文、标题和描述，利于搜索引擎收录；关闭 JS 也能正常阅读。
- 产物是纯静态文件，可部署到任意静态托管（GitHub Pages、阿里云 OSS、腾讯云 COS、Nginx 等）。

## 常用命令

```bash
npm install       # 安装依赖（Node 20+）
npm run dev       # 本地开发，http://localhost:5173
npm run build     # 构建并预渲染，产物在 dist/
npm run preview   # 预览构建产物，http://localhost:4173
```

部署在子路径时（如 GitHub Pages 的 `https://<用户名>.github.io/yinian-website/`），构建时指定前缀：

```bash
BASE_URL=/yinian-website/ npm run build
```

## 构建产物

```
dist/
├── index.html            /
├── services/index.html   /services/
├── products/index.html   /products/
├── cases/index.html      /cases/
├── about/index.html      /about/
├── contact/index.html    /contact/
├── 404.html
└── assets/               JS、CSS
```

## 目录结构

```
index.html               HTML 模板（预渲染时填入 <head> 和正文）
scripts/prerender.js     预渲染脚本：遍历路由，逐个渲染并写出 index.html
src/
├── routes.js            路由表（路径、页面组件、标题、描述）——新增页面在这里加一行
├── entry-server.jsx     构建时：把某个路径渲染成 HTML 字符串
├── entry-client.jsx     浏览器端：hydrate 预渲染内容
├── App.jsx
├── data/content.js      全部文案与数据——改内容主要改这里
├── components/          Layout（页眉页脚）、Icon、通用区块
├── pages/               各页面组件
├── lib/url.js           站内链接（自动加部署前缀）
└── styles.css
public/                  Logo、favicon（原样复制到 dist）
```

构建流程（`npm run build`）：

1. `vite build`：打包浏览器端 JS/CSS，生成 `dist/index.html` 模板；
2. `vite build --ssr`：打包服务端渲染入口到 `.ssr/`；
3. `node scripts/prerender.js`：遍历 `routes.js`，用 `renderToString` 渲染每个页面，写入 `dist/<路径>/index.html`，最后清理 `.ssr/`。

## 交互

- 顶部导航滚动阴影、移动端折叠菜单
- 滚动渐显、数据数字滚动
- 服务体系页吸顶锚点导航（随滚动高亮）
- 客户案例按服务筛选
- 咨询表单：必填项与手机号校验、多选服务、提交状态提示

## 上线前必须替换

以下内容目前为占位或拟定内容，上线前请替换为真实、已获授权的资料：

- [ ] **Logo**：`public/logo.svg`、`public/favicon.svg`（当前为临时图形标）
- [ ] **联系方式、公司全称、ICP 备案号**：`src/data/content.js` 中的 `CONTACT`
- [ ] **微信二维码**：`src/pages/Contact.jsx` 中的 `.qr-box` 占位框，替换为 `<img>`
- [ ] **客户名称与 Logo**：`CLIENTS`（当前为拟定名称）
- [ ] **客户评价**：`TESTIMONIALS` 为拟定文案，需替换为真实原话并取得署名授权
- [ ] **客户案例**：`CASES` 为拟稿，需替换为真实项目资料并取得客户授权
- [ ] **业务数据**：`STATS` 需确认统计时间与口径
- [ ] **在线表单**：在 `src/data/content.js` 填写 `FORM_ENDPOINT`（接收 JSON POST 的接口）。未填写时，提交会提示访客改用电话/微信联系，不会发送数据
- [ ] **隐私政策**：如开通在线表单，建议补充隐私政策页面并在表单同意条款处链接
