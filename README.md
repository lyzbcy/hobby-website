# 我的爱好世界 | My Hobby Universe 🌟

一个展示个人爱好的静态网站，采用知识图谱风格，具有动态弹性动画效果。

## ✨ 特性

- **知识图谱式展示** - 以思维导图形式展示爱好及其成果
- **动态弹性动画** - 节点弹跳、浮动背景、粒子效果
- **阳光明亮主题** - 温暖的渐变色彩和柔和的视觉效果
- **响应式设计** - 适配桌面和移动设备
- **交互式体验** - 点击节点查看详情，拖拽移动节点

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| HTML5 | 页面结构 |
| CSS3 | 样式与动画 |
| JavaScript | 交互逻辑 |
| [D3.js](https://d3js.org/) | 力导向图渲染 |

## 🚀 本地运行

由于使用了 ES 模块，需要通过 HTTP 服务器运行：

```bash
# 方式 1：使用 Python
python -m http.server 8080

# 方式 2：使用 Node.js
npx serve .

# 方式 3：使用 VS Code Live Server 插件
```

然后访问 `http://localhost:8080`

## 📦 部署到 GitHub Pages

### 方式一：直接部署

1. 在 GitHub 创建仓库（如 `hobby-website`）

2. 推送代码：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/hobby-website.git
   git push -u origin main
   ```

3. 启用 GitHub Pages：
   - 进入仓库 Settings → Pages
   - Source 选择 `main` 分支
   - 保存后等待部署完成

4. 访问 `https://你的用户名.github.io/hobby-website/`

### 方式二：使用 GitHub Actions（自动部署）

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## 📁 项目结构

```
hobby website/
├── index.html          # 主页面
├── css/
│   ├── main.css        # 主样式
│   └── animations.css  # 动画效果
├── js/
│   ├── data.js         # 爱好数据
│   ├── graph.js        # 知识图谱逻辑
│   └── animations.js   # 动画控制
├── assets/
│   └── images/         # 图片资源
└── README.md           # 说明文档
```

## 🎨 自定义爱好

编辑 `js/data.js` 文件修改你的爱好内容：

```javascript
hobbies: [
    {
        id: 'your-hobby',
        name: '你的爱好',
        icon: '🎯',
        color: '#FF6B6B',
        description: '爱好描述...',
        achievements: [
            {
                title: '成果标题',
                description: '成果描述',
                tag: '标签'
            }
        ]
    }
]
```

## 📄 许可证

MIT License
