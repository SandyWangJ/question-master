#!/bin/bash
echo "=== 替换所有 Gradle 缓存中的 AAPT2 ==="
echo ""

SYSTEM_AAPT2="/usr/bin/aapt2"
GRADLE_CACHE="/home/cmcc/.gradle/caches"

# 查找所有 aapt2 文件
echo "查找所有 AAPT2 缓存文件..."
AAPT2_FILES=$(find $GRADLE_CACHE -name "aapt2" -type f 2>/dev/null | grep -v ".bak")

if [ -z "$AAPT2_FILES" ]; then
  echo "❌ 未找到 AAPT2 文件"
  exit 1
fi

COUNT=0
for file in $AAPT2_FILES; do
  COUNT=$((COUNT+1))
  echo "[$COUNT] 处理：$file"
  sudo cp "$file" "${file}.bak"
  sudo cp "$SYSTEM_AAPT2" "$file"
  sudo chmod +x "$file"
done

echo ""
echo "✅ 已替换 $COUNT 个 AAPT2 文件为 ARM64 版本！"
echo ""
echo "现在重新构建:"
echo "  cd /home/cmcc/.openclaw/workspace/question-app/android"
echo "  ./gradlew assembleDebug"
