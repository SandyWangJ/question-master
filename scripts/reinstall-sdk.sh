#!/bin/bash
# Android SDK 完整修复脚本
# 使用方法：sudo ./scripts/reinstall-sdk.sh

set -e

echo "=========================================="
echo "  Android SDK 完整重新安装"
echo "=========================================="
echo ""

SDK_DIR="/home/cmcc/Android/Sdk"
CMD_DIR="$SDK_DIR/cmdline-tools"
USER="cmcc"

echo "[1/5] 清理旧目录..."
rm -rf "$CMD_DIR"
mkdir -p "$CMD_DIR"

echo "[2/5] 下载 Android 命令行工具..."
cd "$CMD_DIR"

# 下载
curl -L -o commandlinetools.zip \
  "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"

if [ ! -f commandlinetools.zip ]; then
  echo "❌ 下载失败"
  exit 1
fi

echo "   ✅ 下载完成 ($(du -h commandlinetools.zip | cut -f1))"

echo "[3/5] 解压..."
unzip -q commandlinetools.zip

echo "[4/5] 重命名为 latest..."
mv cmdline-tools latest

echo "[5/5] 修复权限..."
chown -R $USER:$USER "$SDK_DIR"

# 清理 zip
rm commandlinetools.zip

echo ""
echo "=========================================="
echo "  ✅ SDK 基础安装完成！"
echo "=========================================="
echo ""
echo "目录结构:"
ls -la "$CMD_DIR/latest" | head -6

echo ""
echo "下一步 (以普通用户身份执行):"
echo "  source ~/.bashrc"
echo "  sdkmanager --licenses"
echo "  sdkmanager \"platform-tools\" \"platforms;android-33\" \"build-tools;33.0.2\""
echo ""
