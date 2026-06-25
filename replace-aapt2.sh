#!/bin/bash
# 替换 Gradle 缓存中的 AAPT2 为 ARM64 版本

echo "=== 替换 AAPT2 为 ARM64 版本 ==="
echo ""

AAPT2_CACHE="/home/cmcc/.gradle/caches/8.10.2/transforms"
SYSTEM_AAPT2="/usr/bin/aapt2"

# 查找所有 aapt2 文件
echo "查找 Gradle 缓存中的 AAPT2..."
AAPT2_FILES=$(find $AAPT2_CACHE -name "aapt2" -type f 2>/dev/null)

if [ -z "$AAPT2_FILES" ]; then
  echo "❌ 未找到 AAPT2 缓存文件"
  exit 1
fi

echo "找到以下文件:"
echo "$AAPT2_FILES"
echo ""

# 备份并替换
for file in $AAPT2_FILES; do
  echo "处理：$file"
  sudo cp "$file" "${file}.bak"
  sudo cp "$SYSTEM_AAPT2" "$file"
  sudo chmod +x "$file"
  echo "  ✅ 已替换"
done

echo ""
echo "✅ 所有 AAPT2 已替换为 ARM64 版本！"
echo ""
echo "现在可以运行:"
echo "  cd /home/cmcc/.openclaw/workspace/question-app/android"
echo "  ./gradlew assembleDebug"
