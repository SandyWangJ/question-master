/**
 * 主界面
 * 功能入口：导入试题、搜索、模拟答题、错题本、统计
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getStatistics } from '../services/database';

const HomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    const data = await getStatistics();
    setStats(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const menuItems = [
    {
      id: 'import',
      title: '导入试题',
      icon: 'file-upload',
      color: '#4CAF50',
      screen: 'Import',
    },
    {
      id: 'search',
      title: '搜题',
      icon: 'search',
      color: '#2196F3',
      screen: 'Search',
    },
    {
      id: 'practice',
      title: '模拟答题',
      icon: 'quiz',
      color: '#FF9800',
      screen: 'Practice',
    },
    {
      id: 'wrong',
      title: '错题本',
      icon: 'error-outline',
      color: '#F44336',
      screen: 'WrongQuestions',
    },
    {
      id: 'history',
      title: '答题历史',
      icon: 'history',
      color: '#9C27B0',
      screen: 'History',
    },
    {
      id: 'settings',
      title: '设置',
      icon: 'settings',
      color: '#607D8B',
      screen: 'Settings',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>题霸 📚</Text>
        <Text style={styles.subtitle}>你的随身刷题神器</Text>
      </View>

      {/* 统计卡片 */}
      {stats && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalQuestions}</Text>
            <Text style={styles.statLabel}>总题数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalAnswers}</Text>
            <Text style={styles.statLabel}>已答题</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.accuracy}%</Text>
            <Text style={styles.statLabel}>正确率</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.wrongQuestions}</Text>
            <Text style={styles.statLabel}>错题</Text>
          </View>
        </View>
      )}

      {/* 功能菜单 */}
      <ScrollView
        style={styles.menuContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Icon name={item.icon} size={28} color="#FFF" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 悬浮窗开关 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.floatingToggle}
          onPress={() => navigation.navigate('FloatingSettings')}
        >
          <Icon name="pan-tool" size={20} color="#666" />
          <Text style={styles.floatingText}>悬浮窗设置</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEE',
    marginHorizontal: 8,
  },
  menuContainer: {
    flex: 1,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  menuItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
  },
  floatingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingText: {
    marginLeft: 8,
    color: '#666',
  },
});

export default HomeScreen;
