# 📱 GitHub Actions 云构建 APK 指南

## 🎯 为什么使用 GitHub Actions？

**解决你的问题:**
- ✅ 你的 ARM64 电脑无法运行 x86 AAPT2
- ✅ GitHub 提供免费的 x86-64 Ubuntu 服务器
- ✅ 自动构建，无需本地编译
- ✅ 每月 2000 免费分钟 (个人账号)

---

## 📋 使用步骤

### 1️⃣ 创建 GitHub 仓库

```bash
cd /home/cmcc/.openclaw/workspace/question-app

# 初始化 Git (如果没有)
git init

# 添加所有文件
git add .

# 创建第一次提交
git commit -m "Initial commit: 题霸 APP"
```

### 2️⃣ 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名：`question-master`
3. 设为 **Private** (私有)
4. 不要勾选 "Add README"
5. 点击 **Create repository**

### 3️⃣ 推送代码到 GitHub

```bash
# 替换 YOUR_USERNAME 为你的 GitHub 用户名
git remote add origin https://github.com/YOUR_USERNAME/question-master.git
git branch -M main
git push -u origin main
```

### 4️⃣ 等待自动构建

Push 后 GitHub Actions 会自动开始构建：

1. 访问 `https://github.com/YOUR_USERNAME/question-master/actions`
2. 看到绿色 ✅ 表示构建成功
3. 点击工作流 → 页面底部下载 `app-debug.apk`

### 5️⃣ 安装到手机

```bash
# 下载 APK 后
adb install app-debug.apk

# 或在手机上直接打开 APK 文件安装
```

---

## 🔧 后续使用

### 手动触发构建

```bash
# 修改代码后
git add .
git commit -m "更新功能"
git push

# 或手动触发
# 访问 https://github.com/YOUR_USERNAME/question-master/actions
# 点击 "Build Android APK" → "Run workflow"
```

### 下载 APK

1. 访问 Actions 页面
2. 点击最近的构建
3. 页面底部找到 "Artifacts"
4. 点击 `app-debug` 下载

---

## 📊 构建时间

| 阶段 | 时间 |
|------|------|
| 首次构建 | 10-15 分钟 (下载依赖) |
| 后续构建 | 3-5 分钟 (使用缓存) |

---

## 🆘 故障排查

### Q: 构建失败？
**A:** 查看 Actions 日志，常见错误：
- `OutOfMemoryError` → 增加 `org.gradle.jvmargs=-Xmx4096m`
- `SDK not found` → 检查 `local.properties`

### Q: 下载链接过期？
**A:** Artifact 保留 90 天，过期后重新触发构建

### Q: 想自动发布 Release？
**A:** 添加 `release` 触发器，详见 [GitHub Releases 文档](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

## 💰 免费额度

| 项目 | 免费额度 | 你的使用 |
|------|---------|---------|
| Actions 分钟 | 2000 分钟/月 | ~100 分钟/月 |
| 存储空间 | 500 MB | ~200 MB |
| Artifact 保留 | 90 天 | ✅ |

**完全够用！**

---

**创建好仓库后告诉我，我可以帮你配置自动发布！** 🚀
