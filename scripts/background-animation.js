/**
 * 背景动画模块
 * 创建几何线条形的背景动画效果
 */

const BackgroundAnimation = {
    /**
     * 初始化背景动画
     * @param {boolean} force - 是否强制初始化，即使启用了自定义背景
     */
    init: function(force = false) {
        // 检查是否已启用自定义背景且非强制模式
        if (!force && localStorage.getItem('usingCustomBackground') === 'true') {
            return;
        }
        
        // 检查是否已存在背景动画元素
        const existingCanvas = document.getElementById('background-animation');
        if (existingCanvas) {
            existingCanvas.style.display = 'block';
            return;
        }
        
        // 创建Canvas元素
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'background-animation';
        this.ctx = this.canvas.getContext('2d');
        
        // 设置Canvas样式
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        
        // 将Canvas添加到页面
        document.body.appendChild(this.canvas);
        
        // 初始化动画参数
        this.initializeAnimation();
        
        // 开始动画循环
        this.animate();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
    },
    
    /**
     * 初始化动画参数
     */
    initializeAnimation: function() {
        // 设置Canvas尺寸
        this.handleResize();
        
        // 初始化粒子数组
        this.particles = [];
        
        // 创建初始粒子
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            });
        }
    },
    
    /**
     * 处理窗口大小变化
     */
    handleResize: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    /**
     * 动画循环
     */
    animate: function() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新和绘制粒子
        this.updateParticles();
        
        // 绘制连接线
        this.drawConnections();
        
        // 继续动画循环
        requestAnimationFrame(() => this.animate());
    },
    
    /**
     * 更新粒子位置
     */
    updateParticles: function() {
        for (let particle of this.particles) {
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 边界检查
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx = -particle.vx;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy = -particle.vy;
            }
            
            // 绘制粒子
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.fill();
        }
    },
    
    /**
     * 绘制粒子之间的连接线
     */
    drawConnections: function() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
                    this.ctx.stroke();
                }
            }
        }
    }
};

export default BackgroundAnimation;