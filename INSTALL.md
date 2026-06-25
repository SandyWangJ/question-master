# 题霸 - 安装指南

## 方式一：直接安装 APK (推荐)

如果你已经有编译好的 APK 文件：

1. **传输到手机**
   - USB 传输：将 APK 复制到手机
   - 或发送邮件/微信/QQ 到手机

2. **安装 APK**
   - 在手机上打开 APK 文件
   - 允许"未知来源应用"安装 (如果需要)
   - 点击安装

3. **授予权限**
   - 首次打开时授予存储权限 (用于导入 Excel)
   - 使用悬浮窗时，需要额外授予"悬浮窗"权限

---

## 方式二：从源码编译

### 环境要求

```bash
Node.js >= 18
npm >= 9
Java JDK 17
Android Studio (含 SDK 33+)
```

### 1. 安装依赖

```bash
cd /home/cmcc/.openclaw/workspace/question-app
npm install
```

### 2. 配置 Android 环境

确保以下环境变量已设置：

```bash
export ANDROID_HOME=/home/cmcc/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### 3. 开发模式运行

```bash
# 终端 1: 启动 Metro 打包器
npm start

# 终端 2: 编译并运行到设备
npm run android
```

**手机需要开启:**
- 开发者选项
- USB 调试
- 通过 USB 连接电脑

### 4. 构建 APK

```bash
# Debug 版本 (可直接安装)
cd android
./gradlew assembleDebug

# APK 位置
ls -la app/build/outputs/apk/debug/app-debug.apk
```

```bash
# Release 版本 (需要签名配置)
cd android
./gradlew assembleRelease
```

### 5. 签名配置 (Release)

生成签名密钥：

```bash
keytool -genkeypair -v -keystore question-master.keystore -alias question-master -keyalg RSA -keysize 2048 -validity 10000
```

编辑 `android/gradle.properties`:

```properties
QUESTION_MASTER_UPLOAD_STORE_FILE=question-master.keystore
QUESTION_MASTER_UPLOAD_KEY_ALIAS=question-master
QUESTION_MASTER_STORE_PASSWORD=你的密码
QUESTION_MASTER_KEY_PASSWORD=你的密码
```

编辑 `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file(QUESTION_MASTER_UPLOAD_STORE_FILE)
            storePassword QUESTION_MASTER_UPLOAD_STORE_PASSWORD
            keyAlias QUESTION_MASTER_UPLOAD_KEY_ALIAS
            keyPassword QUESTION_MASTER_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

## 常见问题

### Q: npm install 失败?
```bash
# 清理缓存重试
rm -rf node_modules
npm cache clean --force
npm install
```

### Q: Gradle 下载慢?
编辑 `android/build.gradle`, 使用阿里云镜像:

```gradle
repositories {
    maven { url 'https://maven.aliyun.com/repository/google' }
    maven { url 'https://maven.aliyun.com/repository/public' }
}
```

### Q: 连接不上设备?
```bash
# 检查 ADB
adb devices

# 重启 ADB
adb kill-server
adb start-server

# 重新连接
adb connect 192.168.1.xxx:5555  # 无线调试
```

### Q: 悬浮窗不显示?
1. 确保授予了"悬浮窗"权限
2. Android 10+ 需要额外授予"在其他应用上层显示"权限
3. 部分品牌手机 (小米/华为等) 需要额外设置自启动权限

---

## 下一步

安装完成后，参考 [README.md](./README.md) 了解使用方法。

**开发文档:** `docs/DEVELOPMENT.md`  
**API 文档:** `docs/API-REFERENCE.md`
