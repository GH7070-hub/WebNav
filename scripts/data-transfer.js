/**
 * 数据传输模块
 * 处理数据的导入导出功能
 */

import DataStore from './data-store.js';

const DataTransfer = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        const exportBtn = document.querySelector('.export-btn');
        const importBtn = document.querySelector('.import-btn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }
    },

    exportData() {
        const data = DataStore.getAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'webnav-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    DataStore.importData(data);
                    location.reload();
                } catch (error) {
                    alert('导入失败：无效的数据格式');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
};

export default DataTransfer;