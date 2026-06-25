/**
 * Excel 试题导入服务
 * 支持 .xlsx / .xls 文件格式
 */

import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { read, utils } from 'xlsx';

/**
 * 解析 Excel 文件中的试题
 * 支持的列：题目、选项 A、选项 B、选项 C、选项 D、答案、解析、分类、难度
 */
export const importFromExcel = async () => {
  try {
    // 1. 选择文件
    const result = await DocumentPicker.pickSingle({
      type: [
        DocumentPicker.types.openxml,
        DocumentPicker.types.xls,
        DocumentPicker.types.csv,
      ],
      copyTo: 'cachesDirectory',
    });

    if (!result || !result.fileCopyUri) {
      throw new Error('未选择文件');
    }

    // 2. 读取文件内容
    const filePath = result.fileCopyUri.replace('file://', '');
    const fileData = await RNFS.readFile(filePath, 'base64');
    
    // 3. 解析 Excel
    const workbook = read(fileData, { type: 'base64' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

    // 4. 转换数据格式
    const questions = parseExcelData(jsonData);
    
    console.log(`✅ 解析完成，共 ${questions.length} 道试题`);
    
    return {
      success: true,
      count: questions.length,
      questions,
      fileName: result.name,
    };
  } catch (error) {
    console.error('❌ Excel 导入失败:', error);
    return {
      success: false,
      error: error.message,
      count: 0,
    };
  }
};

/**
 * 解析 Excel 数据为标准试题格式
 */
const parseExcelData = (rows) => {
  const questions = [];
  
  // 查找表头行
  let headerRowIndex = 0;
  const headers = rows[0] || [];
  
  // 尝试识别表头
  const headerMap = {
    question: -1,
    optionA: -1,
    optionB: -1,
    optionC: -1,
    optionD: -1,
    answer: -1,
    analysis: -1,
    category: -1,
    difficulty: -1,
  };
  
  // 第一行通常是表头
  headers.forEach((h, idx) => {
    if (!h) return;
    const header = String(h).toLowerCase().trim();
    
    if (header.includes('题') || header.includes('question')) headerMap.question = idx;
    else if (header.includes('a') || header.includes('选项')) headerMap.optionA = idx;
    else if (header.includes('b')) headerMap.optionB = idx;
    else if (header.includes('c')) headerMap.optionC = idx;
    else if (header.includes('d')) headerMap.optionD = idx;
    else if (header.includes('答案') || header.includes('answer')) headerMap.answer = idx;
    else if (header.includes('解析') || header.includes('analysis')) headerMap.analysis = idx;
    else if (header.includes('分类') || header.includes('category')) headerMap.category = idx;
    else if (header.includes('难度') || header.includes('difficulty')) headerMap.difficulty = idx;
  });
  
  // 如果没有找到题目列，尝试第一列
  if (headerMap.question === -1) {
    headerMap.question = 0;
  }
  
  // 解析数据行 (跳过表头)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[headerMap.question]) continue;
    
    const question = {
      question_text: String(row[headerMap.question] || '').trim(),
      options: [],
      answer: '',
      analysis: '',
      category: '默认',
      difficulty: 1,
    };
    
    // 解析选项
    const options = [];
    if (headerMap.optionA >= 0 && row[headerMap.optionA]) {
      options.push({ key: 'A', value: String(row[headerMap.optionA]).trim() });
    }
    if (headerMap.optionB >= 0 && row[headerMap.optionB]) {
      options.push({ key: 'B', value: String(row[headerMap.optionB]).trim() });
    }
    if (headerMap.optionC >= 0 && row[headerMap.optionC]) {
      options.push({ key: 'C', value: String(row[headerMap.optionC]).trim() });
    }
    if (headerMap.optionD >= 0 && row[headerMap.optionD]) {
      options.push({ key: 'D', value: String(row[headerMap.optionD]).trim() });
    }
    question.options = options;
    
    // 解析答案
    if (headerMap.answer >= 0 && row[headerMap.answer]) {
      question.answer = String(row[headerMap.answer]).trim().toUpperCase();
    }
    
    // 解析解析
    if (headerMap.analysis >= 0 && row[headerMap.analysis]) {
      question.analysis = String(row[headerMap.analysis]).trim();
    }
    
    // 解析分类
    if (headerMap.category >= 0 && row[headerMap.category]) {
      question.category = String(row[headerMap.category]).trim();
    }
    
    // 解析难度
    if (headerMap.difficulty >= 0 && row[headerMap.difficulty]) {
      const diff = parseInt(row[headerMap.difficulty]);
      question.difficulty = isNaN(diff) ? 1 : Math.max(1, Math.min(5, diff));
    }
    
    questions.push(question);
  }
  
  return questions;
};

/**
 * 从剪贴板导入 (支持文本格式)
 */
export const importFromClipboard = async (text) => {
  try {
    const lines = text.split('\n').filter(line => line.trim());
    const questions = [];
    let currentQuestion = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // 识别题目 (以数字 + 点开头)
      const questionMatch = trimmed.match(/^(\d+)[.、]\s*(.+)/);
      if (questionMatch) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question_text: questionMatch[2],
          options: [],
          answer: '',
          analysis: '',
          category: '剪贴板导入',
          difficulty: 1,
        };
        continue;
      }
      
      // 识别选项 (A/B/C/D 开头)
      const optionMatch = trimmed.match(/^([A-D])[.、])\s*(.+)/i);
      if (optionMatch && currentQuestion) {
        currentQuestion.options.push({
          key: optionMatch[1].toUpperCase(),
          value: optionMatch[2],
        });
        continue;
      }
      
      // 识别答案
      if (trimmed.startsWith('答案:') || trimmed.startsWith('答案：')) {
        if (currentQuestion) {
          currentQuestion.answer = trimmed.replace(/答案 [:：]\s*/, '').trim();
        }
        continue;
      }
      
      // 识别解析
      if (trimmed.startsWith('解析:') || trimmed.startsWith('解析：')) {
        if (currentQuestion) {
          currentQuestion.analysis = trimmed.replace(/解析 [:：]\s*/, '').trim();
        }
        continue;
      }
    }
    
    // 添加最后一题
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    
    console.log(`✅ 从剪贴板解析 ${questions.length} 道试题`);
    return {
      success: true,
      count: questions.length,
      questions,
    };
  } catch (error) {
    console.error('❌ 剪贴板导入失败:', error);
    return {
      success: false,
      error: error.message,
      count: 0,
    };
  }
};

export default {
  importFromExcel,
  importFromClipboard,
};
