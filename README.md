
# 小富翁股票投资游戏

这是一个使用原生 HTML、CSS 和 JavaScript 编写的股票投资模拟游戏，当前版本为 v9.1。



## 运行方式

由于浏览器最新的安全设置，浏览器无法直接打开 [index.html](index.html) 运行。

建议游玩方式：
- VS Code 插件 Live Server：右键 `index.html` → Open with Live Server
- Python：`python -m http.server 8080` → 访问 `http://localhost:8080`
- Node.js：`npx serve .` → 访问 `http://localhost:3000`
- 访问[这里](https://aka.doubaocdn.com/s/SbITktuct7)游玩（后续将不再更新）
- 游玩[旧版](old_edition.html)(后续将不再更新）



## 项目结构

```text
/
├── index.html
├── PROJECT_STRUCTURE.MD
├── README.md
├── assets/
│   └── css/
│       ├── style.css              # CSS 汇总入口
│       └── modules/
│           ├── 01-foundation.css  # 全局重置、主题、头部、健康忠告
│           ├── 02-setup.css       # 游戏设置、管理员、外接 AI 配置
│           ├── 03-game.css        # 游戏信息、玩家卡片、决策区域
│           ├── 04-buttons.css     # 按钮系统与按钮交互效果
│           ├── 05-panels.css      # 排行榜、AI 面板、图表、日志、横幅
│           ├── 06-modals.css      # 成就、通用信息、结果、事件、帮助、存档、密码
│           └── 07-responsive.css  # 附加样式与响应式布局
└── src/
    ├── main.js                    # JavaScript 模块加载器
    ├── core/
    ├── ui/
    ├── ai/
    ├── modules/
    ├── utils/
    └── config/
```



## JavaScript 分类

- `src/core/`：状态、股票算法、交易、决策、收盘、存档和游戏生命周期。
- `src/ui/`：界面更新、玩家卡片、日志、图表、模态框和事件绑定。
- `src/ai/`：场内 AI 与外接 AI。
- `src/modules/`：彩票、自建股、预测、成就、评级和黑马股等玩法。
- `src/utils/`：工具函数与密码验证。
- `src/config/`：管理员高级设置。

每个 JavaScript 文件保留原有的编号和章节注释，`src/main.js` 按 `01` 到 `33` 的顺序加载它们。



## CSS 维护

HTML 只引用 `assets/css/style.css`。该文件通过 `@import` 按顺序加载 `assets/css/modules/` 下的 7 个样式模块。

修改样式时，优先根据功能进入对应模块。若修改的是覆盖关系，请注意 `style.css` 中的导入顺序，后加载的规则可能覆盖前面的规则。





## 重要约定

- 当前 JavaScript 使用经典脚本和共享作用域，不要随意改成 ES Module，除非同步重构所有模块依赖。
- 保持 `src/main.js` 的模块加载顺序，因为各模块依赖前面模块定义的变量和函数。
- CSS 模块也要保持 `style.css` 中的导入顺序。
- Chart.js 目前通过 CDN 加载，需要网络连接；浏览器的 Tracking Prevention 提示属于浏览器隐私策略，不是项目语法错误。
- `favicon.ico` 缺失只会产生浏览器 404 提示，不影响游戏功能。



## 当前版本

- v9.1：收盘统一破产检测、破产救助金、直接结束游戏、外接 AI 和模块化目录结构。（这是GitHub上第一个版本）

### 我们任在不断升级中，欢迎提交issue讨论。

