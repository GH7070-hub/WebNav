/**
 * 背景动画模块
 * 创建几何线条形的背景动画效果
 */

const BackgroundAnimation = {
    /**
     * 初始化背景动画
     */
    init: function() {
        // 检查是否已启用自定义背景
        if (localStorage.getItem('usingCustomBackground') === 'true') {
            console.log('检测到已启用自定义背景，不初始化背景动画');
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
        this.canvas.style.zIndex = '0';
        this.canvas.style.opacity = '0.45';
        this.canvas.style.pointerEvents = 'none';
        
        // 将Canvas添加到body
        document.body.appendChild(this.canvas);
        
        // 初始化粒子
        this.particles = [];
        this.particleCount = 65;
        this.primaryColor = '#cf7543';
        this.secondaryColor = '#0f95b0';
        this.tertiaryColor = '#2c9678';
        this.maxDistance = 160;
        
        // 鼠标位置
        this.mouse = {
            x: null,
            y: null,
            radius: 180
        };
        
        // 动画帧计数器和速度控制
        this.frameCount = 0;
        this.animationSpeed = 1;
        
        // 调整Canvas大小
        this.resizeCanvas();
        
        // 绑定事件
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mouseout', this.handleMouseOut.bind(this));
        
        // 创建粒子
        this.createParticles();
        
        // 开始动画
        this.animate();
        
        console.log('背景动画已初始化');
    },
    
    /**
     * 处理鼠标移动事件
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseMove: function(event) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    },
    
    /**
     * 处理鼠标离开事件
     */
    handleMouseOut: function() {
        this.mouse.x = null;
        this.mouse.y = null;
    },
    
    /**
     * 调整Canvas大小
     */
    resizeCanvas: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 如果已经有粒子，重新创建它们以适应新的尺寸
        if (this.particles.length > 0) {
            this.createParticles();
        }
    },
    
    /**
     * 创建粒子
     */
    createParticles: function() {
        this.particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            // 随机决定使用的颜色
            let color;
            const colorRandom = Math.random();
            if (colorRandom < 0.33) {
                color = this.primaryColor;
            } else if (colorRandom < 0.66) {
                color = this.secondaryColor;
            } else {
                color = this.tertiaryColor;
            }
            
            // 创建粒子并设置初始属性
            const particle = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.3 + 0.5, // 保持粒子小，但略微增大一点
                color: color,
                speed: {
                    x: (Math.random() - 0.5) * 0.25, // 适当加快速度
                    y: (Math.random() - 0.5) * 0.25  // 适当加快速度
                },
                connections: [] // 存储连接的粒子索引
            };
            
            this.particles.push(particle);
        }
    },
    
    /**
     * 绘制粒子
     */
    drawParticles: function() {
        // 清空Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新粒子位置并绘制
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // 更新位置
            p.x += p.speed.x;
            p.y += p.speed.y;
            
            // 边界检测
            if (p.x < 0 || p.x > this.canvas.width) {
                p.speed.x = -p.speed.x;
            }
            if (p.y < 0 || p.y > this.canvas.height) {
                p.speed.y = -p.speed.y;
            }
            
            // 鼠标交互
            if (this.mouse.x && this.mouse.y) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    // 计算推力方向
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    
                    // 计算推力大小（距离越近，推力越大）
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    
                    // 应用推力
                    p.speed.x += forceDirectionX * force * 0.7; // 增强推力
                    p.speed.y += forceDirectionY * force * 0.7; // 增强推力
                    
                    // 限制最大速度
                    const maxSpeed = 2.5; // 适当增加最大速度
                    const speed = Math.sqrt(p.speed.x * p.speed.x + p.speed.y * p.speed.y);
                    if (speed > maxSpeed) {
                        p.speed.x = (p.speed.x / speed) * maxSpeed;
                        p.speed.y = (p.speed.y / speed) * maxSpeed;
                    }
                }
            }
            
            // 绘制粒子
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
            
            // 清空连接列表
            p.connections = [];
        }
        
        // 绘制连接线
        this.drawConnections();
    },
    
    /**
     * 绘制粒子连接线
     */
    drawConnections: function() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                // 计算两点之间的距离
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 如果距离小于最大连接距离，绘制连接线
                if (distance < this.maxDistance) {
                    // 根据距离计算线条透明度
                    const opacity = 1 - (distance / this.maxDistance);
                    
                    // 绘制线条 - 根据粒子颜色选择线条颜色
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    
                    // 选择线条颜色，使用中国传统色系
                    let lineColor;
                    if (p1.color === this.primaryColor && p2.color === this.primaryColor) {
                        // 凤凰色连线
                        lineColor = `rgba(207, 117, 67, ${opacity * 0.7})`; // 增加不透明度
                    } else if (p1.color === this.secondaryColor && p2.color === this.secondaryColor) {
                        // 湖蓝色连线
                        lineColor = `rgba(15, 149, 176, ${opacity * 0.7})`; // 增加不透明度
                    } else if (p1.color === this.tertiaryColor && p2.color === this.tertiaryColor) {
                        // 蛋青色连线
                        lineColor = `rgba(44, 150, 120, ${opacity * 0.7})`; // 增加不透明度
                    } else if ((p1.color === this.primaryColor && p2.color === this.secondaryColor) || 
                               (p1.color === this.secondaryColor && p2.color === this.primaryColor)) {
                        // 凤凰色和湖蓝色混合
                        lineColor = `rgba(111, 133, 122, ${opacity * 0.7})`; // 增加不透明度
                    } else if ((p1.color === this.primaryColor && p2.color === this.tertiaryColor) || 
                               (p1.color === this.tertiaryColor && p2.color === this.primaryColor)) {
                        // 凤凰色和蛋青色混合
                        lineColor = `rgba(126, 134, 94, ${opacity * 0.7})`; // 增加不透明度
                    } else {
                        // 湖蓝色和蛋青色混合
                        lineColor = `rgba(30, 150, 148, ${opacity * 0.7})`; // 增加不透明度
                    }
                    
                    this.ctx.strokeStyle = lineColor;
                    this.ctx.lineWidth = 0.7; // 增加线条粗细
                    this.ctx.stroke();
                    
                    // 记录连接
                    p1.connections.push(j);
                    p2.connections.push(i);
                }
            }
        }
    },
    
    /**
     * 动画循环
     */
    animate: function() {
        this.drawParticles();
        requestAnimationFrame(this.animate.bind(this));
    }
};

export default BackgroundAnimation; 