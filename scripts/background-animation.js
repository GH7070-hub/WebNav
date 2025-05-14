/**
 * 背景动画模块
 * 创建几何线条形的背景动画效果
 */

const BackgroundAnimation = {
    init: function(force = false) {
        if (!force && localStorage.getItem('usingCustomBackground') === 'true') {
            return;
        }
        
        const existingCanvas = document.getElementById('background-animation');
        if (existingCanvas) {
            existingCanvas.style.display = 'block';
            return;
        }
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'background-animation';
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        
        document.body.appendChild(this.canvas);
        
        this.initializeAnimation();
        this.animate();
        
        window.addEventListener('resize', () => this.handleResize());
    },
    
    initializeAnimation: function() {
        this.handleResize();
        this.particles = [];
        
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
    
    handleResize: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    animate: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateParticles();
        this.drawConnections();
        requestAnimationFrame(() => this.animate());
    },
    
    updateParticles: function() {
        for (let particle of this.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx = -particle.vx;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy = -particle.vy;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.fill();
        }
    },
    
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