#!/bin/bash
# 自动安装 Android SDK 组件
# 前提：已运行 complete-android-setup.sh

set -e

echo "=========================================="
echo "  Android SDK 组件自动安装"
echo "=========================================="
echo ""

SDK_DIR="$HOME/Android/Sdk"
export ANDROID_HOME=$SDK_DIR
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# 检查 cmdline-tools 是否存在
if [ ! -d "$ANDROID_HOME/cmdline-tools/latest/bin" ]; then
    echo "❌ 命令行工具未找到！"
    echo "   请先运行：sudo ./scripts/complete-android-setup.sh"
    exit 1
fi

echo "[1/3] 接受许可证..."
yes | sdkmanager --licenses 2>&1 | tail -5

echo ""
echo "[2/3] 安装必要组件..."
echo "   - Platform Tools (ADB)"
echo "   - Android 33 平台"
echo "   - Build Tools 33.0.2"
echo ""

sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2"

echo ""
echo "[3/3] 验证安装..."
echo ""
echo "已安装组件:"
sdkmanager --list_installed 2>&1 | grep -E "(platform-tools|android-33|build-tools)" || echo "   (等待安装完成)"

echo ""
echo "=========================================="
echo "  ✅ Android SDK 安装完成！"
echo "=========================================="
echo ""
echo "验证命令:"
echo "  adb version"
echo "  cd ~/question-app && npm run android"
echo ""
