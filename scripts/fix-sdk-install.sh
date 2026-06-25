#!/bin/bash
# 修复 SDK 安装路径问题
# 使用方法：sudo ./scripts/fix-sdk-install.sh

set -e

echo "修复 Android SDK 目录结构..."

SDK_DIR="/home/cmcc/Android/Sdk/cmdline-tools"

# 删除旧的 temp 目录
rm -rf "$SDK_DIR/temp"

# 重新解压到正确位置
cd "$SDK_DIR"
unzip -o commandlinetools.zip

# 重命名为 latest（Android SDK 要求的结构）
mv cmdline-tools latest

# 修复权限
chown -R cmcc:cmcc "$SDK_DIR"

echo ""
echo "✅ SDK 目录结构修复完成！"
echo ""
echo "当前结构:"
ls -la "$SDK_DIR/latest"

echo ""
echo "下一步:"
echo "  1. source ~/.bashrc"
echo "  2. sdkmanager --licenses"
echo "  3. sdkmanager \"platform-tools\" \"platforms;android-33\""
