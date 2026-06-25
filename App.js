/**
 * 题霸 - React Native 主应用
 * 试题库管理 + 悬浮窗搜题 + 模拟答题
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// 导入服务
import { initDatabase } from './src/services/database';
import { checkOverlayPermission, requestOverlayPermission } from './src/services/floatingWindow';

// 导入界面
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import ImportScreen from './src/screens/ImportScreen';

const Stack = createStackNavigator();

// 简单占位界面
const PlaceholderScreen = ({ title }) => (
  <View style={styles.placeholder}>
    <Icon name="construction" size={64} color="#CCC" />
    <Text style={styles.placeholderText}>{title}</Text>
    <Text style={styles.placeholderSubtext}>开发中...</Text>
  </View>
);

const App = () => {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 初始化应用...');
      
      // 初始化数据库
      await initDatabase();
      console.log('✅ 数据库初始化成功');
      
      // 检查悬浮窗权限
      const hasPermission = await checkOverlayPermission();
      if (!hasPermission) {
        console.log('⚠️ 悬浮窗权限未授予，将在使用时请求');
      }
      
      setDbInitialized(true);
    } catch (error) {
      console.error('❌ 初始化失败:', error);
      setDbError(error.message);
    }
  };

  if (dbError) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color="#F44336" />
        <Text style={styles.errorTitle}>应用初始化失败</Text>
        <Text style={styles.errorMessage}>{dbError}</Text>
      </View>
    );
  }

  if (!dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>初始化中...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '题霸',
            headerShown: false,
          }}
        />
        
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: '搜题',
          }}
        />
        
        <Stack.Screen
          name="Practice"
          component={PracticeScreen}
          options={{
            title: '模拟答题',
          }}
        />
        
        <Stack.Screen
          name="Import"
          component={ImportScreen}
          options={{
            title: '导入试题',
          }}
        />
        
        <Stack.Screen
          name="WrongQuestions"
          component={() => <PlaceholderScreen title="错题本" />}
          options={{
            title: '错题本',
          }}
        />
        
        <Stack.Screen
          name="History"
          component={() => <PlaceholderScreen title="答题历史" />}
          options={{
            title: '答题历史',
          }}
        />
        
        <Stack.Screen
          name="Settings"
          component={() => <PlaceholderScreen title="设置" />}
          options={{
            title: '设置',
          }}
        />
        
        <Stack.Screen
          name="FloatingSettings"
          component={() => <PlaceholderScreen title="悬浮窗设置" />}
          options={{
            title: '悬浮窗设置',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 24,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
  },
  errorMessage: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  placeholderSubtext: {
    marginTop: 8,
    color: '#CCC',
  },
});

export default App;
