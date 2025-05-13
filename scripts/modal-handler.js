/**
 * 模态框处理模块
 * 处理模态框显示/隐藏、网站信息获取和本地存储功能
 */

import DataStore from './data-store.js';

const ModalHandler = {
    /**
     * 初始化模态框处理器
     */
    init: function() {
        // 获取DOM元素
        this.modal = document.getElementById('add-rule-modal');
        this.closeButtons = this.modal.querySelectorAll('.modal-close, .modal-close-btn');
        this.saveButton = document.getElementById('save-rule-btn');
        this.iconSelector = document.getElementById('icon-selector');
        
        // 表单元素
        this.urlInput = document.getElementById('rule-url');
        this.titleInput = document.getElementById('rule-title');
        this.descriptionInput = document.getElementById('rule-description');
        this.selectedIconInput = document.getElementById('selected-icon');
        this.cardStyleSelect = document.getElementById('card-style');
        
        // 卡片样式颜色预览元素
        this.cardStylePreviews = document.querySelectorAll('.color-preview[data-value^="card"]');
        
        // 存储当前操作的分组和类型
        this.currentGroupName = '';
        this.currentCardType = '';
        this.isEditMode = false;
        this.editCardData = null;
        this.businessGroupIndex = -1;
        this.cardIndex = -1;
        
        // 动态加载图标
        this.loadIconOptions();
        
        // 绑定事件处理函数
        this.bindEvents();
    },
    
    /**
     * 动态加载图标选项
     */
    loadIconOptions: function() {
        // 清空图标选择器
        this.iconSelector.innerHTML = '';
        
        // 获取图标文件列表并返回Promise
        return this.fetchIconFiles().then(iconFiles => {
            // 如果没有找到图标文件，使用默认图标
            if (!iconFiles || iconFiles.length === 0) {
                const defaultIcon = 'a-hua1.png';
                this.createIconOption(defaultIcon);
                this.selectedIconInput.value = defaultIcon;
                return;
            }
            
            // 创建图标选项
            iconFiles.forEach((iconFile, index) => {
                this.createIconOption(iconFile);
                
                // 默认选中第一个图标
                if (index === 0) {
                    const firstOption = this.iconSelector.querySelector('.icon-option');
                    if (firstOption) {
                        firstOption.classList.add('selected');
                        this.selectedIconInput.value = iconFile;
                    }
                }
            });
            
            // 重新绑定图标选择事件
            this.bindIconSelectEvents();
        });
    },
    
    /**
     * 获取图标文件列表
     * @returns {Promise<string[]>} 图标文件名数组
     */
    fetchIconFiles: function() {
        return new Promise((resolve) => {
            // 动态从web-icon文件夹加载所有图标
            // 由于浏览器安全限制，无法直接读取文件系统
            // 这里我们检索从images/web-icon中的所有PNG文件
            const iconFiles = [
                'use-website-icon.png', // 添加特殊的"使用网站图标"选项
                'a-hua1.png', 'a-hua2.png', 'a-hua5.png', 'a-hua6.png', 'a-hua7.png',
                'a-hua12.png', 'a-hua13.png', 'a-hua15.png', 'a-hua17.png', 'a-hua18.png',
                'a-hua23.png', 'a-hua24.png', 'a-hua26.png', 'a-hua28.png', 'a-hua29.png',
                'a-hua31.png', 'a-hua32.png', 'a-hua33.png', 'a-hua36.png', 'a-hua40.png',
                'a-hua41.png', 'a-hua44.png'
            ];
            
            // 按字母顺序排序，但确保use-website-icon.png始终在第一位
            const websiteIconOption = 'use-website-icon.png';
            const filteredIconFiles = iconFiles.filter(icon => icon !== websiteIconOption);
            filteredIconFiles.sort();
            
            resolve([websiteIconOption, ...filteredIconFiles]);
        });
    },
    
    /**
     * 创建图标选项
     * @param {string} iconFile - 图标文件名
     */
    createIconOption: function(iconFile) {
        const option = document.createElement('div');
        option.className = 'icon-option';
        option.setAttribute('data-icon', iconFile);
        
        const img = document.createElement('img');
        
        // 特殊处理"使用网站图标"选项
        if (iconFile === 'use-website-icon.png') {
            img.src = 'images/icons/no-icon.png'; // 使用禁止图标
            img.alt = '使用网站图标';
            option.classList.add('use-website-icon');
            option.setAttribute('title', '使用网站原始图标');
        } else {
            img.src = `images/web-icon/${iconFile}`;
            img.alt = iconFile;
        }
        
        option.appendChild(img);
        this.iconSelector.appendChild(option);
    },
    
    /**
     * 绑定图标选择事件
     */
    bindIconSelectEvents: function() {
        this.iconOptions = document.querySelectorAll('.icon-option');
        
        this.iconOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.iconOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedIconInput.value = option.getAttribute('data-icon');
            });
        });
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
        
        // 保存规则
        this.saveButton.addEventListener('click', this.saveRule.bind(this));
        
        // 卡片样式下拉框变更事件
        this.cardStyleSelect.addEventListener('change', this.handleCardStyleChange.bind(this));
        
        // 卡片样式颜色预览点击事件
        this.cardStylePreviews.forEach(preview => {
            preview.addEventListener('click', this.handleCardStylePreviewClick.bind(this));
        });
    },
    
    /**
     * 处理卡片样式选择变更
     */
    handleCardStyleChange: function(e) {
        // 更新预览图标的选中状态
        const selectedValue = e.target.value;
        this.updateCardStylePreviewSelection(selectedValue);
    },
    
    /**
     * 处理卡片样式颜色预览点击
     */
    handleCardStylePreviewClick: function(e) {
        const clickedPreview = e.target;
        const styleValue = clickedPreview.getAttribute('data-value');
        
        // 更新下拉框选中值
        this.cardStyleSelect.value = styleValue;
        
        // 更新预览图标的选中状态
        this.updateCardStylePreviewSelection(styleValue);
    },
    
    /**
     * 更新卡片样式颜色预览的选择状态
     * @param {string} selectedValue - 选中的卡片样式值
     */
    updateCardStylePreviewSelection: function(selectedValue) {
        // 移除所有预览的选中状态
        this.cardStylePreviews.forEach(preview => {
            preview.classList.remove('selected');
        });
        
        // 为当前选择的颜色添加选中状态
        const selectedPreview = document.querySelector(`.color-preview[data-value="${selectedValue}"]`);
        if (selectedPreview) {
            selectedPreview.classList.add('selected');
        }
    },
    
    /**
     * 显示添加规则模态框
     * @param {string} groupName - 分组名称
     * @param {string} cardType - 卡片类型
     * @param {boolean} isEdit - 是否为编辑模式
     * @param {number} businessGroupIndex - 业务分组索引
     * @param {number} cardIndex - 卡片索引
     */
    showModal: function(groupName, cardType, isEdit = false, businessGroupIndex = -1, cardIndex = -1) {
        // 设置当前分组名称和卡片类型
        this.currentGroupName = groupName;
        this.currentCardType = cardType;
        this.isEditMode = isEdit;
        this.businessGroupIndex = businessGroupIndex;
        this.cardIndex = cardIndex;
        
        // 存储编辑的卡片数据（如果是编辑模式）
        if (isEdit && businessGroupIndex >= 0 && cardIndex >= 0) {
            this.editCardData = DataStore.cards[cardType][businessGroupIndex].items[cardIndex];
        } else {
            this.editCardData = null;
        }
        
        // 重新加载图标选项，确保显示最新图标文件
        this.loadIconOptions().then(() => {
            // 重置表单
            this.resetForm();
            
            // 设置模态框标题
            const modalTitle = this.modal.querySelector('.modal-title');
            
            if (this.isEditMode && this.editCardData) {
                // 编辑模式 - 加载现有卡片数据
                const cardData = this.editCardData;
                
                // 填充表单
                this.urlInput.value = cardData.url || '';
                this.titleInput.value = cardData.title || '';
                this.descriptionInput.value = cardData.description || '';
                this.cardStyleSelect.value = cardData.cardType || 'card1';
                
                // 更新卡片样式预览
                this.updateCardStylePreviewSelection(cardData.cardType || 'card1');
                
                // 选中当前图标（如果有）
                if (cardData.icon) {
                    this.selectedIconInput.value = cardData.icon;
                    
                    const iconOption = this.iconSelector.querySelector(`.icon-option[data-icon="${cardData.icon}"]`);
                    if (iconOption) {
                        this.iconOptions.forEach(opt => opt.classList.remove('selected'));
                        iconOption.classList.add('selected');
                    }
                } else {
                    // 如果没有图标，使用第一个图标作为默认值
                    const firstOption = this.iconSelector.querySelector('.icon-option');
                    if (firstOption) {
                        firstOption.classList.add('selected');
                        this.selectedIconInput.value = firstOption.getAttribute('data-icon');
                    }
                }
                
                modalTitle.textContent = `编辑规则`;
                this.saveButton.textContent = '更新';
            } else {
                // 添加模式
                modalTitle.textContent = `添加${this.getCardTypeName(cardType)}规则 - ${groupName}`;
                this.saveButton.textContent = '保存';
            }
            
            // 显示模态框
            this.modal.classList.add('active');
        });
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
        this.urlInput.value = '';
        this.titleInput.value = '';
        this.descriptionInput.value = '';
        this.cardStyleSelect.value = 'card1';
        
        // 初始化卡片样式预览选择
        this.updateCardStylePreviewSelection('card1');
        
        // 使用动态获取的第一个图标作为默认值
        const firstOption = this.iconSelector.querySelector('.icon-option');
        if (firstOption) {
            this.selectedIconInput.value = firstOption.getAttribute('data-icon');
        } else {
            this.selectedIconInput.value = '';
        }
        
        // 重置图标选择
        this.iconOptions.forEach(opt => opt.classList.remove('selected'));
        if (this.iconOptions.length > 0) {
            this.iconOptions[0].classList.add('selected');
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
     * 保存规则
     */
    saveRule: function() {
        // 获取表单数据
        const url = this.urlInput.value.trim();
        const title = this.titleInput.value.trim();
        const description = this.descriptionInput.value.trim();
        const icon = this.selectedIconInput.value;
        const cardType = this.cardStyleSelect.value;
        
        // 验证
        if (!url || !title) {
            alert('请填写网址和标题');
            return;
        }
        
        // 创建卡片数据对象
        const cardData = {
            url: url,
            title: title,
            description: description,
            icon: icon,
            cardType: cardType
        };
        
        // 判断是否使用自定义图标或网站图标
        if (icon === 'use-website-icon.png') {
            // 用户选择了"使用网站图标"选项
            if (this.websiteInfo && this.websiteInfo.iconUrl) {
                // 有从网站获取的图标
                cardData.iconUrl = this.websiteInfo.iconUrl;
            } else if (this.isEditMode && this.editCardData && this.editCardData.iconUrl) {
                // 保留原有图标
                cardData.iconUrl = this.editCardData.iconUrl;
            } else {
                // 如果没有图标，尝试使用Google的favicon服务
                try {
                    cardData.iconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}`;
                } catch (error) {
                    console.error('获取Google图标服务失败:', error);
                }
            }
        } else if (icon && icon !== '') {
            // 用户选择了自定义图标，优先使用自定义图标
            cardData.iconUrl = null; // 清除iconUrl，确保使用自定义图标
        } else if (this.websiteInfo && this.websiteInfo.iconUrl) {
            // 没有选择任何图标，但有从网站获取的图标
            cardData.iconUrl = this.websiteInfo.iconUrl;
        } else if (this.isEditMode && this.editCardData && this.editCardData.iconUrl) {
            // 保留原有图标
            cardData.iconUrl = this.editCardData.iconUrl;
        } else {
            // 如果没有图标，尝试使用Google的favicon服务
            try {
                cardData.iconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}`;
            } catch (error) {
                console.error('获取Google图标服务失败:', error);
                // 保持使用选择的本地图标
            }
        }
        
        if (this.isEditMode && this.businessGroupIndex >= 0 && this.cardIndex >= 0) {
            // 编辑模式 - 更新现有卡片
            DataStore.cards[this.currentCardType][this.businessGroupIndex].items[this.cardIndex] = cardData;
            alert('规则已成功更新！');
        } else {
            // 添加模式 - 添加新卡片
            // 查找现有分组
            const cardTypeData = DataStore.cards[this.currentCardType];
            const groupIndex = cardTypeData.findIndex(group => group.groupName === this.currentGroupName);
            
            if (groupIndex !== -1) {
                // 向现有分组添加卡片
                cardTypeData[groupIndex].items.push(cardData);
            } else {
                // 创建新分组并添加卡片
                cardTypeData.push({
                    groupName: this.currentGroupName,
                    items: [cardData]
                });
            }
            
            alert('规则已成功添加！');
        }
        
        // 保存到本地存储
        this.saveToLocalStorage();
        
        // 隐藏模态框
        this.hideModal();
        
        // 触发UI更新
        this.triggerUIUpdate();
    },
    
    /**
     * 保存到本地存储
     */
    saveToLocalStorage: function() {
        localStorage.setItem('ruleSystemData', JSON.stringify(DataStore));
    },
    
    /**
     * 从本地存储加载数据
     */
    loadFromLocalStorage: function() {
        const savedData = localStorage.getItem('ruleSystemData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // 更新导航数据
            if (parsedData.navigation) {
                DataStore.navigation = parsedData.navigation;
            }
            
            // 更新卡片数据
            if (parsedData.cards) {
                DataStore.cards = parsedData.cards;
            }
            
            return true;
        }
        return false;
    },
    
    /**
     * 触发UI更新
     */
    triggerUIUpdate: function() {
        // 创建并分发自定义事件
        const event = new CustomEvent('dataUpdated');
        document.dispatchEvent(event);
    },
    
    /**
     * 更新图标选择状态
     * @param {string} iconValue - 选中的图标值
     */
    updateIconSelection: function(iconValue) {
        if (iconValue && this.iconOptions) {
            this.iconOptions.forEach(opt => {
                opt.classList.remove('selected');
                if (opt.getAttribute('data-icon') === iconValue) {
                    opt.classList.add('selected');
                }
            });
        }
    }
};

export default ModalHandler; 