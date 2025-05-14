/**
 * 分组管理模块
 * 处理分组的添加、修改和删除功能
 */

import DataStore from './data-store.js';

const GroupManager = {
    /**
     * 初始化分组管理器
     */
    init: function() {
        // 获取DOM元素
        this.modal = document.getElementById('group-management-modal');
        this.closeButtons = this.modal.querySelectorAll('.modal-close, .modal-close-btn');
        this.saveButton = document.getElementById('save-group-btn');
        this.operationSelect = document.getElementById('group-operation');
        this.groupSelectionContainer = document.getElementById('group-selection-container');
        this.groupSelection = document.getElementById('group-selection');
        this.groupNameContainer = document.getElementById('group-name-container');
        this.groupNameInput = document.getElementById('group-name');
        
        // 颜色选择相关元素
        this.groupColorContainer = document.getElementById('group-color-container');
        this.groupColorSelect = document.getElementById('group-color');
        this.colorPreviews = document.querySelectorAll('.color-preview');
        
        // 目标菜单选择
        this.navTargetContainer = document.getElementById('nav-target-container');
        this.navTargetSelection = document.getElementById('nav-target-selection');
        
        // 存储当前操作的卡片类型
        this.currentCardType = '';
        
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
        
        // 分组选择变更事件
        this.groupSelection.addEventListener('change', this.handleGroupSelectionChange.bind(this));
        
        // 保存按钮点击事件
        this.saveButton.addEventListener('click', this.handleSave.bind(this));
        
        // 颜色选择下拉框变更事件
        this.groupColorSelect.addEventListener('change', this.handleColorSelectChange.bind(this));
        
        // 颜色预览点击事件
        this.colorPreviews.forEach(preview => {
            preview.addEventListener('click', this.handleColorPreviewClick.bind(this));
        });
    },
    
    /**
     * 处理颜色选择变更
     */
    handleColorSelectChange: function(e) {
        // 更新预览图标的选中状态
        const selectedValue = e.target.value;
        this.updateColorPreviewSelection(selectedValue);
    },
    
    /**
     * 处理颜色预览点击
     */
    handleColorPreviewClick: function(e) {
        const clickedPreview = e.target;
        const colorValue = clickedPreview.getAttribute('data-value');
        
        // 更新下拉框选中值
        this.groupColorSelect.value = colorValue;
        
        // 更新预览图标的选中状态
        this.updateColorPreviewSelection(colorValue);
    },
    
    /**
     * 更新颜色预览的选择状态
     * @param {string} selectedValue - 选中的颜色值
     */
    updateColorPreviewSelection: function(selectedValue) {
        // 移除所有预览的选中状态
        this.colorPreviews.forEach(preview => {
            preview.classList.remove('selected');
        });
        
        // 为当前选择的颜色添加选中状态
        const selectedPreview = document.querySelector(`.color-preview[data-value="${selectedValue}"]`);
        if (selectedPreview) {
            selectedPreview.classList.add('selected');
        }
    },
    
    /**
     * 显示分组管理模态框
     * @param {string} cardType - 卡片类型ID
     */
    showModal: function(cardType) {
        // 设置当前卡片类型
        this.currentCardType = cardType;
        
        // 初始化分组选择下拉框
        this.initGroupSelection(cardType);
        
        // 显示模态框
        this.modal.classList.add('active');
        
        // 设置模态框标题
        const modalTitle = this.modal.querySelector('.modal-title');
        const cardTypeName = this.getCardTypeName(cardType);
        modalTitle.textContent = `${cardTypeName} - 分组管理`;
        
        // 默认选择第一个颜色
        this.groupColorSelect.value = "1";
        this.updateColorPreviewSelection("1");
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
        this.groupNameInput.value = '';
        this.groupSelectionContainer.style.display = 'none';
        this.groupNameContainer.style.display = 'block';
        this.groupColorContainer.style.display = 'block';
        
        // 重置颜色选择为默认值
        this.groupColorSelect.value = "1";
        this.updateColorPreviewSelection("1");
    },
    
    /**
     * 初始化分组选择下拉框
     * @param {string} cardType - 卡片类型ID
     */
    initGroupSelection: function(cardType) {
        // 重置表单
        this.resetForm();
        
        // 设置当前卡片类型（已在showModal中设置，这里确保一致性）
        this.currentCardType = cardType;
        
        // 填充分组下拉列表
        this.populateGroupSelection();
        
        // 设置操作类型为添加
        this.operationSelect.value = 'add';
        
        // 更新表单显示
        this.handleOperationChange();
    },
    
    /**
     * 填充分组下拉列表
     */
    populateGroupSelection: function() {
        // 清空下拉列表
        this.groupSelection.innerHTML = '';
        
        // 获取当前卡片类型的所有分组
        const cardTypeData = DataStore.cards[this.currentCardType];
        
        // 添加分组选项
        cardTypeData.forEach(group => {
            const option = document.createElement('option');
            option.value = group.groupName;
            option.textContent = group.groupName;
            
            // 如果有颜色数据，存储在data属性中
            if (group.colorIndex) {
                option.setAttribute('data-color', group.colorIndex);
            }
            
            this.groupSelection.appendChild(option);
        });
        
        // 如果有分组，默认选中第一个
        if (cardTypeData.length > 0) {
            this.groupSelection.value = cardTypeData[0].groupName;
            // 如果当前操作是编辑，填充分组名称和颜色
            if (this.operationSelect.value === 'edit') {
                this.handleGroupSelectionChange();
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
            this.groupSelectionContainer.style.display = 'none';
            this.navTargetContainer.style.display = 'none';
            this.groupNameContainer.style.display = 'block';
            this.groupColorContainer.style.display = 'block';
            this.groupNameInput.value = '';
            
            // 重置颜色选择为默认值
            this.groupColorSelect.value = "1";
            this.updateColorPreviewSelection("1");
        } else {
            this.groupSelectionContainer.style.display = 'block';
            
            // 根据不同操作类型显示不同元素
            if (operation === 'edit') {
                this.navTargetContainer.style.display = 'none';
                this.groupNameContainer.style.display = 'block';
                this.groupColorContainer.style.display = 'block';
                this.handleGroupSelectionChange();
            } else if (operation === 'delete') {
                this.navTargetContainer.style.display = 'none';
                this.groupNameContainer.style.display = 'none';
                this.groupColorContainer.style.display = 'none';
            } else if (operation === 'move') {
                this.navTargetContainer.style.display = 'block';
                this.groupNameContainer.style.display = 'none';
                this.groupColorContainer.style.display = 'none';
                // 填充目标菜单下拉列表
                this.populateNavTargetSelection();
            }
        }
    },
    
    /**
     * 处理分组选择变更
     */
    handleGroupSelectionChange: function() {
        // 如果当前操作是编辑，更新分组名称输入框的值和颜色选择
        if (this.operationSelect.value === 'edit') {
            const selectedOption = this.groupSelection.options[this.groupSelection.selectedIndex];
            this.groupNameInput.value = selectedOption.value;
            
            // 获取所选分组的数据
            const cardTypeData = DataStore.cards[this.currentCardType];
            const selectedGroup = cardTypeData.find(group => group.groupName === selectedOption.value);
            
            // 更新颜色选择器的值
            if (selectedGroup && selectedGroup.colorIndex) {
                this.groupColorSelect.value = selectedGroup.colorIndex;
                this.updateColorPreviewSelection(selectedGroup.colorIndex);
            } else {
                // 如果没有颜色数据，设置为默认值
                this.groupColorSelect.value = "1";
                this.updateColorPreviewSelection("1");
            }
        }
    },
    
    /**
     * 填充目标菜单下拉列表
     */
    populateNavTargetSelection: function() {
        // 清空下拉列表
        this.navTargetSelection.innerHTML = '';
        
        // 获取所有导航菜单项
        const navigationItems = DataStore.navigation;
        
        // 添加菜单选项
        navigationItems.forEach(navItem => {
            // 不包括当前菜单（防止自己移动到自己）
            if (navItem.id !== this.currentCardType) {
                const option = document.createElement('option');
                option.value = navItem.id;
                option.textContent = navItem.name;
                this.navTargetSelection.appendChild(option);
            }
        });
    },
    
    /**
     * 处理保存按钮点击
     */
    handleSave: function() {
        const operation = this.operationSelect.value;
        
        switch (operation) {
            case 'add':
                this.addGroup();
                break;
            case 'edit':
                this.editGroup();
                break;
            case 'delete':
                this.deleteGroup();
                break;
            case 'move':
                this.moveGroup();
                break;
        }
    },
    
    /**
     * 添加分组
     */
    addGroup: function() {
        const groupName = this.groupNameInput.value.trim();
        const colorIndex = this.groupColorSelect.value;
        
        // 验证分组名称
        if (!groupName) {
            alert('请输入分组名称');
            return;
        }
        
        // 检查分组名称是否已存在
        const cardTypeData = DataStore.cards[this.currentCardType];
        const existingGroup = cardTypeData.find(group => group.groupName === groupName);
        
        if (existingGroup) {
            alert(`分组"${groupName}"已存在`);
            return;
        }
        
        // 创建新分组，包含颜色信息
        cardTypeData.push({
            groupName: groupName,
            colorIndex: colorIndex,
            items: []
        });
        
        // 保存到本地存储
        this.saveToLocalStorage();
        
        // 关闭模态框
        this.hideModal();
        
        // 显示成功消息
        alert(`分组"${groupName}"添加成功！`);
        
        // 触发UI更新
        this.triggerUIUpdate();
    },
    
    /**
     * 编辑分组
     */
    editGroup: function() {
        const oldGroupName = this.groupSelection.value;
        const newGroupName = this.groupNameInput.value.trim();
        const colorIndex = this.groupColorSelect.value;
        
        // 验证分组名称
        if (!newGroupName) {
            alert('请输入分组名称');
            return;
        }
        
        // 如果名称没有变化，只更新颜色
        if (oldGroupName === newGroupName) {
            // 查找要编辑的分组
            const cardTypeData = DataStore.cards[this.currentCardType];
            const groupToEdit = cardTypeData.find(group => group.groupName === oldGroupName);
            
            if (groupToEdit) {
                // 更新分组颜色
                groupToEdit.colorIndex = colorIndex;
                
                // 保存到本地存储
                this.saveToLocalStorage();
                
                // 关闭模态框
                this.hideModal();
                
                // 显示成功消息
                alert(`分组"${oldGroupName}"的颜色已更新！`);
                
                // 触发UI更新
                this.triggerUIUpdate();
            }
            
            return;
        }
        
        // 检查新分组名称是否已存在
        const cardTypeData = DataStore.cards[this.currentCardType];
        const existingGroup = cardTypeData.find(group => group.groupName === newGroupName);
        
        if (existingGroup) {
            alert(`分组"${newGroupName}"已存在`);
            return;
        }
        
        // 查找要编辑的分组
        const groupToEdit = cardTypeData.find(group => group.groupName === oldGroupName);
        
        if (groupToEdit) {
            // 更新分组名称和颜色
            groupToEdit.groupName = newGroupName;
            groupToEdit.colorIndex = colorIndex;
            
            // 保存到本地存储
            this.saveToLocalStorage();
            
            // 关闭模态框
            this.hideModal();
            
            // 显示成功消息
            alert(`分组"${oldGroupName}"已更新为"${newGroupName}"！`);
            
            // 触发UI更新
            this.triggerUIUpdate();
        }
    },
    
    /**
     * 删除分组
     */
    deleteGroup: function() {
        const groupName = this.groupSelection.value;
        
        // 确认是否删除
        if (!confirm(`确定要删除分组"${groupName}"吗？此操作将删除该分组下的所有规则，且不可恢复。`)) {
            return;
        }
        
        // 查找要删除的分组索引
        const cardTypeData = DataStore.cards[this.currentCardType];
        const groupIndex = cardTypeData.findIndex(group => group.groupName === groupName);
        
        if (groupIndex !== -1) {
            // 删除分组
            cardTypeData.splice(groupIndex, 1);
            
            // 保存到本地存储
            this.saveToLocalStorage();
            
            // 关闭模态框
            this.hideModal();
            
            // 显示成功消息
            alert(`分组"${groupName}"已成功删除！`);
            
            // 触发UI更新
            this.triggerUIUpdate();
        }
    },
    
    /**
     * 移动分组
     */
    moveGroup: function() {
        const groupName = this.groupSelection.value;
        const targetNavId = this.navTargetSelection.value;
        
        // 确认是否移动
        if (!confirm(`确定要将分组"${groupName}"移动到"${this.getCardTypeName(targetNavId)}"菜单下吗？`)) {
            return;
        }
        
        // 检查目标菜单是否已存在同名分组
        const targetCardTypeData = DataStore.cards[targetNavId];
        const existingGroup = targetCardTypeData.find(group => group.groupName === groupName);
        
        if (existingGroup) {
            alert(`目标菜单下已存在名为"${groupName}"的分组，请先修改分组名称或目标分组名称`);
            return;
        }
        
        // 查找要移动的分组
        const sourceCardTypeData = DataStore.cards[this.currentCardType];
        const groupIndex = sourceCardTypeData.findIndex(group => group.groupName === groupName);
        
        if (groupIndex !== -1) {
            // 从源菜单移除并获取分组
            const groupToMove = sourceCardTypeData.splice(groupIndex, 1)[0];
            
            // 添加到目标菜单
            targetCardTypeData.push(groupToMove);
            
            // 保存到本地存储
            this.saveToLocalStorage();
            
            // 关闭模态框
            this.hideModal();
            
            // 显示成功消息
            alert(`分组"${groupName}"已成功移动到"${this.getCardTypeName(targetNavId)}"菜单下！`);
            
            // 触发UI更新
            this.triggerUIUpdate();
        }
    },
    
    /**
     * 获取卡片类型名称
     * @param {string} cardType - 卡片类型ID
     * @returns {string} 卡片类型名称
     */
    getCardTypeName: function(cardType) {
        const navItem = DataStore.navigation.find(item => item.id === cardType);
        return navItem ? navItem.name : cardType;
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

export default GroupManager; 