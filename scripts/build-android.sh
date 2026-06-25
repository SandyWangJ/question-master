#!/bin/bash
# 题霸 - Android APK 构建脚本
# 用法：./scripts/build-android.sh [debug|release]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ANDROID_DIR="$PROJECT_DIR/android"
APK_OUTPUT_DIR="$ANDROID_DIR/app/build/outputs/apk"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔨 题霸 - Android 构建脚本${NC}"
echo "================================"

# 检查环境
check_environment() {
    echo -e "${YELLOW}检查环境...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    
    if ! command -v java &> /dev/null; then
        echo -e "${RED}❌ Java 未安装${NC}"
        exit 1
    fi
    
    if [ ! -d "$ANDROID_DIR" ]; then
        echo -e "${RED}❌ Android 目录不存在：$ANDROID_DIR${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 环境检查通过${NC}"
}

# 构建 Debug 版本
build_debug() {
    echo -e "${YELLOW}构建 Debug 版本...${NC}"
    
    cd "$ANDROID_DIR"
    
    # 清理
    ./gradlew clean
    
    # 构建
    ./gradlew assembleDebug
    
    # 查找 APK
    APK_PATH=$(find "$APK_OUTPUT_DIR/debug" -name "app-debug.apk" | head -n 1)
    
    if [ -f "$APK_PATH" ]; then
        echo -e "${GREEN}================================${NC}"
        echo -e "${GREEN}✅ 构建成功!${NC}"
        echo -e "APK 路径：$APK_PATH"
        echo -e "APK 大小：$(ls -lh "$APK_PATH" | awk '{print $5}')"
        echo -e "${GREEN}================================${NC}"
        
        # 拷贝到项目根目录方便访问
        cp "$APK_PATH" "$PROJECT_DIR/question-master-debug.apk"
        echo -e "已复制到：$PROJECT_DIR/question-master-debug.apk"
    else
        echo -e "${RED}❌ 构建失败：未找到生成的 APK${NC}"
        exit 1
    fi
}

# 构建 Release 版本
build_release() {
    echo -e "${YELLOW}构建 Release 版本...${NC}"
    echo -e "${YELLOW}⚠️  请确保已配置签名信息 (参见 INSTALL.md)${NC}"
    
    cd "$ANDROID_DIR"
    
    # 清理
    ./gradlew clean
    
    # 构建
    ./gradlew assembleRelease
    
    # 查找 APK
    APK_PATH=$(find "$APK_OUTPUT_DIR/release" -name "app-release.apk" | head -n 1)
    
    if [ -f "$APK_PATH" ]; then
        echo -e "${GREEN}================================${NC}"
        echo -e "${GREEN}✅ Release 构建成功!${NC}"
        echo -e "APK 路径：$APK_PATH"
        echo -e "APK 大小：$(ls -lh "$APK_PATH" | awk '{print $5}')"
        echo -e "${GREEN}================================${NC}"
        
        # 拷贝到项目根目录
        cp "$APK_PATH" "$PROJECT_DIR/question-master-release.apk"
        echo -e "已复制到：$PROJECT_DIR/question-master-release.apk"
    else
        echo -e "${RED}❌ 构建失败：未找到生成的 APK${NC}"
        exit 1
    fi
}

# 主函数
main() {
    BUILD_TYPE="${1:-debug}"
    
    check_environment
    
    case "$BUILD_TYPE" in
        debug)
            build_debug
            ;;
        release)
            build_release
            ;;
        *)
            echo -e "${RED}❌ 未知的构建类型：$BUILD_TYPE${NC}"
            echo "用法：$0 [debug|release]"
            exit 1
            ;;
    esac
}

# 执行
main "$@"
