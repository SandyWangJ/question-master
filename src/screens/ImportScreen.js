/**
 * 试题导入界面
 * 支持：Excel 文件导入、剪贴板导入
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';
import { importFromExcel, importFromClipboard } from '../services/excelImporter';
import { insertQuestions } from '../services/database';

const ImportScreen = ({ navigation }) => {
  const [importing, setImporting] = useState(false);
  const [clipboardText, setClipboardText] = useState('');
  const [importMode, setImportMode] = useState(null); // 'excel' | 'clipboard'

  const handleExcelImport = async () => {
    try {
      setImporting(true);
      setImportMode('excel');

      const result = await importFromExcel();

      if (result.success && result.count > 0) {
        // 保存到数据库
        await insertQuestions(result.questions);

        Alert.alert(
          '导入成功',
          `成功导入 ${result.count} 道试题\n文件名：${result.fileName}`,
          [
            {
              text: '开始刷题',
              onPress: () => navigation.navigate('Practice'),
            },
          ]
        );
      } else {
        Alert.alert('导入失败', result.error || '未找到有效试题');
      }
    } catch (error) {
      Alert.alert('导入失败', error.message);
    } finally {
      setImporting(false);
      setImportMode(null);
    }
  };

  const handleClipboardImport = async () => {
    if (!clipboardText.trim()) {
      Alert.alert('提示', '请先粘贴试题内容');
      return;
    }

    try {
      setImporting(true);
      setImportMode('clipboard');

      const result = await importFromClipboard(clipboardText);

      if (result.success && result.count > 0) {
        await insertQuestions(result.questions);

        Alert.alert(
          '导入成功',
          `成功导入 ${result.count} 道试题`,
          [
            {
              text: '开始刷题',
              onPress: () => navigation.navigate('Practice'),
            },
          ]
        );

        setClipboardText('');
      } else {
        Alert.alert('导入失败', result.error || '未识别到试题格式');
      }
    } catch (error) {
      Alert.alert('导入失败', error.message);
    } finally {
      setImporting(false);
      setImportMode(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Excel 导入 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 Excel 文件导入</Text>
        <Text style={styles.sectionDesc}>
          支持 .xlsx / .xls 格式，支持标准试题表格
        </Text>

        <TouchableOpacity
          style={[styles.importCard, importing && importMode === 'excel' && styles.importCardActive]}
          onPress={handleExcelImport}
          disabled={importing}
        >
          <View style={styles.importIcon}>
            <Icon name="insert-drive-file" size={40} color="#4CAF50" />
          </View>
          <View style={styles.importInfo}>
            <Text style={styles.importTitle}>选择 Excel 文件</Text>
            <Text style={styles.importSubtitle}>
              从手机存储选择试题表格
            </Text>
          </View>
          {importing && importMode === 'excel' && (
            <ActivityIndicator size="small" color="#4CAF50" />
          )}
        </TouchableOpacity>

        <View style={styles.formatGuide}>
          <Text style={styles.formatTitle}>📋 Excel 格式要求：</Text>
          <Text style={styles.formatItem}>• 第 1 行：表头（题目、选项 A、选项 B、选项 C、选项 D、答案、解析）</Text>
          <Text style={styles.formatItem}>• 第 2 行起：试题数据</Text>
          <Text style={styles.formatItem}>• 答案列：填写 A/B/C/D</Text>
          <Text style={styles.formatItem}>• 分类列（可选）：用于题目分类</Text>
          <Text style={styles.formatItem}>• 难度列（可选）：1-5 星</Text>
        </View>
      </View>

      {/* 剪贴板导入 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 剪贴板导入</Text>
        <Text style={styles.sectionDesc}>
          从其他应用复制试题文本，粘贴到下方
        </Text>

        <TextInput
          style={styles.clipboardInput}
          placeholder="在此粘贴试题内容...

格式示例：
1、下列哪项是正确的？
A. 选项一
B. 选项二
C. 选项三
D. 选项四
答案：A
解析：这是正确答案的原因
"
          placeholderTextColor="#999"
          multiline
          value={clipboardText}
          onChangeText={setClipboardText}
          editable={!importing}
        />

        <TouchableOpacity
          style={[styles.pasteButton, importing && styles.pasteButtonDisabled]}
          onPress={handleClipboardImport}
          disabled={importing || !clipboardText.trim()}
        >
          {importing && importMode === 'clipboard' ? (
            <>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.pasteButtonText}>导入中...</Text>
            </>
          ) : (
            <>
              <Icon name="file-download" size={20} color="#FFF" />
              <Text style={styles.pasteButtonText}>导入试题</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 批量导入提示 */}
      <View style={styles.tipsCard}>
        <Icon name="lightbulb" size={24} color="#FF9800" />
        <View style={styles.tipsContent}>
          <Text style={styles.tipsTitle}>💡 批量导入技巧</Text>
          <Text style={styles.tipItem}>
            • Excel 格式最适合大量试题（100+ 题）
          </Text>
          <Text style={styles.tipItem}>
            • 剪贴板适合少量试题（<50 题）
          </Text>
          <Text style={styles.tipItem}>
            • 可在飞书/微信中整理好试题后复制
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  importCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  importCardActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  importIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  importInfo: {
    flex: 1,
  },
  importTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  importSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  formatGuide: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  formatTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formatItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  clipboardInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    lineHeight: 22,
    height: 200,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
  },
  pasteButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  pasteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 13,
    color: '#E65100',
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default ImportScreen;
