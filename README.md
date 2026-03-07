# Nine-Chat Frontend V3

> 🎵 在线聊天室 + 音乐播放平台前端项目（Vue 3 重构版）

## ✨ 特性

- 💬 实时聊天：文字、图片、表情包
- 🎵 同步听歌：共享歌单、实时播放
- 🎤 双音源支持：酷狗 + 网易云音乐切换
- 🏠 房间系统：官方房间 + 用户私有房间
- 🎨 多主题支持：日间/夜间/透明主题
- 📱 响应式设计：适配多种屏幕尺寸
- 🤖 Bot 系统：支持自定义 Bot 接入

## 📦 技术栈

| 模块 | 版本 |
|------|------|
| Vue | v3.5.x |
| Pinia | v2.3.x |
| Vue Router | v4.5.x |
| Vite | v6.1.x |
| Socket.IO Client | v4.8.x |
| Element Plus | v2.9.x |
| Axios | v1.7.x |

## 🔄 相较旧版（V2）的升级

- **Vue 2 → Vue 3**：全面采用 `<script setup>` Composition API
- **Vuex → Pinia**：模块化状态管理（user / message / config / room / music / ui）
- **Vue CLI → Vite**：更快的开发服务器和构建速度
- **Element UI → Element Plus**：配合 `unplugin-auto-import` 实现按需引入
- **Socket.IO 插件 → Composable**：从 `vue-socket.io-extended` 迁移为纯函数式 `useSocket` 组合式函数
- **弹幕组件重写**：从 `vue-custom-barrage` 第三方库改为自定义实现

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

默认运行在 `http://localhost:3000`

### 3. 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录，资源按类型分类：
```
dist/
├── index.html
└── static/
    ├── js/       # JavaScript 文件
    ├── css/      # 样式文件
    ├── img/      # 图片与表情资源
    ├── fonts/    # 字体文件
    └── media/    # 音频文件
```

### 4. 代码规范检查

```bash
# 检查
npm run lint

# 自动修复
npm run lint:fix
```

## 📝 配置说明

### 环境变量

在 `.env.development` 和 `.env.production` 中配置：

```env
VITE_BASE_API=http://localhost:5000/api
VITE_WS_API=http://localhost:5000
```

### 部署说明

1. 执行 `npm run build` 生成 `dist` 目录
2. 将 `dist` 内容部署到 Web 服务器
3. 或将 `dist` 内容放入后端 `public` 目录，通过后端服务访问

## 🎵 功能说明

### 聊天功能
- 文字消息发送
- 图片/文件粘贴发送
- 表情包发送（支持多分类）
- 消息引用与撤回
- 消息历史记录
- 弹幕模式（ESC 切换）

### 音乐功能
- 🔍 歌曲搜索（支持酷狗/网易云切换）
- ▶️ 在线点歌
- ❤️ 歌曲收藏
- 📋 播放队列管理
- ⏭️ 切歌功能
- 🎵 歌词同步显示

### 房间功能
- 创建个人房间
- 房间密码保护
- 自定义房间背景
- 房间公告设置

### 快捷键
| 快捷键 | 功能 |
|--------|------|
| `ESC` | 切换聊天面板/弹幕模式 |
| `F1` ~ `F4` | 打开消息框功能面板 |
| `F8` ~ `F10` | 打开头部功能面板 |

## 🔗 相关链接

- [后端项目](https://github.com/longyanjiang/Nine-chat-backend)
- [在线体验](https://music-chat.mmmss.com/)

## ⚠️ 免责声明

音乐数据来源于第三方 API，仅供学习交流使用，请勿用于商业用途。

## 📄 License

MIT
