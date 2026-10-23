# 一念智能 官网

纯静态多页面网站（HTML / CSS / JS），无需构建、无需服务器，可直接部署到任意静态托管（GitHub Pages、阿里云 OSS、腾讯云 COS、Nginx 等）。

## 页面

| 文件 | 页面 |
| --- | --- |
| `index.html` | 首页 |
| `services.html` | 服务体系（五项服务详情） |
| `products.html` | 课程产品（老板课 / 方案班 / 企业 AI 落地） |
| `cases.html` | 客户案例（可按服务筛选）+ 客户评价 |
| `about.html` | 关于我们 + 完整 FAQ |
| `contact.html` | 预约咨询表单 + 联系方式 |
| `404.html` | 404 页面 |

资源：`assets/css/style.css`、`assets/js/main.js`、`assets/img/`（Logo、favicon）。

本地预览：直接双击打开 `index.html`，或在目录下运行 `python3 -m http.server` 后访问 http://localhost:8000 。

## 上线前必须替换

以下内容目前为占位或拟定内容，上线前请替换为真实、已获授权的资料：

- [ ] **Logo**：`assets/img/logo.svg`、`assets/img/favicon.svg`（当前为临时图形标）
- [ ] **联系方式**：电话 `400-XXX-XXXX`、邮箱 `contact@yourdomain.com`、办公地址——位于每个页面页脚及 `contact.html`（搜索 `TODO`）
- [ ] **微信二维码**：`contact.html` 中的 `.qr-box` 占位框，替换为 `<img>`
- [ ] **ICP 备案号 / 公司全称**：每个页面页脚
- [ ] **客户名称与 Logo**：首页、案例页、关于页的客户墙（当前为拟定名称）
- [ ] **客户评价**：4 条评价为拟定文案，需替换为真实原话并取得署名授权
- [ ] **客户案例**：6 个案例为拟稿，需替换为真实项目资料并取得客户授权
- [ ] **业务数据**：6 项数据需确认统计时间与口径
- [ ] **在线表单**：在 `assets/js/main.js` 顶部填写 `FORM_ENDPOINT`（接收 JSON POST 的接口地址）。未填写时，提交表单会提示访客改用电话/微信联系，不会发送数据
- [ ] **隐私政策**：如开通在线表单，建议补充隐私政策页面并在表单同意条款处链接

## 修改说明

页眉、页脚在每个 HTML 文件中各有一份，修改导航或联系方式时需同步修改所有页面（可用编辑器的全局查找替换）。
