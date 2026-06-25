#!/bin/bash
# Android 开发环境安装脚本
# 系统：银河麒麟 V10 SP1

set -e

echo "=========================================="
echo "  Android 开发环境安装脚本"
echo "  系统：$(cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '\"')"
echo "=========================================="
echo ""

# 检查是否 root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用 sudo 运行此脚本:"
    echo "   sudo ./scripts/setup-android-env.sh"
    exit 1
fi

echo "[1/5] 更新包索引..."
apt update

echo ""
echo "[2/5] 安装 OpenJDK 17..."
apt install -y openjdk-17-jdk

echo ""
echo "[3/5] 配置环境变量..."
cat >> /home/cmcc/.bashrc << 'BASHRC'

# Android SDK 环境变量
export ANDROID_HOME=/home/cmcc/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/build-tools/33.0.2
BASHRC

echo "   ✅ 环境变量已添加到 ~/.bashrc"

echo ""
echo "[4/5] 创建 SDK 目录..."
mkdir -p /home/cmcc/Android/Sdk
chown cmcc:cmcc /home/cmcc/Android

echo ""
echo "[5/5] 下载 Android 命令行工具..."
echo "   请访问：https://developer.android.com/studio#command-tools"
echo "   下载 'Command line tools only' (Linux 版本)"
echo "   然后解压到：/home/cmcc/Android/Sdk/cmdline-tools/"
echo ""

echo "=========================================="
echo "  安装完成！"
echo "=========================================="
echo ""
echo "下一步:"
echo "1. 重启终端或运行：source ~/.bashrc"
echo "2. 下载 Android 命令行工具并解压到 /home/cmcc/Android/Sdk/cmdline-tools/"
echo "3. 运行：sdkmanager --licenses"
echo "4. 运行：sdkmanager \"platform-tools\" \"platforms;android-33\" \"build-tools;33.0.2\""
echo "5. 在 question-app 目录运行：npm run android"
echo ""
