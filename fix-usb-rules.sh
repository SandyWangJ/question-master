#!/bin/bash
echo "=== 修复 Android USB 权限 ==="
echo ""

# 创建 udev 规则
echo 'SUBSYSTEM=="usb", ATTRS{idVendor}=="12d1", MODE="0666"' | sudo tee /etc/udev/rules.d/51-android.rules

# 重新加载规则
sudo udevadm control --reload-rules
sudo udevadm trigger

# 重启 ADB
adb kill-server
adb start-server

echo ""
echo "✅ 规则已更新！"
echo ""
echo "下一步:"
echo "1. 拔掉手机 USB 线，等待 3 秒后重新插入"
echo "2. 手机上如有弹窗，点击'允许 USB 调试'"
echo "3. 运行：adb devices"
