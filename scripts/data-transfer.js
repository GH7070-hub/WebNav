/**
 * 数据传输模块
 * 处理数据的导入导出功能
 */

import TooltipHandler from './tooltip-handler.js';

const DataTransfer = {
    /**
     * 初始化数据传输模块
     */
    init: function() {
        // 绑定导入导出按钮事件
        const exportBtn = document.querySelector('.export-btn');
        const importBtn = document.querySelector('.import-btn');
        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.json';
        importInput.style.display = 'none';
        document.body.appendChild(importInput);
        
        // 导出按钮点击事件
        exportBtn.addEventListener('click', () => this.exportData());
        
        // 导入按钮点击事件
        importBtn.addEventListener('click', () => importInput.click());
        
        // 文件选择事件
        importInput.addEventListener('change', (event) => this.importData(event));
    },
    
    /**
     * 导出数据
     */
    exportData: function() {
        try {
            // 获取本地存储数据
            const data = {
                navItems: JSON.parse(localStorage.getItem('navItems') || '[]'),
                groups: JSON.parse(localStorage.getItem('groups') || '[]'),
                cards: JSON.parse(localStorage.getItem('cards') || '[]')
            };
            
            // 创建Blob对象
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            
            // 创建下载链接
            const a = document.createElement('a');
            a.href = url;
            a.download = 'website-navigation-data.json';
            document.body.appendChild(a);
            a.click();
            
            // 清理
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            TooltipHandler.showTooltip('数据导出成功', 'success');
        } catch (error) {
            TooltipHandler.showTooltip('数据导出失败', 'error');
        }
    },
    
    /**
     * 导入数据
     * @param {Event} event - 文件选择事件
     */
    importData: function(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                // 解析JSON数据
                const importedData = JSON.parse(e.target.result);
                
                // 验证数据结构
                if (!this.validateImportData(importedData)) {
                    TooltipHandler.showTooltip('导入失败：数据格式不正确', 'error');
                    return;
                }
                
                // 显示确认对话框
                if (confirm('导入将覆盖当前数据，确定要继续吗？')) {
                    try {
                        // 保存数据到本地存储
                        localStorage.setItem('navItems', JSON.stringify(importedData.navItems));
                        localStorage.setItem('groups', JSON.stringify(importedData.groups));
                        localStorage.setItem('cards', JSON.stringify(importedData.cards));
                        
                        TooltipHandler.showTooltip('数据导入成功，即将刷新页面', 'success');
                        setTimeout(() => location.reload(), 1500);
                    } catch (error) {
                        TooltipHandler.showTooltip('数据保存失败', 'error');
                    }
                }
            } catch (error) {
                TooltipHandler.showTooltip('数据解析失败', 'error');
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // 清除文件选择，允许重复选择同一文件
    },
    
    /**
     * 验证导入的数据结构
     * @param {Object} data - 导入的数据对象
     * @returns {boolean} 验证结果
     */
    validateImportData: function(data) {
        // 检查必要的数据结构
        if (!data || typeof data !== 'object') return false;
        if (!Array.isArray(data.navItems)) return false;
        if (!Array.isArray(data.groups)) return false;
        if (!Array.isArray(data.cards)) return false;
        
        // 验证导航项数据结构
        for (const item of data.navItems) {
            if (!item.id || !item.name) return false;
        }
        
        // 验证分组数据结构
        for (const group of data.groups) {
            if (!group.id || !group.name || !group.navId) return false;
        }
        
        // 验证卡片数据结构
        for (const card of data.cards) {
            if (!card.url || !card.title || !card.groupId) return false;
        }
        
        return true;
    }
};

export default DataTransfer;