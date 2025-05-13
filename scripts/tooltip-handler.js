/**
 * 工具提示处理模块
 * 处理鼠标悬停时显示的气泡提示
 */

const TooltipHandler = {
    /**
     * 初始化工具提示处理器
     */
    init: function() {
        // 创建工具提示元素
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        document.body.appendChild(this.tooltip);
        
        // 创建通知元素
        this.notification = document.createElement('div');
        this.notification.className = 'notification';
        document.body.appendChild(this.notification);
        
        // 绑定全局鼠标移动事件
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // 初始化完成标记
        this.initialized = true;
    },
    
    /**
     * 处理鼠标移动事件
     * @param {MouseEvent} event - 鼠标事件对象
     */
    handleMouseMove: function(event) {
        if (this.activeElement) {
            // 计算工具提示位置
            const x = event.clientX;
            const y = event.clientY;
            
            // 设置工具提示位置（在鼠标右侧10px，垂直居中）
            this.tooltip.style.left = `${x + 15}px`;
            this.tooltip.style.top = `${y - this.tooltip.offsetHeight / 2}px`;
            
            // 检查是否需要调整位置以避免超出视口
            this.adjustPosition();
        }
    },
    
    /**
     * 调整工具提示位置，避免超出视口
     */
    adjustPosition: function() {
        const rect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 重置所有方向类
        this.tooltip.classList.remove('top', 'left', 'right');
        
        // 检查右侧边界
        if (rect.right > viewportWidth - 10) {
            // 如果右侧超出，则显示在鼠标左侧
            this.tooltip.style.left = `${parseFloat(this.tooltip.style.left) - rect.width - 30}px`;
            this.tooltip.classList.add('left');
        }
        
        // 检查左侧边界
        if (rect.left < 10) {
            this.tooltip.style.left = '10px';
        }
        
        // 检查顶部边界
        if (rect.top < 10) {
            this.tooltip.style.top = '10px';
        }
        
        // 检查底部边界
        if (rect.bottom > viewportHeight - 10) {
            this.tooltip.style.top = `${viewportHeight - rect.height - 10}px`;
        }
    },
    
    /**
     * 显示工具提示
     * @param {HTMLElement} element - 触发工具提示的元素
     * @param {string} content - 工具提示内容，可以包含HTML
     */
    show: function(element, content) {
        if (!this.initialized) {
            this.init();
        }
        
        // 设置工具提示内容
        this.tooltip.innerHTML = content;
        
        // 记录当前活动元素
        this.activeElement = element;
        
        // 显示工具提示
        this.tooltip.classList.add('active');
    },
    
    /**
     * 隐藏工具提示
     */
    hide: function() {
        if (this.tooltip) {
            this.tooltip.classList.remove('active');
            this.activeElement = null;
        }
    },
    
    /**
     * 显示通知消息
     * @param {string} message - 通知内容
     * @param {string} type - 通知类型（success, error, info）
     */
    showTooltip: function(message, type = 'info') {
        if (!this.initialized) {
            this.init();
        }
        
        // 清除之前的通知类名
        this.notification.className = 'notification';
        
        // 添加类型类名
        this.notification.classList.add(type);
        
        // 设置消息内容
        this.notification.textContent = message;
        
        // 显示通知
        this.notification.classList.add('show');
        
        // 自动隐藏通知
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
};

export default TooltipHandler; 