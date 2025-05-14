/**
 * Chrome收藏夹导入模块
 * 处理从Chrome导出的书签HTML文件导入
 */

import DataStore from './data-store.js';
import TooltipHandler from './tooltip-handler.js';

const ChromeImport = {
    /**
     * 初始化Chrome收藏夹导入功能
     */
    init: function() {
        // 获取DOM元素
        this.modal = document.getElementById('chrome-import-modal');
        this.fileInput = document.getElementById('bookmarks-file');
        this.useFoldersAsGroups = document.getElementById('use-folders-as-groups');
        this.previewContainer = document.getElementById('import-preview');
        this.previewContent = document.getElementById('preview-content');
        this.previewCount = document.getElementById('preview-count');
        this.importButton = document.getElementById('start-import-btn');
        this.closeButtons = this.modal.querySelectorAll('.modal-close, .modal-close-btn');
        
        // 绑定事件处理函数
        this.bindEvents();
    },
    
    /**
     * 绑定事件处理函数
     */
    bindEvents: function() {
        // 打开模态框按钮
        const chromeImportBtn = document.querySelector('.chrome-import-btn');
        if (chromeImportBtn) {
            chromeImportBtn.addEventListener('click', this.showModal.bind(this));
        }
        
        // 关闭模态框按钮
        this.closeButtons.forEach(button => {
            button.addEventListener('click', this.hideModal.bind(this));
        });
        
        // 点击模态框外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
        
        // 文件选择变更事件
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // 导入选项变更事件
        this.useFoldersAsGroups.addEventListener('change', () => {
            if (this.bookmarksData) {
                this.renderPreview(this.bookmarksData);
            }
        });
        
        // 开始导入按钮点击事件
        this.importButton.addEventListener('click', this.importBookmarks.bind(this));
    },
    
    /**
     * 显示模态框
     */
    showModal: function() {
        // 检查是否在编辑模式
        if (!document.body.classList.contains('edit-mode')) {
            TooltipHandler.showTooltip('请先启用编辑模式', 'error');
            return;
        }
        
        // 初始化状态
        this.resetModal();
        
        // 检查当前是否有选中的导航项
        const activeNavItem = document.querySelector('.nav-item.active');
        if (!activeNavItem) {
            TooltipHandler.showTooltip('请先选择一个导航菜单项', 'error');
            return;
        }
        
        // 存储当前的导航类型，用于后续导入
        this.currentNavType = activeNavItem.getAttribute('data-type');
        
        // 显示模态框
        this.modal.classList.add('active');
    },
    
    /**
     * 隐藏模态框
     */
    hideModal: function() {
        this.modal.classList.remove('active');
        this.resetModal();
    },
    
    /**
     * 重置模态框状态
     */
    resetModal: function() {
        this.fileInput.value = '';
        this.previewContainer.classList.remove('active');
        this.previewContent.innerHTML = '';
        this.previewCount.textContent = '0 个书签将被导入';
        this.importButton.disabled = true;
        this.bookmarksData = null;
    },
    
    /**
     * 处理文件选择事件
     * @param {Event} event - 文件选择事件对象
     */
    handleFileSelect: function(event) {
        const file = event.target.files[0];
        
        if (!file) {
            this.resetPreview();
            return;
        }
        
        // 检查文件类型
        if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
            TooltipHandler.showTooltip('请选择有效的HTML文件', 'error');
            this.resetPreview();
            return;
        }
        
        // 读取文件内容
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                // 解析书签HTML
                const bookmarksData = this.parseBookmarksHtml(e.target.result);
                
                // 存储解析后的数据
                this.bookmarksData = bookmarksData;
                
                // 渲染预览
                this.renderPreview(bookmarksData);
            } catch (err) {
                console.error('解析书签文件失败:', err);
                TooltipHandler.showTooltip('解析书签文件失败', 'error');
                this.resetPreview();
            }
        };
        
        reader.onerror = () => {
            TooltipHandler.showTooltip('读取文件失败', 'error');
            this.resetPreview();
        };
        
        reader.readAsText(file);
    },
    
    /**
     * 重置预览
     */
    resetPreview: function() {
        this.previewContainer.classList.remove('active');
        this.previewContent.innerHTML = '';
        this.previewCount.textContent = '0 个书签将被导入';
        this.importButton.disabled = true;
        this.bookmarksData = null;
    },
    
    /**
     * 解析书签HTML
     * @param {string} html - 书签HTML内容
     * @returns {Object} 解析后的书签数据
     */
    parseBookmarksHtml: function(html) {
        // 创建一个临时的DOM元素来解析HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 查找所有h3标签
        const allH3Elements = doc.querySelectorAll('h3');
        
        if (allH3Elements.length === 0) {
            throw new Error('未找到书签数据或h3标签');
        }
        
        // 将所有h3和a元素按照它们在文档中的顺序排列
        const getAllElements = () => {
            // 获取文档中所有的h3和a元素
            const allElements = [];
            const treeWalker = doc.createTreeWalker(
                doc.body,
                NodeFilter.SHOW_ELEMENT,
                {
                    acceptNode: function(node) {
                        if (node.tagName === 'H3' || node.tagName === 'A') {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                        return NodeFilter.FILTER_SKIP;
                    }
                }
            );
            
            let currentNode;
            while (currentNode = treeWalker.nextNode()) {
                allElements.push(currentNode);
            }
            
            return allElements;
        };
        
        const allElements = getAllElements();
        
        // 创建最终的分组结果
        const bookmarkGroups = [];
        let currentGroup = null;
        
        // 按顺序处理所有元素
        allElements.forEach(element => {
            if (element.tagName === 'H3') {
                // 找到新的h3标签，创建新分组
                currentGroup = {
                    name: element.textContent.trim(),
                    bookmarks: []
                };
                bookmarkGroups.push(currentGroup);
            } else if (element.tagName === 'A' && currentGroup) {
                // 这是一个书签链接，添加到当前分组
                currentGroup.bookmarks.push({
                    title: element.textContent.trim(),
                    url: element.href,
                    icon: element.getAttribute('icon') || ''
                });
            }
        });
        
        // 过滤掉没有书签的分组
        const filteredGroups = bookmarkGroups.filter(group => group.bookmarks.length > 0);
        
        return {
            groups: filteredGroups
        };
    },
    
    /**
     * 渲染预览
     * @param {Object} bookmarksData - 书签数据
     */
    renderPreview: function(bookmarksData) {
        // 清空预览内容
        this.previewContent.innerHTML = '';
        
        // 统计所有书签数量
        let totalBookmarks = 0;
        
        bookmarksData.groups.forEach(group => {
            totalBookmarks += group.bookmarks.length;
        });
        
        this.previewCount.textContent = `${totalBookmarks} 个书签将被导入`;
        
        // 渲染分组预览
        if (this.useFoldersAsGroups.checked) {
            // 按H标签分组显示
            bookmarksData.groups.forEach(group => {
                if (group.bookmarks.length > 0) {
                    const groupDiv = document.createElement('div');
                    groupDiv.className = 'preview-group';
                    
                    const groupTitle = document.createElement('div');
                    groupTitle.className = 'preview-group-title';
                    groupTitle.textContent = group.name;
                    groupDiv.appendChild(groupTitle);
                    
                    // 渲染该分组下的书签
                    group.bookmarks.forEach(bookmark => {
                        const bookmarkDiv = document.createElement('div');
                        bookmarkDiv.className = 'preview-bookmark';
                        bookmarkDiv.textContent = bookmark.title;
                        bookmarkDiv.title = bookmark.url;
                        groupDiv.appendChild(bookmarkDiv);
                    });
                    
                    this.previewContent.appendChild(groupDiv);
                }
            });
        } else {
            // 不使用分组，所有书签平铺显示
            bookmarksData.groups.forEach(group => {
                group.bookmarks.forEach(bookmark => {
                    const bookmarkDiv = document.createElement('div');
                    bookmarkDiv.className = 'preview-bookmark';
                    bookmarkDiv.textContent = bookmark.title;
                    bookmarkDiv.title = bookmark.url;
                    this.previewContent.appendChild(bookmarkDiv);
                });
            });
        }
        
        // 显示预览区域
        this.previewContainer.classList.add('active');
        
        // 启用导入按钮
        this.importButton.disabled = totalBookmarks === 0;
    },
    
    /**
     * 导入书签
     */
    importBookmarks: function() {
        if (!this.bookmarksData || !this.currentNavType) {
            TooltipHandler.showTooltip('没有可导入的数据', 'error');
            return;
        }
        
        try {
            // 转换书签数据为系统数据格式
            const importedData = this.convertBookmarksToSystemData(this.bookmarksData);
            
            // 将数据添加到当前导航项
            if (!DataStore.cards[this.currentNavType]) {
                DataStore.cards[this.currentNavType] = [];
            }
            
            // 合并数据
            importedData.forEach(group => {
                // 检查是否已存在同名分组
                const existingGroupIndex = DataStore.cards[this.currentNavType].findIndex(
                    existingGroup => existingGroup.groupName === group.groupName
                );
                
                if (existingGroupIndex >= 0) {
                    // 如果存在同名分组，合并项目
                    DataStore.cards[this.currentNavType][existingGroupIndex].items = [
                        ...DataStore.cards[this.currentNavType][existingGroupIndex].items,
                        ...group.items
                    ];
                } else {
                    // 如果不存在同名分组，添加新分组
                    DataStore.cards[this.currentNavType].push(group);
                }
            });
            
            // 保存到本地存储
            localStorage.setItem('ruleSystemData', JSON.stringify(DataStore));
            
            // 触发数据更新事件
            document.dispatchEvent(new CustomEvent('dataUpdated'));
            
            // 显示成功消息
            TooltipHandler.showTooltip(`成功导入 ${this.previewCount.textContent}`, 'success');
            
            // 关闭模态框
            this.hideModal();
        } catch (err) {
            console.error('导入书签失败:', err);
            TooltipHandler.showTooltip('导入书签失败', 'error');
        }
    },
    
    /**
     * 将书签数据转换为系统数据格式
     * @param {Object} bookmarksData - 书签数据
     * @returns {Array} 系统格式的数据
     */
    convertBookmarksToSystemData: function(bookmarksData) {
        const result = [];
        
        // 随机选择一种卡片样式
        const getRandomCardStyle = () => {
            const styles = ['card1', 'card2', 'card3', 'card4', 'card5'];
            return styles[Math.floor(Math.random() * styles.length)];
        };
        
        // 随机选择一个图标
        const getRandomIcon = () => {
            const icons = [
                'a-hua1.png', 'a-hua2.png', 'a-hua5.png', 'a-hua6.png', 'a-hua7.png',
                'a-hua12.png', 'a-hua13.png', 'a-hua15.png', 'a-hua17.png', 'a-hua18.png',
                'a-hua23.png', 'a-hua24.png', 'a-hua26.png', 'a-hua28.png', 'a-hua29.png',
                'a-hua31.png', 'a-hua32.png', 'a-hua33.png', 'a-hua36.png', 'a-hua40.png'
            ];
            return icons[Math.floor(Math.random() * icons.length)];
        };
        
        // 随机选择一个颜色索引
        const getRandomColorIndex = () => {
            return Math.floor(Math.random() * 6) + 1;
        };
        
        // 如果使用H标签作为分组
        if (this.useFoldersAsGroups.checked) {
            // 遍历每个H标签分组
            bookmarksData.groups.forEach((group) => {
                // 只添加有书签的分组
                if (group.bookmarks.length > 0) {
                    const groupData = {
                        groupName: group.name,
                        colorIndex: getRandomColorIndex(),
                        items: group.bookmarks.map(bookmark => ({
                            title: bookmark.title,
                            url: bookmark.url,
                            description: '',
                            icon: getRandomIcon(),
                            cardType: getRandomCardStyle()
                        }))
                    };
                    
                    result.push(groupData);
                }
            });
        } else {
            // 不使用H标签作为分组，将所有书签添加到一个默认分组中
            const allBookmarks = [];
            
            // 收集所有书签
            bookmarksData.groups.forEach(group => {
                group.bookmarks.forEach(bookmark => {
                    allBookmarks.push({
                        title: bookmark.title,
                        url: bookmark.url,
                        description: '',
                        icon: getRandomIcon(),
                        cardType: getRandomCardStyle()
                    });
                });
            });
            
            // 创建一个默认分组包含所有书签
            if (allBookmarks.length > 0) {
                result.push({
                    groupName: 'Chrome收藏夹',
                    colorIndex: getRandomColorIndex(),
                    items: allBookmarks
                });
            }
        }
        
        return result;
    }
};

export default ChromeImport; 