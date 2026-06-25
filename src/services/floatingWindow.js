/**
 * 悬浮窗服务
 * Android 悬浮球 + 搜索面板
 */

import { NativeModules, Platform } from 'react-native';

const { FloatingWindowModule } = NativeModules;

/**
 * 检查悬浮窗权限 (Android)
 */
export const checkOverlayPermission = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }
  
  try {
    if (FloatingWindowModule && FloatingWindowModule.checkPermission) {
      const hasPermission = await FloatingWindowModule.checkPermission();
      return hasPermission;
    }
    return false;
  } catch (error) {
    console.error('检查悬浮窗权限失败:', error);
    return false;
  }
};

/**
 * 请求悬浮窗权限 (Android)
 */
export const requestOverlayPermission = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }
  
  try {
    if (FloatingWindowModule && FloatingWindowModule.requestPermission) {
      const granted = await FloatingWindowModule.requestPermission();
      return granted;
    }
    return false;
  } catch (error) {
    console.error('请求悬浮窗权限失败:', error);
    return false;
  }
};

/**
 * 显示悬浮球
 */
export const showFloatingBall = (onPress) => {
  if (Platform.OS !== 'android') {
    console.log('非 Android 平台，使用模拟悬浮窗');
    return false;
  }
  
  try {
    if (FloatingWindowModule && FloatingWindowModule.show) {
      FloatingWindowModule.show({
        text: '🔍',
        size: 50,
        position: 'right',
        onTap: onPress,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('显示悬浮球失败:', error);
    return false;
  }
};

/**
 * 隐藏悬浮球
 */
export const hideFloatingBall = () => {
  if (Platform.OS !== 'android') {
    return;
  }
  
  try {
    if (FloatingWindowModule && FloatingWindowModule.hide) {
      FloatingWindowModule.hide();
    }
  } catch (error) {
    console.error('隐藏悬浮球失败:', error);
  }
};

/**
 * 显示搜索结果浮层
 */
export const showSearchResult = (questionData) => {
  if (Platform.OS !== 'android') {
    console.log('显示搜索结果:', questionData);
    return false;
  }
  
  try {
    if (FloatingWindowModule && FloatingWindowModule.showResult) {
      FloatingWindowModule.showResult({
        question: questionData.question_text,
        answer: questionData.answer,
        analysis: questionData.analysis,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('显示搜索结果失败:', error);
    return false;
  }
};

/**
 * 隐藏搜索结果浮层
 */
export const hideSearchResult = () => {
  if (Platform.OS !== 'android') {
    return;
  }
  
  try {
    if (FloatingWindowModule && FloatingWindowModule.hideResult) {
      FloatingWindowModule.hideResult();
    }
  } catch (error) {
    console.error('隐藏搜索结果失败:', error);
  }
};

export default {
  checkOverlayPermission,
  requestOverlayPermission,
  showFloatingBall,
  hideFloatingBall,
  showSearchResult,
  hideSearchResult,
};
