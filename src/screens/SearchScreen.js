/**
 * 搜题界面
 * 支持关键词搜索、实时匹配
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { searchQuestions } from '../services/database';

const SearchScreen = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showAnswer, setShowAnswer] = useState({});

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setSearching(true);
    const questions = await searchQuestions(keyword.trim());
    setResults(questions);
    setSearching(false);
  };

  const toggleAnswer = (id) => {
    setShowAnswer((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const QuestionCard = ({ question }) => {
    const isAnswerVisible = showAnswer[question.id];

    return (
      <View style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionText}>{question.question_text}</Text>
        </View>

        {question.options && question.options.length > 0 && (
          <View style={styles.optionsContainer}>
            {JSON.parse(question.options).map((opt, idx) => (
              <View key={idx} style={styles.optionItem}>
                <Text style={styles.optionKey}>{opt.key}.</Text>
                <Text style={styles.optionValue}>{opt.value}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.answerButton,
            isAnswerVisible && styles.answerButtonHidden,
          ]}
          onPress={() => toggleAnswer(question.id)}
        >
          <Icon
            name={isAnswerVisible ? 'visibility-off' : 'visibility'}
            size={18}
            color="#FFF"
          />
          <Text style={styles.answerButtonText}>
            {isAnswerVisible ? '隐藏答案' : '显示答案'}
          </Text>
        </TouchableOpacity>

        {isAnswerVisible && (
          <View style={styles.answerSection}>
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>答案：</Text>
              <Text style={styles.answerValue}>{question.answer}</Text>
            </View>
            {question.analysis ? (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisLabel}>解析：</Text>
                <Text style={styles.analysisValue}>{question.analysis}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.questionFooter}>
          {question.category && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{question.category}</Text>
            </View>
          )}
          {question.difficulty && (
            <View style={[styles.tag, styles.difficultyTag]}>
              <Text style={styles.tagText}>难度：{'⭐'.repeat(question.difficulty)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      {/* 搜索框 */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="输入题目关键词搜索..."
          placeholderTextColor="#999"
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 搜索结果 */}
      <ScrollView style={styles.resultsContainer}>
        {searching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>搜索中...</Text>
          </View>
        )}

        {!searching && results.length === 0 && keyword && (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={48} color="#CCC" />
            <Text style={styles.emptyText}>未找到相关题目</Text>
          </View>
        )}

        {!searching && results.length === 0 && !keyword && (
          <View style={styles.emptyContainer}>
            <Icon name="touch-app" size={48} color="#CCC" />
            <Text style={styles.emptyText}>输入关键词开始搜题</Text>
          </View>
        )}

        {results.map((question, idx) => (
          <QuestionCard key={question.id || idx} question={question} />
        ))}
      </ScrollView>

      {/* 搜索统计 */}
      {results.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>找到 {results.length} 道题目</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#2196F3',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  questionHeader: {
    marginBottom: 12,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  optionsContainer: {
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  optionKey: {
    fontWeight: 'bold',
    marginRight: 8,
    color: '#333',
  },
  optionValue: {
    flex: 1,
    color: '#666',
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  answerButtonHidden: {
    backgroundColor: '#FF9800',
  },
  answerButtonText: {
    color: '#FFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  answerSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  answerLabel: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  answerValue: {
    flex: 1,
    color: '#333',
    fontWeight: '500',
  },
  analysisSection: {
    flexDirection: 'row',
  },
  analysisLabel: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  analysisValue: {
    flex: 1,
    color: '#666',
    lineHeight: 22,
  },
  questionFooter: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyTag: {
    backgroundColor: '#FFF3E0',
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 13,
  },
});

export default SearchScreen;
