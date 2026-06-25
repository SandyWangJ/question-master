/**
 * 模拟答题界面
 * 支持：顺序练习、随机练习、错题重做、计时模式
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getRandomQuestions, recordAnswer } from '../services/database';

const PracticeScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    startPractice();
    return () => stopTimer();
  }, []);

  useEffect(() => {
    if (timerEnabled && questions.length > 0 && !showResult) {
      startTimer();
    }
    return () => stopTimer();
  }, [currentIndex]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startPractice = async (mode = 'random') => {
    const count = 10; // 每次 10 道题
    const qList = await getRandomQuestions(count);
    setQuestions(qList);
    setCurrentIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setTimeSpent(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleSelectAnswer = (option) => {
    if (showResult) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      Alert.alert('提示', '请先选择一个答案');
      return;
    }

    const currentQuestion = questions[currentIndex];
    const options = JSON.parse(currentQuestion.options || '[]');
    const correctAnswer = currentQuestion.answer?.trim().toUpperCase();
    const isCorrect = selectedAnswer === correctAnswer;

    // 记录答题
    await recordAnswer(
      currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent
    );

    // 更新统计
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
    }));

    // 震动反馈
    Vibration.vibrate(isCorrect ? [50] : [50, 100, 50]);

    setShowResult(true);

    // 震动提示
    if (isCorrect) {
      Vibration.vibrate(50);
    } else {
      Vibration.vibrate([50, 100, 50]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      finishPractice();
    }
  };

  const finishPractice = () => {
    stopTimer();
    const accuracy = ((score.correct / questions.length) * 100).toFixed(1);
    
    Alert.alert(
      '答题完成',
      `正确率：${accuracy}%\n答对：${score.correct} 题\n答错：${score.wrong} 题\n用时：${formatTime(timeSpent)}`,
      [
        {
          text: '再来一次',
          onPress: () => startPractice(),
        },
        {
          text: '返回主页',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="quiz" size={64} color="#CCC" />
        <Text style={styles.emptyText}>暂无试题</Text>
        <Text style={styles.emptySubtext}>请先导入试题后再练习</Text>
        <TouchableOpacity
          style={styles.importButton}
          onPress={() => navigation.navigate('Import')}
        >
          <Text style={styles.importButtonText}>去导入</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const options = JSON.parse(currentQuestion?.options || '[]');
  const correctAnswer = currentQuestion?.answer?.trim().toUpperCase();

  return (
    <View style={styles.container}>
      {/* 顶部进度 */}
      <View style={styles.header}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            第 {currentIndex + 1} / {questions.length} 题
          </Text>
          <Text style={styles.timerText}>{formatTime(timeSpent)}</Text>
        </View>
        <View style={styles.scoreBar}>
          <View style={styles.scoreItem}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.scoreValue}>{score.correct}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Icon name="error" size={16} color="#F44336" />
            <Text style={styles.scoreValue}>{score.wrong}</Text>
          </View>
        </View>
      </View>

      {/* 题目卡片 */}
      <ScrollView style={styles.questionContainer}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
        </View>

        {/* 选项 */}
        <View style={styles.optionsContainer}>
          {options.map((option, idx) => {
            let optionStyle = styles.option;
            let iconStyle = styles.optionIcon;

            if (showResult) {
              if (option.key === correctAnswer) {
                optionStyle = [optionStyle, styles.optionCorrect];
              } else if (option.key === selectedAnswer && !showResult) {
                optionStyle = [optionStyle, styles.optionWrong];
              }
            } else if (selectedAnswer === option.key) {
              optionStyle = [optionStyle, styles.optionSelected];
            }

            return (
              <TouchableOpacity
                key={idx}
                style={optionStyle}
                onPress={() => handleSelectAnswer(option.key)}
                disabled={showResult}
              >
                <View style={iconStyle}>
                  <Text style={styles.optionKey}>{option.key}</Text>
                </View>
                <Text style={styles.optionText}>{option.value}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 答案解析 */}
        {showResult && (
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <View style={styles.resultBadge}>
                <Icon
                  name={selectedAnswer === correctAnswer ? 'check-circle' : 'close'}
                  size={20}
                  color="#FFF"
                />
                <Text style={styles.resultText}>
                  {selectedAnswer === correctAnswer ? '回答正确' : '回答错误'}
                </Text>
              </View>
            </View>
            <View style={styles.answerRow}>
              <Text style={styles.answerLabel}>正确答案：</Text>
              <Text style={styles.answerValue}>{correctAnswer}</Text>
            </View>
            {currentQuestion.analysis ? (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisTitle}>解析：</Text>
                <Text style={styles.analysisContent}>
                  {currentQuestion.analysis}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.footer}>
        {!showResult ? (
          <TouchableOpacity
            style={[styles.submitButton, !selectedAnswer && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!selectedAnswer}
          >
            <Text style={styles.submitButtonText}>提交答案</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
            </Text>
            <Icon name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#999',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#CCC',
  },
  importButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 24,
  },
  importButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timerText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#666',
  },
  scoreBar: {
    flexDirection: 'row',
    gap: 16,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreValue: {
    fontWeight: '600',
    color: '#333',
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  questionText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#333',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  optionWrong: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionKey: {
    fontWeight: 'bold',
    color: '#666',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  analysisCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  analysisHeader: {
    marginBottom: 12,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  resultText: {
    color: '#FFF',
    fontWeight: '600',
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  answerLabel: {
    fontWeight: '600',
    color: '#666',
  },
  answerValue: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  analysisSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  analysisTitle: {
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  analysisContent: {
    color: '#666',
    lineHeight: 24,
    fontSize: 15,
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default PracticeScreen;
