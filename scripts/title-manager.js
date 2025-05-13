/**
 * 标题管理模块
 * 用于管理网站标题的修改、保存和加载
 */

import TooltipHandler from './tooltip-handler.js';

const TitleManager = {
    /**
     * 初始化标题管理器
     */
    init: function() {
        // 获取DOM元素
        this.editTitleBtn = document.getElementById('edit-title-btn');
        this.editTitleModal = document.getElementById('edit-title-modal');
        this.titleInput = document.getElementById('website-title');
        this.saveTitleBtn = document.getElementById('save-title-btn');
        this.closeButtons = this.editTitleModal.querySelectorAll('.modal-close, .modal-close-btn');
        
        // 绑定事件处理函数
        this.bindEvents();
        
        // 从本地存储加载标题
        this.loadTitleFromStorage();
    },
    
    /**
     * 绑定事件
     */
    bindEvents: function() {
        // 编辑标题按钮点击事件
        if (this.editTitleBtn) {
            this.editTitleBtn.addEventListener('click', this.showModal.bind(this));
        }
        
        // 保存标题按钮点击事件
        if (this.saveTitleBtn) {
            this.saveTitleBtn.addEventListener('click', this.saveTitle.bind(this));
        }
        
        // 关闭按钮点击事件
        this.closeButtons.forEach(button => {
            button.addEventListener('click', this.hideModal.bind(this));
        });
    },
    
    /**
     * 显示标题编辑模态框
     */
    showModal: function() {
        // 检查是否在编辑模式
        if (!document.body.classList.contains('edit-mode')) {
            TooltipHandler.showTooltip('请先启用编辑模式', 'error');
            return;
        }
        
        // 填充当前标题
        const currentTitle = document.querySelector('title').textContent;
        this.titleInput.value = currentTitle;
        
        // 显示模态框
        this.editTitleModal.classList.add('active');
        
        // 聚焦输入框
        this.titleInput.focus();
    },
    
    /**
     * 隐藏标题编辑模态框
     */
    hideModal: function() {
        this.editTitleModal.classList.remove('active');
    },
    
    /**
     * 保存标题
     */
    saveTitle: function() {
        const newTitle = this.titleInput.value.trim();
        
        // 验证输入
        if (!newTitle) {
            TooltipHandler.showTooltip('请输入网站标题', 'error');
            return;
        }
        
        // 更新页面标题
        document.querySelector('title').textContent = newTitle;
        document.querySelector('.title-container h1').textContent = newTitle;
        
        // 保存到本地存储
        localStorage.setItem('websiteTitle', newTitle);
        
        // 显示成功提示
        TooltipHandler.showTooltip('网站标题已更新', 'success');
        
        // 隐藏模态框
        this.hideModal();
    },
    
    /**
     * 从本地存储加载标题
     */
    loadTitleFromStorage: function() {
        const savedTitle = localStorage.getItem('websiteTitle');
        if (savedTitle) {
            document.querySelector('title').textContent = savedTitle;
            document.querySelector('.title-container h1').textContent = savedTitle;
        }
    },
    
    /**
     * 获取当前网站标题
     * @returns {string} 当前网站标题
     */
    getCurrentTitle: function() {
        return document.querySelector('title').textContent || '常用网站合集';
    }
};

export default TitleManager; 