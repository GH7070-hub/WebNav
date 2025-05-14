/**
 * 数据传输模块
 * 处理数据的导入导出功能
 */

import TooltipHandler from './tooltip-handler.js';

const DataTransfer = {
    init: function() {
        const exportBtn = document.querySelector('.export-btn');
        const importBtn = document.querySelector('.import-btn');
        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.json';
        importInput.style.display = 'none';
        document.body.appendChild(importInput);
        
        exportBtn.addEventListener('click', () => this.exportData());
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (event) => this.importData(event));
    },
    
    exportData: function() {
        try {
            const data = {
                navItems: JSON.parse(localStorage.getItem('navItems') || '[]'),
                groups: JSON.parse(localStorage.getItem('groups') || '[]'),
                cards: JSON.parse(localStorage.getItem('cards') || '[]')
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'website-navigation-data.json';
            document.body.appendChild(a);
            a.click();
            
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            TooltipHandler.showTooltip('数据导出成功', 'success');
        } catch (error) {
            TooltipHandler.showTooltip('数据导出失败', 'error');
        }
    },
    
    importData: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!this.validateImportData(importedData)) {
                    TooltipHandler.showTooltip('导入失败：数据格式不正确', 'error');
                    return;
                }
                
                if (confirm('导入将覆盖当前数据，确定要继续吗？')) {
                    try {
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
        event.target.value = '';
    },
    
    validateImportData: function(data) {
        if (!data || typeof data !== 'object') return false;
        if (!Array.isArray(data.navItems)) return false;
        if (!Array.isArray(data.groups)) return false;
        if (!Array.isArray(data.cards)) return false;
        
        for (const item of data.navItems) {
            if (!item.id || !item.name) return false;
        }
        
        for (const group of data.groups) {
            if (!group.id || !group.name || !group.navId) return false;
        }
        
        for (const card of data.cards) {
            if (!card.url || !card.title || !card.groupId) return false;
        }
        
        return true;
    }
};

export default DataTransfer;