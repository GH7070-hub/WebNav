/**
 * 导航管理模块
 * 处理导航菜单的添加、修改和删除功能
 */

import DataStore from './data-store.js';

const NavManager = {
    /**
     * 初始化导航管理器
     */
    init: function() {
        // 获取DOM元素
        this.modal = document.getElementById('nav-management-modal');
        this.closeButtons = this.modal.querySelectorAll('.modal-close, .modal-close-btn');
        this.saveButton = document.getElementById('save-nav-btn');
        this.operationSelect = document.getElementById('nav-operation');
        this.navSelectionContainer = document.getElementById('nav-selection-container');
        this.navSelection = document.getElementById('nav-selection');
        this.navIdContainer = document.getElementById('nav-id-container');
        this.navIdInput = document.getElementById('nav-id');
        this.navNameContainer = document.getElementById('nav-name-container');
        this.navNameInput = document.getElementById('nav-name');
        
        // 绑定事件处理函数
        this.bindEvents();
    },
    
    /**
     * 绑定事件处理函数
     */
    bindEvents: function() {
        // 关闭模态框
        this.closeButtons.forEach(button => {
            button.addEventListener('click', this.hideModal.bind(this));
        });
        
        // 点击模态框外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
        
        // 操作类型变更事件
        this.operationSelect.addEventListener('change', this.handleOperationChange.bind(this));
        
        // 导航选择变更事件
        this.navSelection.addEventListener('change', this.handleNavSelectionChange.bind(this));
        
        // 保存按钮点击事件
        this.saveButton.addEventListener('click', this.handleSave.bind(this));
    },
    
    /**
     * 显示导航管理模态框
     */
    showModal: function() {
        // 重置表单
        this.resetForm();
        
        // 填充导航下拉列表
        this.populateNavSelection();
        
        // 显示模态框
        this.modal.classList.add('active');
    },
    
    /**
     * 隐藏模态框
     */
    hideModal: function() {
        this.modal.classList.remove('active');
    },
    
    /**
     * 重置表单
     */
    resetForm: function() {
        this.operationSelect.value = 'add';
        this.navIdInput.value = '';
        this.navNameInput.value = '';
        this.navSelectionContainer.style.display = 'none';
        this.navIdContainer.style.display = 'block';
        this.navNameContainer.style.display = 'block';
        
        // 启用ID输入框
        this.navIdInput.disabled = false;
    },
    
    /**
     * 填充导航下拉列表
     */
    populateNavSelection: function() {
        // 清空下拉列表
        this.navSelection.innerHTML = '';
        
        // 添加导航选项
        DataStore.navigation.forEach(navItem => {
            const option = document.createElement('option');
            option.value = navItem.id;
            option.textContent = navItem.name;
            this.navSelection.appendChild(option);
        });
        
        // 如果有导航项，默认选中第一个
        if (DataStore.navigation.length > 0) {
            this.navSelection.value = DataStore.navigation[0].id;
            // 如果当前操作是编辑，填充导航信息
            if (this.operationSelect.value === 'edit') {
                const selectedNav = DataStore.navigation[0];
                this.navIdInput.value = selectedNav.id;
                this.navNameInput.value = selectedNav.name;
            }
        }
    },
    
    /**
     * 处理操作类型变更
     */
    handleOperationChange: function() {
        const operation = this.operationSelect.value;
        
        // 根据操作类型显示/隐藏相应的表单元素
        if (operation === 'add') {
            this.navSelectionContainer.style.display = 'none';
            this.navIdContainer.style.display = 'block';
            this.navNameContainer.style.display = 'block';
            this.navIdInput.value = '';
            this.navNameInput.value = '';
            this.navIdInput.disabled = false;
        } else {
            this.navSelectionContainer.style.display = 'block';
            
            // 如果是编辑操作，显示ID和名称输入框
            if (operation === 'edit') {
                this.navIdContainer.style.display = 'block';
                this.navNameContainer.style.display = 'block';
                // 禁用ID输入框，ID不可修改
                this.navIdInput.disabled = true;
                
                // 填充当前选中的导航信息
                const selectedNavId = this.navSelection.value;
                const selectedNav = DataStore.navigation.find(nav => nav.id === selectedNavId);
                if (selectedNav) {
                    this.navIdInput.value = selectedNav.id;
                    this.navNameInput.value = selectedNav.name;
                }
            } else {
                // 如果是删除操作，隐藏ID和名称输入框
                this.navIdContainer.style.display = 'none';
                this.navNameContainer.style.display = 'none';
            }
        }
    },
    
    /**
     * 处理导航选择变更
     */
    handleNavSelectionChange: function() {
        // 如果当前操作是编辑，更新导航信息
        if (this.operationSelect.value === 'edit') {
            const selectedNavId = this.navSelection.value;
            const selectedNav = DataStore.navigation.find(nav => nav.id === selectedNavId);
            if (selectedNav) {
                this.navIdInput.value = selectedNav.id;
                this.navNameInput.value = selectedNav.name;
            }
        }
    },
    
    /**
     * 处理保存按钮点击
     */
    handleSave: function() {
        const operation = this.operationSelect.value;
        
        switch (operation) {
            case 'add':
                this.addNav();
                break;
            case 'edit':
                this.editNav();
                break;
            case 'delete':
                this.deleteNav();
                break;
        }
    },
    
    /**
     * 添加导航
     */
    addNav: function() {
        const navId = this.navIdInput.value.trim();
        const navName = this.navNameInput.value.trim();
        
        // 验证输入
        if (!navId || !navName) {
            alert('请填写完整的导航信息');
            return;
        }
        
        // 验证ID格式
        if (!/^[a-zA-Z0-9_]+$/.test(navId)) {
            alert('导航ID只能包含英文字母、数字和下划线');
            return;
        }
        
        // 检查ID是否已存在
        const existingNav = DataStore.navigation.find(nav => nav.id === navId);
        if (existingNav) {
            alert(`导航ID "${navId}" 已存在`);
            return;
        }
        
        // 创建新导航项
        const newNav = {
            id: navId,
            name: navName,
            isActive: false
        };
        
        // 添加到导航数组
        DataStore.navigation.push(newNav);
        
        // 为新导航项创建卡片数据结构
        DataStore.cards[navId] = [];
        
        // 保存到本地存储
        this.saveToLocalStorage();
        
        // 关闭模态框
        this.hideModal();
        
        // 显示成功消息并在关闭提示后刷新页面
        alert(`导航项 "${navName}" 添加成功！页面将自动刷新以应用更改。`);
        
        // 刷新页面
        window.location.reload();
    },
    
    /**
     * 编辑导航
     */
    editNav: function() {
        const navId = this.navSelection.value;
        const newNavName = this.navNameInput.value.trim();
        
        // 验证输入
        if (!newNavName) {
            alert('请输入导航名称');
            return;
        }
        
        // 查找要编辑的导航
        const navToEdit = DataStore.navigation.find(nav => nav.id === navId);
        
        if (navToEdit) {
            // 更新导航名称
            navToEdit.name = newNavName;
            
            // 保存到本地存储
            this.saveToLocalStorage();
            
            // 关闭模态框
            this.hideModal();
            
            // 显示成功消息并在关闭提示后刷新页面
            alert(`导航项 "${navId}" 已更新为 "${newNavName}"！页面将自动刷新以应用更改。`);
            
            // 刷新页面
            window.location.reload();
        }
    },
    
    /**
     * 删除导航
     */
    deleteNav: function() {
        const navId = this.navSelection.value;
        
        // 不允许删除全部导航项
        if (DataStore.navigation.length <= 1) {
            alert('不能删除所有导航项，至少需要保留一个导航项');
            return;
        }
        
        // 获取导航名称，用于确认提示
        const navToDelete = DataStore.navigation.find(nav => nav.id === navId);
        if (!navToDelete) {
            return;
        }
        
        // 确认是否删除
        if (!confirm(`确定要删除导航项 "${navToDelete.name}" 吗？此操作将删除该导航下的所有分组和规则，且不可恢复。`)) {
            return;
        }
        
        // 检查是否为当前活动的导航项
        const isActive = navToDelete.isActive;
        
        // 查找要删除的导航索引
        const navIndex = DataStore.navigation.findIndex(nav => nav.id === navId);
        
        if (navIndex !== -1) {
            // 删除导航
            DataStore.navigation.splice(navIndex, 1);
            
            // 删除对应的卡片数据
            delete DataStore.cards[navId];
            
            // 如果删除的是当前活动的导航项，将第一个导航项设为活动
            if (isActive && DataStore.navigation.length > 0) {
                DataStore.navigation[0].isActive = true;
            }
            
            // 保存到本地存储
            this.saveToLocalStorage();
            
            // 关闭模态框
            this.hideModal();
            
            // 显示成功消息并在关闭提示后刷新页面
            alert(`导航项 "${navToDelete.name}" 已成功删除！页面将自动刷新以应用更改。`);
            
            // 刷新页面
            window.location.reload();
        }
    },
    
    /**
     * 保存到本地存储
     */
    saveToLocalStorage: function() {
        localStorage.setItem('ruleSystemData', JSON.stringify(DataStore));
    },
    
    /**
     * 触发UI更新
     */
    triggerUIUpdate: function() {
        // 创建并分发自定义事件
        const event = new CustomEvent('dataUpdated');
        document.dispatchEvent(event);
    }
};

export default NavManager; 