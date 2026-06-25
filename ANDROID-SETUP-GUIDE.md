# Android 开发环境配置指南

**系统:** 银河麒麟桌面操作系统 V10 SP1 (Debian 基)  
**目标:** React Native + Android 开发环境  
**预计耗时:** 30-60 分钟 (取决于网络速度)

---

## 步骤 1: 安装 Java JDK 17

```bash
# 更新包索引
sudo apt update

# 安装 OpenJDK 17
sudo apt install -y openjdk-17-jdk

# 验证安装
java -version
javac -version
```

**预期输出:**
```
openjdk version "17.0.x" 2024-01-16
OpenJDK Runtime Environment (build 17.0.x)
OpenJDK 64-Bit Server VM (build 17.0.x, mixed mode, sharing)
```

---

## 步骤 2: 安装 Android 命令行工具

### 方案 A: 使用 Android Studio (推荐，图形界面)
```bash
# 下载 Android Studio
# 访问：https://developer.android.com/studio
# 下载 Linux 版本 (.tar.gz)

# 解压到 /opt
sudo tar -xzf android-studio-*.tar.gz -C /opt

# 启动
/opt/android-studio/bin/studio.sh
```

### 方案 B: 仅命令行工具 (轻量级)

```bash
# 创建 Android SDK 目录
mkdir -p /home/cmcc/Android/Sdk
cd /home/cmcc/Android/Sdk

# 下载命令行工具
# 访问：https://developer.android.com/studio#command-tools
# 下载 "Command line tools only" for Linux

# 假设下载到 ~/Downloads
cd ~/Downloads
mkdir -p /home/cmcc/Android/Sdk/cmdline-tools
unzip commandlinetools-linux-*.zip
mv tools /home/cmcc/Android/Sdk/cmdline-tools/latest

# 接受许可证
export ANDROID_HOME=/home/cmcc/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
yes | sdkmanager --licenses

# 安装必要组件
sdkmanager "platform-tools"
sdkmanager "platforms;android-33"
sdkmanager "build-tools;33.0.2"
```

---

## 步骤 3: 配置环境变量

编辑 `~/.bashrc` (或 `~/.zshrc`):

```bash
# 在文件末尾添加
export ANDROID_HOME=/home/cmcc/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/build-tools/33.0.2

# 使配置生效
source ~/.bashrc
```

---

## 步骤 4: 验证环境

```bash
# 检查 Java
java -version
javac -version

# 检查 Android SDK
adb version
sdkmanager --version

# 检查 React Native 依赖
cd /home/cmcc/.openclaw/workspace/question-app
npm run doctor  # 如果有此命令
```

---

## 步骤 5: 构建 APK

```bash
cd /home/cmcc/.openclaw/workspace/question-app

# Debug 版本
cd android
./gradlew assembleDebug

# APK 位置
ls -la app/build/outputs/apk/debug/app-debug.apk
```

---

## 常见问题

### Q: apt 更新失败?
```bash
# 更换为阿里云镜像
sudo sed -i 's/archive.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list
sudo apt update
```

### Q: SDK 下载太慢?
使用国内镜像:
```bash
# 在 sdkmanager 中使用镜像
export SDK_MIRROR=https://mirrors.tuna.tsinghua.edu.cn/android/repository/repository2-1.xml
```

### Q: Gradle 下载慢?
编辑 `android/build.gradle`:
```gradle
repositories {
    maven { url 'https://maven.aliyun.com/repository/google' }
    maven { url 'https://maven.aliyun.com/repository/public' }
}
```

---

## 下一步

环境配置完成后:
1. 连接 Android 手机 (开启 USB 调试) 或使用模拟器
2. 运行 `npm run android` 启动开发模式
3. 或运行 `./gradlew assembleDebug` 构建 APK

---

**文档创建时间:** 2026-06-25 08:21  
**系统:** Kylin Linux Desktop V10 SP1
