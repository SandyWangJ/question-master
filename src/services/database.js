/**
 * 数据库服务 - SQLite
 * 管理试题库的存储、查询、导入
 */

import SQLite from 'react-native-sqlite-storage';

// 启用调试模式
SQLite.enablePromise(true);

const DB_NAME = 'QuestionBank.db';
const DB_VERSION = '1.0';
const DB_DISPLAY_NAME = 'QuestionMaster Database';
const DB_SIZE = 200000;

let db = null;

/**
 * 初始化数据库
 */
export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabase({
      name: DB_NAME,
      version: DB_VERSION,
      displayName: DB_DISPLAY_NAME,
      size: DB_SIZE,
    });
    
    // 创建试题表
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_text TEXT NOT NULL,
        options TEXT,
        answer TEXT NOT NULL,
        analysis TEXT,
        category TEXT,
        tags TEXT,
        difficulty INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建全文搜索索引
    await db.executeSql(`
      CREATE VIRTUAL TABLE IF NOT EXISTS questions_fts USING fts5(
        question_text,
        options,
        answer,
        analysis,
        content='questions',
        content_rowid='id'
      )
    `);

    // 创建答题记录表
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS answer_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        user_answer TEXT,
        is_correct INTEGER,
        time_spent INTEGER,
        answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id)
      )
    `);

    // 创建错题本表
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS wrong_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL UNIQUE,
        wrong_count INTEGER DEFAULT 1,
        last_wrong_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id)
      )
    `);

    console.log('✅ 数据库初始化成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
};

/**
 * 批量插入试题
 */
export const insertQuestions = async (questions) => {
  if (!db) await initDatabase();
  
  const transaction = await db.transaction();
  try {
    for (const q of questions) {
      await transaction.executeSql(
        `INSERT INTO questions (question_text, options, answer, analysis, category, tags, difficulty) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          q.question_text,
          JSON.stringify(q.options || []),
          q.answer,
          q.analysis || '',
          q.category || '默认',
          q.tags || '',
          q.difficulty || 1,
        ]
      );
    }
    await transaction.commit();
    console.log(`✅ 成功导入 ${questions.length} 道试题`);
    return questions.length;
  } catch (error) {
    await transaction.rollback();
    console.error('❌ 导入试题失败:', error);
    throw error;
  }
};

/**
 * 搜索试题 (全文搜索)
 */
export const searchQuestions = async (keyword, limit = 20) => {
  if (!db) await initDatabase();
  
  try {
    const results = await db.executeSql(
      `SELECT q.* FROM questions q 
       WHERE q.question_text LIKE ? 
          OR q.answer LIKE ? 
          OR q.analysis LIKE ?
       LIMIT ?`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, limit]
    );
    
    const rows = results[0].rows;
    const questions = [];
    for (let i = 0; i < rows.length; i++) {
      questions.push(rows.item(i));
    }
    
    return questions;
  } catch (error) {
    console.error('❌ 搜索失败:', error);
    return [];
  }
};

/**
 * 获取随机试题
 */
export const getRandomQuestions = async (count = 10, category = null) => {
  if (!db) await initDatabase();
  
  try {
    let sql;
    let params;
    
    if (category) {
      sql = `SELECT * FROM questions WHERE category = ? ORDER BY RANDOM() LIMIT ?`;
      params = [category, count];
    } else {
      sql = `SELECT * FROM questions ORDER BY RANDOM() LIMIT ?`;
      params = [count];
    }
    
    const results = await db.executeSql(sql, params);
    const rows = results[0].rows;
    const questions = [];
    for (let i = 0; i < rows.length; i++) {
      questions.push(rows.item(i));
    }
    
    return questions;
  } catch (error) {
    console.error('❌ 获取随机试题失败:', error);
    return [];
  }
};

/**
 * 记录答题
 */
export const recordAnswer = async (questionId, userAnswer, isCorrect, timeSpent) => {
  if (!db) await initDatabase();
  
  try {
    await db.executeSql(
      `INSERT INTO answer_records (question_id, user_answer, is_correct, time_spent) 
       VALUES (?, ?, ?, ?)`,
      [questionId, userAnswer, isCorrect ? 1 : 0, timeSpent]
    );
    
    // 如果答错，加入错题本
    if (!isCorrect) {
      await db.executeSql(
        `INSERT INTO wrong_questions (question_id, wrong_count, last_wrong_at) 
         VALUES (?, 1, CURRENT_TIMESTAMP)
         ON CONFLICT(question_id) DO UPDATE SET 
         wrong_count = wrong_count + 1, 
         last_wrong_at = CURRENT_TIMESTAMP`,
        [questionId]
      );
    }
    
    return true;
  } catch (error) {
    console.error('❌ 记录答题失败:', error);
    return false;
  }
};

/**
 * 获取错题本
 */
export const getWrongQuestions = async () => {
  if (!db) await initDatabase();
  
  try {
    const results = await db.executeSql(
      `SELECT q.*, w.wrong_count, w.last_wrong_at 
       FROM wrong_questions w 
       JOIN questions q ON w.question_id = q.id 
       ORDER BY w.wrong_count DESC, w.last_wrong_at DESC`
    );
    
    const rows = results[0].rows;
    const questions = [];
    for (let i = 0; i < rows.length; i++) {
      questions.push(rows.item(i));
    }
    
    return questions;
  } catch (error) {
    console.error('❌ 获取错题本失败:', error);
    return [];
  }
};

/**
 * 获取统计数据
 */
export const getStatistics = async () => {
  if (!db) await initDatabase();
  
  try {
    const totalQuestions = await db.executeSql('SELECT COUNT(*) as count FROM questions');
    const totalAnswers = await db.executeSql('SELECT COUNT(*) as count FROM answer_records');
    const correctAnswers = await db.executeSql('SELECT COUNT(*) as count FROM answer_records WHERE is_correct = 1');
    const wrongQuestions = await db.executeSql('SELECT COUNT(*) as count FROM wrong_questions');
    
    return {
      totalQuestions: totalQuestions[0].rows.item(0).count,
      totalAnswers: totalAnswers[0].rows.item(0).count,
      correctAnswers: correctAnswers[0].rows.item(0).count,
      wrongQuestions: wrongQuestions[0].rows.item(0).count,
      accuracy: totalAnswers[0].rows.item(0).count > 0 
        ? ((correctAnswers[0].rows.item(0).count / totalAnswers[0].rows.item(0).count) * 100).toFixed(1)
        : 0,
    };
  } catch (error) {
    console.error('❌ 获取统计失败:', error);
    return null;
  }
};

/**
 * 清空所有数据
 */
export const clearAllData = async () => {
  if (!db) await initDatabase();
  
  try {
    await db.executeSql('DELETE FROM questions');
    await db.executeSql('DELETE FROM answer_records');
    await db.executeSql('DELETE FROM wrong_questions');
    console.log('✅ 数据已清空');
    return true;
  } catch (error) {
    console.error('❌ 清空数据失败:', error);
    return false;
  }
};

export default {
  initDatabase,
  insertQuestions,
  searchQuestions,
  getRandomQuestions,
  recordAnswer,
  getWrongQuestions,
  getStatistics,
  clearAllData,
};
