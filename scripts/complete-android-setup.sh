#!/bin/bash
# 完整的 Android SDK 配置脚本
# 使用方法：sudo ./scripts/complete-android-setup.sh

set -e

echo "=========================================="
echo "  Android SDK 完整配置脚本"
echo "=========================================="
echo ""

# 检查是否 root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用 sudo 运行："
    echo "   sudo ./scripts/complete-android-setup.sh"
    exit 1
fi

SDK_DIR="/home/cmcc/Android/Sdk"
USER_NAME="cmcc"

echo "[1/4] 修复目录权限..."
chown -R $USER_NAME:$USER_NAME /home/cmcc/Android
chmod 755 $SDK_DIR

echo "[2/4] 下载 Android 命令行工具..."
cd $SDK_DIR
mkdir -p cmdline-tools/temp
cd cmdline-tools/temp

# 下载 (使用国内镜像加速)
TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
echo "   下载：$TOOLS_URL"
curl -L -o commandlinetools.zip "$TOOLS_URL"

if [ ! -f commandlinetools.zip ]; then
    echo "❌ 下载失败"
    exit 1
fi

echo "[3/4] 解压并配置..."
unzip -q commandlinetools.zip
mv tools latest
cd ..
rm -rf temp

echo "[4/4] 配置环境变量..."
cat >> /home/$USER_NAME/.bashrc << 'BASHRC'

# Android SDK (自动添加)
export ANDROID_HOME=/home/cmcc/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/33.0.2
BASHRC

chown $USER_NAME:$USER_NAME /home/$USER_NAME/.bashrc

echo ""
echo "=========================================="
echo "  ✅ Android SDK 基础配置完成！"
echo "=========================================="
echo ""
echo "下一步 (以用户 $USER_NAME 身份执行):"
echo "  1. 重新加载环境：source ~/.bashrc"
echo "  2. 接受许可证：/sdkmanager --licenses"
echo "  3. 安装平台工具："
echo "     sdkmanager \"platform-tools\" \"platforms;android-33\" \"build-tools;33.0.2\""
echo "  4. 构建 APP: cd ~/question-app && npm run android"
echo ""
echo "或者运行自动安装脚本:"
echo "  ./scripts/auto-install-sdk.sh"
echo ""
