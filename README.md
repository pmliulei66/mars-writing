# mars-writing

"书灯笔记"公众号 Claude Code 写作技能。用一本书，点亮一盏灯。

包含两个 Claude Code skill：
- **mars-writing** — AI 写作人格（选书、开头、正文、标题、去痕）
- **wechat-studio** — 微信公众号工具（Markdown→HTML 转换、草稿发布）

## 快速开始

### 1. Clone 仓库

```bash
git clone https://github.com/pmliulei66/mars-writing.git
cd mars-writing
```

### 2. 运行安装脚本

**Mac / Linux:**
```bash
bash setup.sh
```

**Windows:**
```cmd
setup.bat
```

安装脚本会：
- 检查 Node.js 版本（需要 >= 20）
- 将两个 skill 链接到 `~/.claude/skills/`
- 安装 npm 依赖
- 创建数据目录 `~/.mars-writing/`
- 检查微信凭证配置

### 3. 配置微信公众号

创建配置文件 `~/.config/wechat-studio/config.yaml`：

```yaml
wechat:
  appid: 你的AppID
  secret: 你的AppSecret
```

获取凭证：[微信开发者平台](https://developers.weixin.qq.com/platform) → 控制台 → 公众号 → 基础信息 / 开发秘钥

### 4. 重启 Claude Code

安装完成后重启 Claude Code，新技能会自动加载。

## 使用方式

在 Claude Code 中直接对话：

| 命令 | 说明 |
|------|------|
| "写一篇《XXX》书评" | 完整 7 步流程：选书→开头→正文→标题→去痕→排版→发布 |
| "优化这篇文章" | 从第 5 步（去痕）开始 |
| "生成 5 个标题" | 只执行标题生成 |
| "推荐几本书" | 选书推荐 |

## 仓库结构

```
mars-writing/
├── setup.sh / setup.bat     # 安装脚本
├── README.md
├── LICENSE (MIT)
├── .env.example              # 微信凭证模板
├── skills/
│   ├── mars-writing/         # 写作人格 skill
│   │   ├── SKILL.md
│   │   ├── references/       # 书单、去痕规则、写作哲学、模板
│   │   └── evals/            # 测试用例
│   └── wechat-studio/        # 微信工具 skill
│       ├── package.json
│       ├── lib/              # 核心模块
│       ├── scripts/          # CLI 入口
│       ├── themes/           # 排版主题
│       └── writers/          # 写作风格
└── .github/workflows/ci.yml  # CI
```

## 数据目录

用户数据存储在 `~/.mars-writing/`（不在仓库中）：

```
~/.mars-writing/
├── articles/     # 生成的文章（.md + .html）
├── records/      # 写作记录（标题备选、评分）
└── read-books.json  # 已读书单追踪
```

## 前置条件

- Node.js >= 20.0.0
- Claude Code（已安装并配置）
- 微信公众号（需要 AppID 和 AppSecret）

## License

MIT
