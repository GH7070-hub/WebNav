/**
 * 背景动画模块
 * 处理页面背景的动画效果
 */

const BackgroundAnimation = {
    init() {
        this.createCanvas();
        this.initAnimation();
    },

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'background-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    },

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    initAnimation() {
        this.particles = [];
        this.createParticles();
        this.animate();
    },

    createParticles() {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: Math.random() * 2 - 1,
                speedY: Math.random() * 2 - 1
            });
        }
    },

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY *= -1;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
};

export default BackgroundAnimation;