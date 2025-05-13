/**
 * 数据传输模块
 * 用于导出和导入系统数据，方便备份和迁移
 */

import DataStore from './data-store.js';
import TooltipHandler from './tooltip-handler.js';
import TitleManager from './title-manager.js';

const DataTransfer = {
    /**
     * 初始化数据传输模块
     */
    init: function() {
        // 添加隐藏的文件输入框，用于导入
        this.createFileInput();
        this.bindEvents();
    },
    
    /**
     * 创建文件输入框
     */
    createFileInput: function() {
        // 创建隐藏的文件输入框，用于导入
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'import-file-input';
        fileInput.accept = 'application/json';
        fileInput.style.display = 'none';
        
        // 将文件输入框添加到页面
        document.body.appendChild(fileInput);
    },
    
    /**
     * 绑定事件
     */
    bindEvents: function() {
        // 使用已有的HTML按钮
        const exportBtn = document.querySelector('.export-btn');
        const importBtn = document.querySelector('.import-btn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', this.exportData.bind(this));
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', this.triggerImport.bind(this));
        }
        
        document.getElementById('import-file-input').addEventListener('change', this.importData.bind(this));
    },
    
    /**
     * 触发导入文件选择
     */
    triggerImport: function() {
        document.getElementById('import-file-input').click();
    },
    
    /**
     * 导入数据
     * @param {Event} event - 文件选择事件
     */
    importData: function(event) {
        const file = event.target.files[0];
        if (!file) {
            console.log('没有选择文件');
            return;
        }
        
        console.log('开始导入文件:', file.name, '大小:', file.size, '类型:', file.type);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                console.log('文件读取成功，开始解析JSON');
                // 解析JSON数据
                const importedData = JSON.parse(e.target.result);
                console.log('JSON解析成功:', importedData);
                
                // 验证数据结构
                if (!this.validateImportData(importedData)) {
                    console.error('数据验证失败，结构不符合要求:', importedData);
                    TooltipHandler.showTooltip('导入失败：数据格式不正确', 'error');
                    return;
                }
                
                console.log('数据验证通过，准备导入');
                
                // 显示确认对话框
                if (confirm('导入将覆盖当前数据，确定要继续吗？')) {
                    try {
                    // 保存数据到本地存储
                    this.saveImportedData(importedData);
                        console.log('数据已成功保存到localStorage');
                    
                    // 显示成功提示
                    TooltipHandler.showTooltip('数据导入成功！页面将在3秒后刷新', 'success');
                    
                    // 延迟刷新页面，应用导入的数据
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                    } catch (saveError) {
                        console.error('保存数据到localStorage时出错:', saveError);
                        TooltipHandler.showTooltip('导入失败：无法保存数据', 'error');
                    }
                } else {
                    console.log('用户取消了导入操作');
                }
            } catch (error) {
                console.error('导入数据失败:', error);
                TooltipHandler.showTooltip('导入失败：无法解析JSON数据', 'error');
            }
        };
        
        reader.onerror = (error) => {
            console.error('读取文件时出错:', error);
            TooltipHandler.showTooltip('导入失败：无法读取文件', 'error');
        };
        
        reader.readAsText(file);
        
        // 重置文件输入，允许重复选择同一文件
        event.target.value = '';
    },
    
    /**
     * 验证导入数据的结构
     * @param {Object} data - 导入的数据
     * @returns {boolean} 数据是否有效
     */
    validateImportData: function(data) {
        // 检查基本结构
        if (!data || typeof data !== 'object') {
            console.error('验证失败：数据不是对象');
            return false;
        }
        
        // 检查必要的数据字段
        if (!data.navigation || !Array.isArray(data.navigation)) {
            console.error('验证失败：navigation字段不存在或不是数组');
            return false;
        }
        
        if (!data.cards || typeof data.cards !== 'object') {
            console.error('验证失败：cards字段不存在或不是对象');
            return false;
        }
        
        // 检查导航数据结构
        for (const nav of data.navigation) {
            if (!nav.id || !nav.name || typeof nav.isActive !== 'boolean') {
                console.error('验证失败：navigation项缺少必要字段', nav);
                return false;
            }
        }
        
        // 数据结构有效
        return true;
    },
    
    /**
     * 保存导入的数据到本地存储
     * @param {Object} data - 导入的数据
     */
    saveImportedData: function(data) {
        try {
            // 更新DataStore对象
            if (data.navigation) {
                DataStore.navigation = data.navigation;
            }
            
            if (data.cards) {
                DataStore.cards = data.cards;
            }
            
            // 保存到localStorage，使用正确的键名
            localStorage.setItem('ruleSystemData', JSON.stringify(DataStore));
            console.log('数据已成功保存到localStorage，使用键名：ruleSystemData');
            
            // 保存网站标题（如果存在）
            if (data.websiteTitle) {
                localStorage.setItem('websiteTitle', data.websiteTitle);
                document.querySelector('title').textContent = data.websiteTitle;
                document.querySelector('.title-container h1').textContent = data.websiteTitle;
                console.log('网站标题已更新:', data.websiteTitle);
            }
            
            // 不再单独保存navigation和cards，因为系统使用ruleSystemData作为键名
            // 以下代码已注释掉
            // localStorage.setItem('navigation', JSON.stringify(data.navigation));
            // localStorage.setItem('cards', JSON.stringify(data.cards));
        } catch (error) {
            console.error('保存到localStorage时出错:', error);
            throw error; // 重新抛出错误以便上层处理
        }
    },
    
    /**
     * 导出数据
     */
    exportData: function() {
        try {
            // 获取本地存储数据
            const localData = this.getLocalStorageData();
            
            // 合并本地数据和初始数据
            const exportData = this.mergeWithDefaultData(localData);
            
            // 添加网站标题到导出数据
            exportData.websiteTitle = TitleManager.getCurrentTitle();
            
            // 格式化数据为JSON字符串
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // 创建Blob对象
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // 获取网站标题
            const websiteTitle = TitleManager.getCurrentTitle();
            
            // 清理文件名（移除特殊字符）
            const cleanTitle = websiteTitle.replace(/[\/\\:*?"<>|]/g, '-');
            
            // 设置文件名（包含网站标题、日期时间）
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
            link.download = `${cleanTitle}_${dateStr}_${timeStr}.json`;
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 释放URL对象
            URL.revokeObjectURL(url);
            
            // 显示成功提示
            TooltipHandler.showTooltip('数据导出成功！', 'success');
        } catch (error) {
            console.error('导出数据失败:', error);
            TooltipHandler.showTooltip('导出数据失败，请重试！', 'error');
        }
    },
    
    /**
     * 获取本地存储数据
     * @returns {Object} 本地存储数据
     */
    getLocalStorageData: function() {
        const data = {};
        
        // 从ruleSystemData获取数据
        const savedData = localStorage.getItem('ruleSystemData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                
                // 获取导航数据
                if (parsedData.navigation) {
                    data.navigation = parsedData.navigation;
                }
                
                // 获取卡片数据
                if (parsedData.cards) {
                    data.cards = parsedData.cards;
                }
                
                console.log('从localStorage成功获取数据');
                return data;
            } catch (error) {
                console.error('解析localStorage数据时出错:', error);
            }
        }
        
        // 如果没有找到ruleSystemData或解析失败，尝试从单独的键中获取（向后兼容）
        console.log('尝试从单独的键中获取数据（向后兼容）');
        
        // 获取导航数据
        const navData = localStorage.getItem('navigation');
        if (navData) {
            try {
            data.navigation = JSON.parse(navData);
            } catch (e) {
                console.error('解析navigation数据时出错:', e);
            }
        }
        
        // 获取卡片数据
        const cardData = localStorage.getItem('cards');
        if (cardData) {
            try {
            data.cards = JSON.parse(cardData);
            } catch (e) {
                console.error('解析cards数据时出错:', e);
            }
        }
        
        return data;
    },
    
    /**
     * 合并本地数据和初始数据
     * @param {Object} localData - 本地存储数据
     * @returns {Object} 合并后的数据
     */
    mergeWithDefaultData: function(localData) {
        const exportData = {
            navigation: localData.navigation || DataStore.navigation,
            cards: localData.cards || DataStore.cards
        };
        
        return exportData;
    }
};

export default DataTransfer; 