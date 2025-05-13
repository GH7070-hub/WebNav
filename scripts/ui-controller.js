/**
 * UI控制模块
 * 处理界面交互和状态管理
 */

// 导入数据存储和模态框处理器
import DataStore from './data-store.js';
import ModalHandler from './modal-handler.js';
import TooltipHandler from './tooltip-handler.js';
import GroupManager from './group-manager.js';
import NavManager from './nav-manager.js';

const UIController = {
    /**
     * 初始化UI控制器
     */
    init: function() {
        this.searchInput = document.querySelector('.search-box');
        this.searchButton = document.getElementById('search-button');
        this.sidebar = document.getElementById('nav-sidebar');
        this.contentArea = document.getElementById('content-area');
        this.editModeToggle = document.getElementById('edit-mode-toggle');
        this.clearCacheBtn = document.getElementById('clear-cache-btn');
        
        // 初始化模态框处理器
        ModalHandler.init();
        
        // 初始化分组管理器
        GroupManager.init();
        
        // 初始化导航管理器
        NavManager.init();
        
        // 尝试从本地存储加载数据
        this.loadDataFromLocalStorage();
        
        // 加载编辑模式状态
        this.loadEditModeState();
        
        // 渲染导航菜单
        this.renderNavigation();
        
        // 渲染卡片内容
        this.renderCardGroups();
        
        // 绑定事件处理函数
        this.bindEvents();
        
        // 添加页面载入动画效果
        setTimeout(() => {
            document.body.classList.add('page-loaded');
        }, 100);
        
        // 初始化卡片组显示
        this.initCardGroups();
        
        // 初始化拖拽排序功能
        this.initDragAndDrop();
        
        // 初始化导航拖拽功能
        this.initNavDrag();
    },
    
    /**
     * 从本地存储加载数据
     */
    loadDataFromLocalStorage: function() {
        ModalHandler.loadFromLocalStorage();
    },
    
    /**
     * 渲染导航菜单
     */
    renderNavigation: function() {
        // 清空导航区域
        this.sidebar.innerHTML = '';
        
        // 创建导航管理按钮
        const navManagementButton = document.createElement('button');
        navManagementButton.className = 'nav-management-btn';
        navManagementButton.textContent = '管理菜单';
        navManagementButton.addEventListener('click', this.handleNavManagementClick.bind(this));
        
        // 添加导航管理按钮到侧边栏
        this.sidebar.appendChild(navManagementButton);
        
        // 从数据存储中获取导航数据并渲染
        DataStore.navigation.forEach((navItem, index) => {
            const navElement = document.createElement('div');
            navElement.className = 'nav-item';
            if (navItem.isActive) {
                navElement.classList.add('active');
            }
            navElement.setAttribute('data-type', navItem.id);
            navElement.setAttribute('data-index', index);
            navElement.textContent = navItem.name;
            
            // 为所有导航项添加点击事件，无论是否在编辑模式
            navElement.addEventListener('click', this.handleNavItemClick.bind(this));
            
            // 添加拖拽相关属性和事件 - 只在编辑模式下可拖动
            if (document.body.classList.contains('edit-mode')) {
                navElement.setAttribute('draggable', 'true');
                navElement.addEventListener('dragstart', this.handleNavDragStart.bind(this));
                navElement.addEventListener('dragend', this.handleNavDragEnd.bind(this));
                navElement.addEventListener('dragover', this.handleNavDragOver.bind(this));
                navElement.addEventListener('dragenter', this.handleNavDragEnter.bind(this));
                navElement.addEventListener('dragleave', this.handleNavDragLeave.bind(this));
                navElement.addEventListener('drop', this.handleNavDrop.bind(this));
            }
            
            this.sidebar.appendChild(navElement);
        });
        
        // 更新导航项引用
        this.navItems = document.querySelectorAll('.nav-item');
    },
    
    /**
     * 渲染卡片组
     */
    renderCardGroups: function() {
        // 清空内容区域
        this.contentArea.innerHTML = '';
        
        // 跟踪全局业务分组索引，用于分配颜色
        let globalGroupIndex = 0;
        
        // 遍历数据存储中的所有卡片组
        Object.keys(DataStore.cards).forEach(cardType => {
            const cardGroupData = DataStore.cards[cardType];
            
            // 创建卡片组容器
            const cardGroup = document.createElement('div');
            cardGroup.className = 'card-group';
            cardGroup.setAttribute('data-type', cardType);
            
            // 默认隐藏非活动卡片组
            const isActive = DataStore.navigation.find(nav => nav.id === cardType)?.isActive || false;
            if (!isActive) {
                cardGroup.style.display = 'none';
            }
            
            // 添加分组管理按钮
            const groupManagementContainer = document.createElement('div');
            groupManagementContainer.className = 'group-management-container';
            
            const addGroupButton = document.createElement('button');
            addGroupButton.className = 'btn btn-primary add-group-btn';
            addGroupButton.textContent = '管理分组';
            addGroupButton.setAttribute('data-type', cardType);
            addGroupButton.addEventListener('click', this.handleGroupManagementClick.bind(this));
            
            groupManagementContainer.appendChild(addGroupButton);
            cardGroup.appendChild(groupManagementContainer);
            
            // 渲染业务分组
            cardGroupData.forEach((businessGroup, businessGroupIndex) => {
                const businessGroupElement = document.createElement('div');
                businessGroupElement.className = 'business-group';
                businessGroupElement.setAttribute('data-group-index', businessGroupIndex);
                businessGroupElement.setAttribute('data-card-type', cardType);
                
                // 创建分组标题容器，包含标题和编辑按钮
                const titleContainer = document.createElement('div');
                titleContainer.className = 'business-group-title-container';
                
                // 添加业务分组标题
                const titleElement = document.createElement('h3');
                titleElement.className = 'business-group-title';
                
                // 使用存储在分组数据中的颜色索引或默认使用全局分组索引
                let colorIndex;
                if (businessGroup.colorIndex) {
                    // 使用分组中存储的颜色索引
                    colorIndex = businessGroup.colorIndex;
                } else {
                    // 使用全局分组索引作为默认值（循环使用6种颜色）
                    colorIndex = (globalGroupIndex % 6) + 1;
                    // 增加全局分组索引
                    globalGroupIndex++;
                }
                
                // 添加颜色类
                titleElement.classList.add(`group-color-${colorIndex}`);
                
                titleElement.textContent = businessGroup.groupName;
                // 添加data-text属性，用于毛玻璃效果
                titleElement.setAttribute('data-text', businessGroup.groupName);
                titleContainer.appendChild(titleElement);
                
                // 添加分组编辑按钮
                const editButton = document.createElement('button');
                editButton.className = 'btn btn-sm btn-edit-group';
                editButton.innerHTML = '&#9998;'; // 铅笔图标
                editButton.title = '编辑分组';
                editButton.setAttribute('data-type', cardType);
                editButton.setAttribute('data-group', businessGroup.groupName);
                editButton.addEventListener('click', this.handleEditGroupClick.bind(this));
                titleContainer.appendChild(editButton);
                
                // 添加分组删除按钮
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-sm btn-delete-group';
                deleteButton.innerHTML = '&times;'; // 乘号图标
                deleteButton.title = '删除分组';
                deleteButton.setAttribute('data-type', cardType);
                deleteButton.setAttribute('data-group', businessGroup.groupName);
                deleteButton.addEventListener('click', this.handleDeleteGroupClick.bind(this));
                titleContainer.appendChild(deleteButton);
                
                businessGroupElement.appendChild(titleContainer);
                
                // 创建卡片容器
                const cardContainer = document.createElement('div');
                cardContainer.className = 'card-container';
                cardContainer.setAttribute('data-group-index', businessGroupIndex);
                cardContainer.setAttribute('data-card-type', cardType);
                
                // 渲染卡片
                businessGroup.items.forEach((cardItem, cardIndex) => {
                    // 创建卡片链接容器（不使用a标签直接包装，而是使用div）
                    const cardLink = document.createElement('div');
                    cardLink.className = 'card-link';
                    cardLink.setAttribute('draggable', 'true');
                    cardLink.setAttribute('data-card-index', cardIndex);
                    cardLink.setAttribute('data-group-index', businessGroupIndex);
                    cardLink.setAttribute('data-card-type', cardType);
                    
                    // 创建卡片
                    const card = document.createElement('div');
                    card.className = `card ${cardItem.cardType}`;
                    
                    // 添加流光效果元素
                    const shimmerEffect = document.createElement('div');
                    shimmerEffect.className = 'shimmer-effect';
                    card.appendChild(shimmerEffect);
                    
                    // 添加卡片点击事件（除了删除按钮区域外）
                    card.addEventListener('click', (e) => {
                        // 如果点击的不是删除按钮，则跳转到URL
                        if (!e.target.closest('.card-delete') && !e.target.closest('.card-edit')) {
                            window.open(cardItem.url, '_blank');
                        }
                    });
                    
                    // 设置卡片样式为可点击
                    card.style.cursor = 'pointer';
                    
                    // 创建删除按钮
                    const deleteButton = document.createElement('div');
                    deleteButton.className = 'card-delete';
                    deleteButton.innerHTML = '&times;';
                    deleteButton.title = '删除规则';
                    
                    // 设置删除按钮的数据属性，用于标识要删除的卡片
                    deleteButton.setAttribute('data-card-type', cardType);
                    deleteButton.setAttribute('data-business-group-index', businessGroupIndex);
                    deleteButton.setAttribute('data-card-index', cardIndex);
                    
                    // 添加删除按钮点击事件，阻止事件冒泡
                    deleteButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.handleDeleteCard(e);
                    });
                    
                    // 创建编辑按钮
                    const editButton = document.createElement('div');
                    editButton.className = 'card-edit';
                    editButton.innerHTML = '&#9998;'; // 铅笔图标
                    editButton.title = '编辑规则';
                    
                    // 设置编辑按钮的数据属性，用于标识要编辑的卡片
                    editButton.setAttribute('data-card-type', cardType);
                    editButton.setAttribute('data-business-group-index', businessGroupIndex);
                    editButton.setAttribute('data-card-index', cardIndex);
                    
                    // 添加编辑按钮点击事件，阻止事件冒泡
                    editButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.handleEditCard(e);
                    });
                    
                    // 创建卡片图标
                    const cardLogo = document.createElement('div');
                    cardLogo.className = 'card-logo';
                    
                    // 检查是否有图标URL，如果有则创建img元素
                    if (cardItem.iconUrl) {
                        const iconImg = document.createElement('img');
                        iconImg.src = cardItem.iconUrl;
                        iconImg.alt = cardItem.title;
                        cardLogo.appendChild(iconImg);
                    } else if (cardItem.icon && cardItem.icon.endsWith('.png')) {
                        // 如果是图片图标（以.png结尾）
                        const iconImg = document.createElement('img');
                        iconImg.src = `images/web-icon/${cardItem.icon}`;
                        iconImg.alt = cardItem.title;
                        cardLogo.appendChild(iconImg);
                    } else {
                        // 如果都没有，使用默认图标
                        const iconImg = document.createElement('img');
                        iconImg.src = 'images/web-icon/a-hua1.png'; 
                        iconImg.alt = cardItem.title;
                        cardLogo.appendChild(iconImg);
                    }
                    
                    // 创建卡片内容容器
                    const cardContent = document.createElement('div');
                    cardContent.className = 'card-content';
                    
                    // 创建卡片标题
                    const cardTitle = document.createElement('div');
                    cardTitle.className = 'card-title';
                    cardTitle.textContent = cardItem.title;
                    cardContent.appendChild(cardTitle);
                    
                    // 创建卡片描述（如果有）
                    let cardDescription;
                    if (cardItem.description) {
                        cardDescription = document.createElement('div');
                        cardDescription.className = 'card-description';
                        cardDescription.textContent = cardItem.description;
                        cardContent.appendChild(cardDescription);
                    }
                    
                    // 将各个元素添加到卡片
                    card.appendChild(cardLogo);
                    card.appendChild(cardContent);
                    card.appendChild(deleteButton);
                    card.appendChild(editButton);
                    
                    // 组装卡片
                    cardLink.appendChild(card);
                    
                    // 创建全局气泡提示
                    const createTooltip = (title, description) => {
                        // 首先检查是否已存在全局tooltip
                        let tooltip = document.getElementById('global-card-tooltip');
                        if (!tooltip) {
                            tooltip = document.createElement('div');
                            tooltip.id = 'global-card-tooltip';
                            tooltip.className = 'card-tooltip';
                            document.body.appendChild(tooltip);
                        }
                        
                        // 清空现有内容
                        tooltip.innerHTML = '';
                        
                        // 添加标题
                        const tooltipTitle = document.createElement('strong');
                        tooltipTitle.textContent = title;
                        tooltip.appendChild(tooltipTitle);
                        
                        // 添加描述
                        if (description) {
                            const tooltipDescription = document.createElement('span');
                            tooltipDescription.textContent = description;
                            tooltip.appendChild(tooltipDescription);
                        }
                        
                        return tooltip;
                    };
                    
                    // 添加鼠标悬停事件
                    cardLink.addEventListener('mouseenter', (e) => {
                        const tooltip = createTooltip(cardItem.title, cardItem.description);
                        
                        // 计算位置
                        const rect = cardLink.getBoundingClientRect();
                        const tooltipLeft = rect.left + (rect.width / 2);
                        const tooltipTop = rect.bottom + window.scrollY + 10;
                        
                        // 设置位置
                        tooltip.style.left = tooltipLeft + 'px';
                        tooltip.style.top = tooltipTop + 'px';
                        tooltip.style.opacity = '1';
                        tooltip.style.visibility = 'visible';
                    });
                    
                    cardLink.addEventListener('mouseleave', () => {
                        const tooltip = document.getElementById('global-card-tooltip');
                        if (tooltip) {
                            tooltip.style.opacity = '0';
                            tooltip.style.visibility = 'hidden';
                        }
                    });
                    
                    cardContainer.appendChild(cardLink);
                });
                
                // 创建添加卡片按钮
                const addCardButton = document.createElement('div');
                addCardButton.className = 'add-card-button';
                addCardButton.setAttribute('data-group', businessGroup.groupName);
                addCardButton.setAttribute('data-type', cardType);
                
                // 添加按钮内容
                const plusIcon = document.createElement('span');
                plusIcon.className = 'plus-icon';
                plusIcon.textContent = '+';
                addCardButton.appendChild(plusIcon);
                
                const buttonText = document.createElement('span');
                buttonText.className = 'button-text';
                buttonText.textContent = '添加网址';
                addCardButton.appendChild(buttonText);
                
                // 添加点击事件
                addCardButton.addEventListener('click', this.handleAddCardClick.bind(this));
                
                // 将添加按钮添加到卡片容器
                cardContainer.appendChild(addCardButton);
                
                // 将卡片容器添加到业务分组
                businessGroupElement.appendChild(cardContainer);
                
                // 将业务分组添加到卡片组
                cardGroup.appendChild(businessGroupElement);
            });
            
            // 将卡片组添加到内容区域
            this.contentArea.appendChild(cardGroup);
        });
        
        // 更新卡片组引用
        this.cardGroups = document.querySelectorAll('.card-group');
    },
    
    /**
     * 创建工具提示内容
     * @param {string} title - 卡片标题
     * @param {string} description - 卡片描述
     * @returns {string} 格式化的工具提示HTML内容
     */
    createTooltipContent: function(title, description) {
        let content = `<strong>${title}</strong>`;
        if (description) {
            content += `<span>${description}</span>`;
        }
        return content;
    },
    
    /**
     * 绑定事件处理函数
     */
    bindEvents: function() {
        // 搜索按钮点击事件
        this.searchButton.addEventListener('click', this.performSearch.bind(this));
        
        // 搜索框回车事件
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // 编辑模式切换事件
        this.editModeToggle.addEventListener('change', this.toggleEditMode.bind(this));
        
        // 清除缓存按钮事件
        this.clearCacheBtn.addEventListener('click', this.handleClearCache.bind(this));
        
        // 监听数据更新事件
        document.addEventListener('dataUpdated', this.handleDataUpdated.bind(this));
    },
    
    /**
     * 初始化卡片组显示
     */
    initCardGroups: function() {
        // 所有卡片组都显示
        this.cardGroups.forEach(group => {
            group.style.display = 'flex';
            // 延迟添加active类，确保CSS过渡动画正常工作
            setTimeout(() => {
                requestAnimationFrame(() => {
                    group.classList.add('active');
                });
            }, 300);
        });
    },
    
    /**
     * 处理导航项点击事件
     * @param {Event} event - 点击事件对象
     */
    handleNavItemClick: function(event) {
        const clickedItem = event.currentTarget;
        
        if (clickedItem.classList.contains('active')) {
            return; // 如果已经是激活状态，不重复处理
        }
        
        // 移除所有导航项的激活状态
        this.navItems.forEach(nav => nav.classList.remove('active'));
        
        // 设置当前点击项为激活状态
        clickedItem.classList.add('active');
        
        // 获取目标卡片组数据
        const newType = clickedItem.getAttribute('data-type');
        
        // 重置搜索
        this.resetSearch();
        
        // 滚动到相应的卡片组的第一个业务分组，考虑头部导航栏的高度
        const targetGroup = document.querySelector(`.card-group[data-type="${newType}"]`);
        if (targetGroup) {
            // 获取内容区域容器
            const contentArea = document.querySelector('.content');
            
            // 获取目标元素在内容区域中的相对位置
            const targetRect = targetGroup.getBoundingClientRect();
            const contentRect = contentArea.getBoundingClientRect();
            const relativeTop = targetRect.top - contentRect.top + contentArea.scrollTop;
            
            // 额外减去20px的边距
            const scrollPosition = relativeTop - 20;
            
            // 平滑滚动内容区域到调整后的位置
            contentArea.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
            });
            
            // 高亮显示当前卡片组
            this.highlightCardGroup(targetGroup);
        }
    },
    
    /**
     * 高亮显示当前选中的卡片组
     * @param {HTMLElement} cardGroup - 要高亮的卡片组元素
     */
    highlightCardGroup: function(cardGroup) {
        // 移除所有卡片组的高亮
        document.querySelectorAll('.card-group').forEach(group => {
            group.style.borderTop = '1px solid rgba(246, 138, 78, 0.05)';
        });
        
        // 为当前卡片组添加高亮边框
        cardGroup.style.borderTop = '2px solid var(--primary-color)';
        // 延迟移除高亮，恢复正常状态
        setTimeout(() => {
            cardGroup.style.borderTop = '1px solid rgba(246, 138, 78, 0.05)';
        }, 2000);
    },
    
    /**
     * 显示当前激活的菜单对应的卡片组
     */
    showActiveCardGroup: function() {
        const activeType = document.querySelector('.nav-item.active').getAttribute('data-type');
        const targetGroup = document.querySelector(`.card-group[data-type="${activeType}"]`);
        
        // 如果有目标卡片组，滚动到该组并高亮显示
        if (targetGroup) {
            // 获取内容区域容器
            const contentArea = document.querySelector('.content');
            
            // 获取目标元素在内容区域中的相对位置
            const targetRect = targetGroup.getBoundingClientRect();
            const contentRect = contentArea.getBoundingClientRect();
            const relativeTop = targetRect.top - contentRect.top + contentArea.scrollTop;
            
            // 额外减去20px的边距
            const scrollPosition = relativeTop - 20;
            
            // 平滑滚动内容区域到调整后的位置
            contentArea.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
            });
            
            this.highlightCardGroup(targetGroup);
        }
    },
    
    /**
     * 重置搜索状态
     */
    resetSearch: function() {
        this.searchInput.value = '';
        
        // 移除搜索结果样式类
        this.cardGroups.forEach(group => {
            group.classList.remove('search-results');
            group.style.display = 'flex';
        });
        
        // 显示所有卡片和业务分组
        document.querySelectorAll('.card-link').forEach(card => {
            card.style.display = 'block';
        });
        
        document.querySelectorAll('.business-group').forEach(group => {
            group.style.display = 'flex';
        });
        
        // 恢复原始文本，移除搜索高亮
        document.querySelectorAll('.card-title, .card-description').forEach(el => {
            if (el.innerHTML.includes('search-highlight')) {
                el.textContent = el.textContent; // 这将移除所有HTML标签，恢复纯文本
            }
        });
    },
    
    /**
     * 执行搜索功能
     */
    performSearch: function() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            // 如果搜索词为空，恢复正常显示
            this.resetSearch();
            return;
        }
        
        // 显示所有卡片组
        this.cardGroups.forEach(group => {
            group.style.display = 'flex';
            group.classList.add('search-results');
        });
        
        // 隐藏所有卡片，后续只显示匹配的
        const allCards = document.querySelectorAll('.card-link');
        allCards.forEach(card => {
            card.style.display = 'none';
        });
        
        const allBusinessGroups = document.querySelectorAll('.business-group');
        allBusinessGroups.forEach(group => {
            group.style.display = 'none';
        });
        
        // 延迟执行搜索匹配，确保DOM已更新
        setTimeout(() => {
            let foundResults = false;
            
            // 显示匹配的卡片
            document.querySelectorAll('.card').forEach(card => {
                const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
                const cardDescription = card.querySelector('.card-description')?.textContent.toLowerCase() || '';
                const cardContainer = card.closest('.card-link');
                const businessGroup = card.closest('.business-group');
                const cardGroup = card.closest('.card-group');
                
                if (cardTitle.includes(searchTerm) || cardDescription.includes(searchTerm)) {
                    cardContainer.style.display = 'block';
                    businessGroup.style.display = 'flex';
                    cardGroup.style.display = 'flex';
                    foundResults = true;
                }
            });
            
            // 隐藏没有匹配结果的业务分组和卡片组
            this.cardGroups.forEach(group => {
                const visibleBusinessGroups = group.querySelectorAll('.business-group[style="display: flex;"]');
                if (visibleBusinessGroups.length === 0) {
                    group.style.display = 'none';
                }
            });
            
            if (!foundResults) {
                alert('未找到匹配的规则制度');
                this.resetSearch();
            } else {
                // 滚动到第一个匹配的卡片组
                const firstVisibleGroup = document.querySelector('.card-group[style="display: flex;"]');
                if (firstVisibleGroup) {
                    // 获取内容区域容器
                    const contentArea = document.querySelector('.content');
                    
                    // 获取目标元素在内容区域中的相对位置
                    const targetRect = firstVisibleGroup.getBoundingClientRect();
                    const contentRect = contentArea.getBoundingClientRect();
                    const relativeTop = targetRect.top - contentRect.top + contentArea.scrollTop;
                    
                    // 额外减去20px的边距
                    const scrollPosition = relativeTop - 20;
                    
                    // 平滑滚动内容区域到调整后的位置
                    contentArea.scrollTo({
                        top: scrollPosition,
                        behavior: 'smooth'
                    });
                    
                    // 为搜索结果添加高亮效果
                    document.querySelectorAll('.card-title').forEach(title => {
                        if (title.textContent.toLowerCase().includes(searchTerm)) {
                            const originalText = title.textContent;
                            const highlightedText = originalText.replace(
                                new RegExp(searchTerm, 'gi'),
                                match => `<span class="search-highlight">${match}</span>`
                            );
                            title.innerHTML = highlightedText;
                        }
                    });
                    
                    document.querySelectorAll('.card-description').forEach(desc => {
                        if (desc && desc.textContent.toLowerCase().includes(searchTerm)) {
                            const originalText = desc.textContent;
                            const highlightedText = originalText.replace(
                                new RegExp(searchTerm, 'gi'),
                                match => `<span class="search-highlight">${match}</span>`
                            );
                            desc.innerHTML = highlightedText;
                        }
                    });
                }
            }
        }, 100);
    },
    
    /**
     * 处理数据更新事件
     */
    handleDataUpdated: function() {
        // 重新渲染卡片内容
        this.renderCardGroups();
        
        // 重新渲染导航
        this.renderNavigation();
        
        // 重新初始化卡片组显示
        this.initCardGroups();
        
        // 重新初始化拖拽功能
        this.initDragAndDrop();
        
        // 重新初始化导航拖拽功能
        this.initNavDrag();
    },
    
    /**
     * 处理添加卡片按钮点击事件
     * @param {Event} event - 点击事件对象
     */
    handleAddCardClick: function(event) {
        const button = event.currentTarget;
        const groupName = button.getAttribute('data-group');
        const cardType = button.getAttribute('data-type');
        
        // 显示添加规则模态框
        ModalHandler.showModal(groupName, cardType);
    },
    
    /**
     * 处理删除卡片事件
     * @param {Event} event - 点击事件对象
     */
    handleDeleteCard: function(event) {
        const button = event.currentTarget;
        const cardType = button.getAttribute('data-card-type');
        const businessGroupIndex = parseInt(button.getAttribute('data-business-group-index'));
        const cardIndex = parseInt(button.getAttribute('data-card-index'));
        
        // 获取卡片标题，用于确认提示
        const cardTitle = DataStore.cards[cardType][businessGroupIndex].items[cardIndex].title;
        
        // 确认是否删除
        if (confirm(`确定要删除规则"${cardTitle}"吗？此操作不可恢复。`)) {
            // 从数据存储中删除卡片
            this.deleteCardFromDataStore(cardType, businessGroupIndex, cardIndex);
            
            // 保存到本地存储
            this.saveToLocalStorage();
            
            // 重新渲染UI
            this.renderCardGroups();
            
            // 重新初始化卡片组显示
            this.initCardGroups();
            
            // 显示成功消息
            alert('规则已成功删除！');
        }
    },
    
    /**
     * 从数据存储中删除卡片
     * @param {string} cardType - 卡片类型
     * @param {number} businessGroupIndex - 业务分组索引
     * @param {number} cardIndex - 卡片索引
     */
    deleteCardFromDataStore: function(cardType, businessGroupIndex, cardIndex) {
        // 删除指定卡片
        DataStore.cards[cardType][businessGroupIndex].items.splice(cardIndex, 1);
        
        // 如果分组中没有卡片了，删除整个分组
        if (DataStore.cards[cardType][businessGroupIndex].items.length === 0) {
            DataStore.cards[cardType].splice(businessGroupIndex, 1);
        }
    },
    
    /**
     * 保存到本地存储
     */
    saveToLocalStorage: function() {
        localStorage.setItem('ruleSystemData', JSON.stringify(DataStore));
    },
    
    /**
     * 处理分组管理按钮点击事件
     * @param {Event} event - 点击事件对象
     */
    handleGroupManagementClick: function(event) {
        const button = event.currentTarget;
        const cardType = button.getAttribute('data-type');
        
        // 显示分组管理模态框
        GroupManager.showModal(cardType);
    },
    
    /**
     * 处理编辑分组按钮点击事件
     * @param {Event} event - 点击事件对象
     */
    handleEditGroupClick: function(event) {
        event.stopPropagation(); // 阻止事件冒泡
        
        const button = event.currentTarget;
        const cardType = button.getAttribute('data-type');
        const groupName = button.getAttribute('data-group');
        
        // 显示分组管理模态框，并设置为编辑模式
        GroupManager.showModal(cardType);
        GroupManager.operationSelect.value = 'edit';
        GroupManager.groupSelection.value = groupName;
        GroupManager.handleOperationChange();
    },
    
    /**
     * 处理删除分组按钮点击事件
     * @param {Event} event - 点击事件对象
     */
    handleDeleteGroupClick: function(event) {
        event.stopPropagation(); // 阻止事件冒泡
        
        const button = event.currentTarget;
        const cardType = button.getAttribute('data-type');
        const groupName = button.getAttribute('data-group');
        
        // 显示分组管理模态框，并设置为删除模式
        GroupManager.showModal(cardType);
        GroupManager.operationSelect.value = 'delete';
        GroupManager.groupSelection.value = groupName;
        GroupManager.handleOperationChange();
    },
    
    /**
     * 处理导航管理按钮点击事件
     * @param {Event} event - 点击事件对象
     */
    handleNavManagementClick: function(event) {
        // 显示导航管理模态框
        NavManager.showModal();
    },
    
    /**
     * 加载编辑模式状态
     */
    loadEditModeState: function() {
        // 从本地存储中获取编辑模式状态
        const isEditMode = localStorage.getItem('editMode') === 'true';
        
        // 设置复选框状态
        this.editModeToggle.checked = isEditMode;
        
        // 应用编辑模式状态到body
        if (isEditMode) {
            document.body.classList.add('edit-mode');
        } else {
            document.body.classList.remove('edit-mode');
        }
    },
    
    /**
     * 初始化导航拖拽功能
     */
    initNavDrag: function() {
        // 如果在编辑模式下，为所有导航项添加拖拽属性和事件
        if (document.body.classList.contains('edit-mode')) {
            this.navItems.forEach(item => {
                item.setAttribute('draggable', 'true');
                item.addEventListener('dragstart', this.handleNavDragStart.bind(this));
                item.addEventListener('dragend', this.handleNavDragEnd.bind(this));
                item.addEventListener('dragover', this.handleNavDragOver.bind(this));
                item.addEventListener('dragenter', this.handleNavDragEnter.bind(this));
                item.addEventListener('dragleave', this.handleNavDragLeave.bind(this));
                item.addEventListener('drop', this.handleNavDrop.bind(this));
            });
        } else {
            // 不在编辑模式下，移除所有拖拽属性和事件
            this.navItems.forEach(item => {
                item.removeAttribute('draggable');
                item.removeEventListener('dragstart', this.handleNavDragStart);
                item.removeEventListener('dragend', this.handleNavDragEnd);
                item.removeEventListener('dragover', this.handleNavDragOver);
                item.removeEventListener('dragenter', this.handleNavDragEnter);
                item.removeEventListener('dragleave', this.handleNavDragLeave);
                item.removeEventListener('drop', this.handleNavDrop);
            });
        }
    },

    /**
     * 切换编辑模式
     */
    toggleEditMode: function() {
        const isEditMode = this.editModeToggle.checked;
        
        // 保存编辑模式状态到本地存储
        localStorage.setItem('editMode', isEditMode);
        
        // 应用编辑模式状态到body
        if (isEditMode) {
            document.body.classList.add('edit-mode');
        } else {
            document.body.classList.remove('edit-mode');
        }
        
        // 重新渲染导航以应用编辑模式状态
        this.renderNavigation();
        
        // 初始化导航拖拽功能
        this.initNavDrag();
        
        // 初始化卡片拖拽功能
        this.initDragAndDrop();
    },
    
    /**
     * 处理编辑卡片按钮点击事件
     * @param {Event} event - 点击事件对象
     */
    handleEditCard: function(event) {
        event.stopPropagation(); // 阻止事件冒泡
        
        const button = event.currentTarget;
        const cardType = button.getAttribute('data-card-type');
        const businessGroupIndex = parseInt(button.getAttribute('data-business-group-index'));
        const cardIndex = parseInt(button.getAttribute('data-card-index'));
        
        // 获取所属分组名称
        const groupName = DataStore.cards[cardType][businessGroupIndex].groupName;
        
        // 显示模态框，并设置为编辑模式
        ModalHandler.showModal(groupName, cardType, true, businessGroupIndex, cardIndex);
    },
    
    /**
     * 初始化拖拽排序功能
     */
    initDragAndDrop: function() {
        // 获取所有卡片链接元素
        const cardLinks = document.querySelectorAll('.card-link');
        const cardContainers = document.querySelectorAll('.card-container');
        
        // 为每个卡片添加拖拽事件
        cardLinks.forEach(card => {
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
        
        // 为每个卡片容器添加放置事件
        cardContainers.forEach(container => {
            container.addEventListener('dragover', this.handleDragOver.bind(this));
            container.addEventListener('dragenter', this.handleDragEnter.bind(this));
            container.addEventListener('dragleave', this.handleDragLeave.bind(this));
            container.addEventListener('drop', this.handleDrop.bind(this));
        });
    },
    
    /**
     * 处理拖拽开始事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleDragStart: function(e) {
        // 检查是否在编辑模式
        if (!document.body.classList.contains('edit-mode')) {
            e.preventDefault();
            return;
        }
        
        // 设置拖拽效果
        e.dataTransfer.effectAllowed = 'move';
        
        // 存储被拖拽卡片的数据
        const cardElement = e.target;
        e.dataTransfer.setData('text/plain', JSON.stringify({
            cardType: cardElement.getAttribute('data-card-type'),
            groupIndex: parseInt(cardElement.getAttribute('data-group-index')),
            cardIndex: parseInt(cardElement.getAttribute('data-card-index'))
        }));
        
        // 添加拖拽样式
        cardElement.classList.add('dragging');
        
        // 使其他卡片半透明
        document.querySelectorAll('.card-link').forEach(card => {
            if (card !== cardElement) {
                card.style.opacity = '0.6';
            }
        });
    },
    
    /**
     * 处理拖拽结束事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleDragEnd: function(e) {
        // 移除拖拽样式
        e.target.classList.remove('dragging');
        
        // 恢复其他卡片的不透明度
        document.querySelectorAll('.card-link').forEach(card => {
            card.style.opacity = '';
        });
        
        // 移除所有容器的拖拽提示样式
        document.querySelectorAll('.card-container').forEach(container => {
            container.classList.remove('drag-over');
        });
    },
    
    /**
     * 处理拖拽经过事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleDragOver: function(e) {
        // 检查是否在编辑模式
        if (!document.body.classList.contains('edit-mode')) {
            return;
        }
        
        // 允许放置
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },
    
    /**
     * 处理拖拽进入事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleDragEnter: function(e) {
        // 检查是否在编辑模式
        if (!document.body.classList.contains('edit-mode')) {
            return;
        }
        
        // 添加放置区域高亮样式
        e.currentTarget.classList.add('drag-over');
    },
    
    /**
     * 处理拖拽离开事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleDragLeave: function(e) {
        // 移除放置区域高亮样式
        e.currentTarget.classList.remove('drag-over');
    },
    
    /**
     * 处理放置事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleDrop: function(e) {
        // 检查是否在编辑模式
        if (!document.body.classList.contains('edit-mode')) {
            return;
        }
        
        e.preventDefault();
        
        // 获取目标容器
        const targetContainer = e.currentTarget;
        targetContainer.classList.remove('drag-over');
        
        // 获取被拖拽的卡片数据
        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const sourceCardType = dragData.cardType;
        const sourceGroupIndex = dragData.groupIndex;
        const sourceCardIndex = dragData.cardIndex;
        
        // 获取目标容器数据
        const targetCardType = targetContainer.getAttribute('data-card-type');
        const targetGroupIndex = parseInt(targetContainer.getAttribute('data-group-index'));
        
        // 获取鼠标位置来确定插入位置
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // 确定目标索引（计算最近的卡片）
        let targetCardIndex = this.getTargetIndex(targetContainer, mouseX, mouseY);
        
        // 如果是相同容器，并且目标索引大于源索引，需要减1
        // 因为移除源卡片后，目标索引会减少1
        if (sourceCardType === targetCardType && 
            sourceGroupIndex === targetGroupIndex && 
            targetCardIndex > sourceCardIndex) {
            targetCardIndex--;
        }
        
        // 移动卡片数据
        this.moveCard(sourceCardType, sourceGroupIndex, sourceCardIndex, 
                      targetCardType, targetGroupIndex, targetCardIndex);
        
        // 保存到本地存储
        this.saveToLocalStorage();
        
        // 重新渲染UI
        this.renderCardGroups();
        
        // 初始化卡片组显示
        this.initCardGroups();
        
        // 重新初始化拖拽功能
        this.initDragAndDrop();
    },
    
    /**
     * 获取目标插入索引
     * @param {HTMLElement} container - 目标容器
     * @param {number} mouseX - 鼠标X坐标
     * @param {number} mouseY - 鼠标Y坐标
     * @returns {number} 目标索引
     */
    getTargetIndex: function(container, mouseX, mouseY) {
        const cards = Array.from(container.querySelectorAll('.card-link'));
        
        // 如果容器内没有卡片，插入到第一个位置
        if (cards.length === 0) {
            return 0;
        }
        
        // 计算每个卡片的位置，找到最近的一个
        let closestIndex = 0;
        let closestDistance = Number.MAX_VALUE;
        
        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;
            
            // 计算鼠标位置与卡片中心的距离
            const distance = Math.sqrt(
                Math.pow(mouseX - cardCenterX, 2) + 
                Math.pow(mouseY - cardCenterY, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
                
                // 如果鼠标在卡片的右侧，则插入到卡片之后
                if (mouseX > cardCenterX) {
                    closestIndex = index + 1;
                }
            }
        });
        
        return closestIndex;
    },
    
    /**
     * 移动卡片
     * @param {string} sourceCardType - 源卡片类型
     * @param {number} sourceGroupIndex - 源分组索引
     * @param {number} sourceCardIndex - 源卡片索引
     * @param {string} targetCardType - 目标卡片类型
     * @param {number} targetGroupIndex - 目标分组索引
     * @param {number} targetCardIndex - 目标卡片索引
     */
    moveCard: function(sourceCardType, sourceGroupIndex, sourceCardIndex, 
                      targetCardType, targetGroupIndex, targetCardIndex) {
        // 获取源卡片数据
        const sourceCard = DataStore.cards[sourceCardType][sourceGroupIndex].items[sourceCardIndex];
        
        // 从源位置移除卡片
        DataStore.cards[sourceCardType][sourceGroupIndex].items.splice(sourceCardIndex, 1);
        
        // 如果源分组现在为空，可以选择是否删除该分组
        if (DataStore.cards[sourceCardType][sourceGroupIndex].items.length === 0) {
            // 这里选择保留空分组，也可以选择删除
            // DataStore.cards[sourceCardType].splice(sourceGroupIndex, 1);
        }
        
        // 将卡片插入到目标位置
        DataStore.cards[targetCardType][targetGroupIndex].items.splice(targetCardIndex, 0, sourceCard);
    },
    
    /**
     * 处理导航项拖拽开始事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleNavDragStart: function(e) {
        // 检查是否在编辑模式
        if (!document.body.classList.contains('edit-mode')) {
            e.preventDefault();
            return;
        }
        
        // 设置拖拽效果
        e.dataTransfer.effectAllowed = 'move';
        
        // 存储被拖拽导航项的数据
        const navItem = e.target;
        e.dataTransfer.setData('text/plain', JSON.stringify({
            type: navItem.getAttribute('data-type'),
            index: parseInt(navItem.getAttribute('data-index'))
        }));
        
        // 添加拖拽样式
        navItem.classList.add('dragging');
        
        // 使其他导航项半透明
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item !== navItem) {
                item.style.opacity = '0.6';
            }
        });
    },
    
    /**
     * 处理导航项拖拽结束事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleNavDragEnd: function(e) {
        // 移除拖拽样式
        e.target.classList.remove('dragging');
        
        // 恢复其他导航项的不透明度
        document.querySelectorAll('.nav-item').forEach(item => {
            item.style.opacity = '';
        });
        
        // 移除所有容器的拖拽提示样式
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    },
    
    /**
     * 处理导航项拖拽经过事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleNavDragOver: function(e) {
        // 检查是否在编辑模式
        if (!document.body.classList.contains('edit-mode')) {
            return;
        }
        
        // 允许放置
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },
    
    /**
     * 处理导航项拖拽进入事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleNavDragEnter: function(e) {
        // 检查是否在编辑模式
        if (!document.body.classList.contains('edit-mode')) {
            return;
        }
        
        // 添加放置区域高亮样式
        e.currentTarget.classList.add('drag-over');
    },
    
    /**
     * 处理导航项拖拽离开事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleNavDragLeave: function(e) {
        // 移除放置区域高亮样式
        e.currentTarget.classList.remove('drag-over');
    },
    
    /**
     * 处理导航项放置事件
     * @param {DragEvent} e - 拖拽事件对象
     */
    handleNavDrop: function(e) {
        // 检查是否在编辑模式
        if (!document.body.classList.contains('edit-mode')) {
            return;
        }
        
        e.preventDefault();
        
        // 获取目标容器
        const targetContainer = e.currentTarget;
        targetContainer.classList.remove('drag-over');
        
        // 获取被拖拽的导航项数据
        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const sourceType = dragData.type;
        const sourceIndex = parseInt(dragData.index);
        
        // 获取目标容器数据
        const targetType = targetContainer.getAttribute('data-type');
        const targetIndex = parseInt(targetContainer.getAttribute('data-index'));
        
        // 移动导航项数据
        this.moveNavItem(sourceType, sourceIndex, targetType, targetIndex);
        
        // 保存到本地存储
        this.saveToLocalStorage();
        
        // 重新初始化拖拽功能
        this.initDragAndDrop();
        
        // 触发数据更新事件
        this.handleDataUpdated();
    },
    
    /**
     * 移动导航项
     * @param {string} sourceType - 源导航类型
     * @param {number} sourceIndex - 源导航索引
     * @param {string} targetType - 目标导航类型
     * @param {number} targetIndex - 目标导航索引
     */
    moveNavItem: function(sourceType, sourceIndex, targetType, targetIndex) {
        // 获取源导航项数据
        const sourceItem = DataStore.navigation[sourceIndex];
        
        // 验证数据匹配性
        if (sourceItem.id !== sourceType) {
            console.error('导航项数据不匹配，无法移动');
            return;
        }
        
        // 从源位置移除导航项
        DataStore.navigation.splice(sourceIndex, 1);
        
        // 如果目标索引大于源索引，目标索引需要减1
        // 因为移除了源项后，数组长度减1，目标索引可能变化
        if (targetIndex > sourceIndex) {
            targetIndex--;
        }
        
        // 将导航项插入到目标位置
        DataStore.navigation.splice(targetIndex, 0, sourceItem);
        
        // 重新排列内容区域卡片组，与导航顺序保持一致
        this.reorderCardGroups();
        
        // 更新所有导航项的数据索引属性
        this.renderNavigation();
        
        // 重新渲染卡片组，以反映新的排序
        this.renderCardGroups();
        
        // 初始化卡片组显示
        this.initCardGroups();
    },
    
    /**
     * 重新排列卡片组，与导航顺序保持一致
     */
    reorderCardGroups: function() {
        // 不再直接操作DOM，而是重新组织DataStore数据
        // 我们将按照导航顺序重组cards对象
        
        // 创建一个新的有序cards对象
        const orderedCards = {};
        
        // 按照导航顺序重新组织卡片数据
        DataStore.navigation.forEach(navItem => {
            const cardType = navItem.id;
            
            // 如果存在该类型的卡片数据，则保留
            if (DataStore.cards[cardType]) {
                orderedCards[cardType] = DataStore.cards[cardType];
            }
        });
        
        // 用有序的cards对象替换原有的cards对象
        DataStore.cards = orderedCards;
    },
    
    /**
     * 处理清除缓存按钮点击事件
     */
    handleClearCache: function() {
        // 显示确认对话框
        if (confirm('确定要清除所有本地缓存数据吗？这将清除浏览器中存储的所有网站数据，但不会影响已导出的备份文件。')) {
            try {
                // 清除所有localStorage数据
                localStorage.clear();
                
                // 清除所有sessionStorage数据
                sessionStorage.clear();
                
                // 尝试清除IndexedDB数据
                const databases = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]);
                databases.then(dbs => {
                    dbs.forEach(db => {
                        indexedDB.deleteDatabase(db.name);
                    });
                }).catch(err => {
                    console.error('清除IndexedDB失败:', err);
                });
                
                // 清除所有cookies
                document.cookie.split(';').forEach(cookie => {
                    const eqPos = cookie.indexOf('=');
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
                });
                
                // 显示成功消息
                alert('缓存数据已成功清除，页面将刷新以应用更改。');
                
                // 刷新页面以应用更改
                window.location.reload();
            } catch (error) {
                // 显示错误消息
                console.error('清除缓存失败:', error);
                alert('清除缓存时发生错误: ' + error.message);
            }
        }
    }
};

// 导出UI控制器
export default UIController; 