/**
 * 动画效果模块
 * 包含所有与动画相关的功能
 */

const Animations = {
    /**
     * 淡入显示元素
     * @param {HTMLElement} element - 需要淡入的元素
     * @param {number} duration - 动画持续时间(毫秒)
     * @param {Function} callback - 动画完成后的回调函数
     */
    fadeIn: function(element, duration = 400, callback) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'flex';
        
        requestAnimationFrame(() => {
            element.style.transition = `opacity ${duration}ms ease-out`;
            element.style.opacity = '1';
            
            setTimeout(() => {
                element.style.transition = '';
                if (typeof callback === 'function') {
                    callback();
                }
            }, duration);
        });
    },
    
    /**
     * 淡出隐藏元素
     * @param {HTMLElement} element - 需要淡出的元素
     * @param {number} duration - 动画持续时间(毫秒)
     * @param {Function} callback - 动画完成后的回调函数
     */
    fadeOut: function(element, duration = 400, callback) {
        if (!element) return;
        
        element.style.transition = `opacity ${duration}ms ease-out`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
            element.style.transition = '';
            if (typeof callback === 'function') {
                callback();
            }
        }, duration);
    },
    
    /**
     * 添加CSS类并在指定时间后移除
     * @param {HTMLElement} element - 目标元素
     * @param {string} className - 要添加的CSS类名
     * @param {number} duration - 持续时间(毫秒)
     */
    addClassTemporarily: function(element, className, duration = 1000) {
        if (!element) return;
        
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    },
    
    /**
     * 平滑滚动到指定元素
     * @param {HTMLElement} element - 目标元素
     * @param {number} offset - 偏移量(像素)
     * @param {number} duration - 动画持续时间(毫秒)
     */
    scrollTo: function(element, offset = 0, duration = 800) {
        if (!element) return;
        
        // 获取内容区域容器
        const contentArea = document.querySelector('.content');
        if (!contentArea) {
            return;
        }
        
        // 计算目标元素在内容区域中的相对位置
        const targetRect = element.getBoundingClientRect();
        const contentRect = contentArea.getBoundingClientRect();
        const targetPosition = targetRect.top - contentRect.top + contentArea.scrollTop + offset;
        const startPosition = contentArea.scrollTop;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            contentArea.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        // 缓动函数
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    },
    
    /**
     * 初始化动画效果
     */
    init: function() {
        this.setupCardHoverEffects();
    },
    
    /**
     * 设置卡片悬停效果
     */
    setupCardHoverEffects: function() {
        // 为所有卡片添加鼠标移动事件监听器
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // 初始化所有卡片的CSS变量
        document.querySelectorAll('.card').forEach(card => {
            card.style.setProperty('--x', '50%');
            card.style.setProperty('--y', '50%');
        });
    },
    
    /**
     * 处理鼠标移动事件，更新卡片的CSS变量
     * @param {MouseEvent} e - 鼠标事件对象
     */
    handleMouseMove: function(e) {
        // 获取鼠标下方的卡片元素
        const card = e.target.closest('.card');
        
        if (card) {
            // 获取卡片的位置和尺寸信息
            const rect = card.getBoundingClientRect();
            
            // 计算鼠标在卡片内的相对位置（百分比）
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // 使用requestAnimationFrame平滑更新CSS变量
            requestAnimationFrame(() => {
                card.style.setProperty('--x', `${x}%`);
                card.style.setProperty('--y', `${y}%`);
            });
            
            // 添加卡片的激活状态
            if (!card.classList.contains('card-active')) {
                card.classList.add('card-active');
                
                // 鼠标离开卡片时移除激活状态
                const handleMouseLeave = () => {
                    card.classList.remove('card-active');
                    card.removeEventListener('mouseleave', handleMouseLeave);
                };
                
                card.addEventListener('mouseleave', handleMouseLeave);
            }
        }
    }
};

// 导出动画模块
export default Animations; 