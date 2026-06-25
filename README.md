# 题霸 QuestionMaster 📚

你的随身刷题神器 - React Native Android 应用

## 功能特性

✅ **核心功能**
- 📤 试题导入：支持 Excel (.xlsx/.xls) 和剪贴板文本导入
- 🔍 悬浮窗搜题：全局悬浮球，随时搜索答案
- 📝 模拟答题：计时练习、自动评分、错题记录
- 📊 统计分析：答题正确率、进度跟踪
- 📖 错题本：自动收集错题，支持反复练习

## 技术栈

| 组件 | 技术 |
|------|------|
| 框架 | React Native 0.76.6 |
| 语言 | JavaScript / TypeScript |
| 数据库 | SQLite (react-native-sqlite-storage) |
| 导航 | React Navigation 6 |
| 悬浮窗 | Android 原生 Service + WindowManager |
| 文件导入 | react-native-document-picker + xlsx |

## 快速开始

### 1. 环境准备

```bash
# Node.js >= 18
# Java Development Kit (JDK) 17
# Android Studio (含 Android SDK)

# 安装依赖
npm install

# iOS 用户
cd ios && pod install && cd ..
```

### 2. 开发模式运行

```bash
# 启动 Metro 打包器
npm start

# 新终端运行 Android
npm run android
```

### 3. 构建 APK

```bash
# Debug 版本
npm run build:debug

# Release 版本 (需配置签名)
npm run build:apk
```

APK 输出位置：`android/app/build/outputs/apk/`

---

## 项目结构

```
question-app/
├── src/
│   ├── screens/          # 界面组件
│   │   ├── HomeScreen.js       (主页)
│   │   ├── SearchScreen.js     (搜题)
│   │   ├── PracticeScreen.js   (答题)
│   │   └── ImportScreen.js     (导入)
│   ├── services/         # 业务逻辑
│   │   ├── database.js         (SQLite 数据库)
│   │   ├── floatingWindow.js   (悬浮窗)
│   │   └── excelImporter.js    (Excel 导入)
│   └── utils/            # 工具函数
├── android/              # Android 原生代码
├── App.js                # 应用入口
└── package.json
```

---

## Excel 导入格式

| 列名 | 说明 | 必填 |
|------|------|------|
| 题目 | 题干内容 | ✅ |
| 选项 A | 选项 A 内容 | ❌ |
| 选项 B | 选项 B 内容 | ❌ |
| 选项 C | 选项 C 内容 | ❌ |
| 选项 D | 选项 D 内容 | ❌ |
| 答案 | A/B/C/D | ✅ |
| 解析 | 答案解析 | ❌ |
| 分类 | 题目分类 | ❌ |
| 难度 | 1-5 星 | ❌ |

---

## Android 权限配置

应用需要以下权限：

```xml
<!-- 悬浮窗 -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

<!-- 文件读写 -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- 前台服务 -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

**首次使用悬浮窗时**，应用会引导用户到系统设置开启权限。

---

## 开发计划

### Phase 1 ✅ 核心框架
- [x] 项目初始化
- [x] 数据库服务
- [x] 主界面 + 导航
- [x] 搜题界面
- [x] 答题界面
- [x] 导入界面

### Phase 2 🟡 进行中
- [ ] 悬浮窗原生模块完善
- [ ] 搜索联调
- [ ] 错题本完整功能

### Phase 3 ⏳ 待开发
- [ ] 答题历史统计图表
- [ ] 多种练习模式 (顺序/随机/错题重做)
- [ ] 云同步 (可选)
- [ ] 主题切换

---

## 常见问题

### Q: 悬浮窗不显示？
A: 需要手动在系统设置中授予"悬浮窗"或"在其他应用上层显示"权限。路径：设置 → 应用管理 → 题霸 → 权限 → 悬浮窗

### Q: Excel 导入失败？
A: 检查 Excel 格式是否符合要求，第一行必须是表头，答案列必须为单个字母 A/B/C/D

### Q: 搜索不到题目？
A: 确保已导入试题，搜索支持关键词模糊匹配 (题干/答案/解析)

---

## 开发者

🛠️ 由 React Native + OpenClaw 联合生成  
📅 2026-06-24 启动开发  

---

## License

MIT - 个人学习使用
