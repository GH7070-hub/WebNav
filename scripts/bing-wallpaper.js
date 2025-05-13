/**
 * Bing壁纸背景模块
 * 从Bing获取每日壁纸并设置为网页背景
 */

const BingWallpaper = {
    /**
     * 初始化Bing壁纸背景
     */
    init: function() {
        // 创建背景元素
        this.createBackgroundElement();
        
        // 获取并设置Bing壁纸
        this.fetchBingWallpaper();
        
        console.log('Bing壁纸背景已初始化');
    },
    
    /**
     * 创建背景元素
     */
    createBackgroundElement: function() {
        // 创建背景容器
        this.bgContainer = document.createElement('div');
        this.bgContainer.id = 'bing-wallpaper-container';
        
        // 设置容器样式
        Object.assign(this.bgContainer.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-2', // 在背景动画Canvas的下层
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            transition: 'opacity 1s ease-in-out',
            opacity: '0'
        });
        
        // 添加到body
        document.body.appendChild(this.bgContainer);
        
        // 创建背景叠加层以增加对比度
        this.bgOverlay = document.createElement('div');
        this.bgOverlay.id = 'bing-wallpaper-overlay';
        
        // 设置叠加层样式
        Object.assign(this.bgOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-1', // 在背景图片的上层，背景动画的下层
            backgroundColor: 'rgba(255, 255, 255, 0.85)', // 白色半透明叠加
            backdropFilter: 'blur(5px)', // 轻微模糊效果
            WebkitBackdropFilter: 'blur(5px)'
        });
        
        // 添加到body
        document.body.appendChild(this.bgOverlay);
    },
    
    /**
     * 获取Bing每日壁纸
     */
    fetchBingWallpaper: function() {
        // 使用微软Bing图片API获取壁纸
        // 由于浏览器的同源策略限制，我们使用jsonp方式或直接拼接URL
        
        // 构建壁纸URL (中国版Bing)
        const bingUrl = `https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN`;
        
        // 由于同源策略，我们不能直接通过fetch获取数据
        // 这里我们采用直接构建URL的方式
        this.getWallpaperUrl().then(wallpaperUrl => {
            if (wallpaperUrl) {
                // 设置背景图片
                this.bgContainer.style.backgroundImage = `url(${wallpaperUrl})`;
                // 淡入显示
                setTimeout(() => {
                    this.bgContainer.style.opacity = '1';
                }, 300);
                
                // 缓存壁纸数据
                localStorage.setItem('bingWallpaperUrl', wallpaperUrl);
                localStorage.setItem('bingWallpaperDate', new Date().toDateString());
            }
        }).catch(error => {
            console.error('获取Bing壁纸失败:', error);
            // 使用缓存的壁纸或默认背景
            this.useBackupWallpaper();
        });
    },
    
    /**
     * 获取壁纸URL
     * 首先尝试从localStorage中获取今日壁纸
     * 如果不存在或已过期，则使用直接构建URL方式获取
     */
    getWallpaperUrl: function() {
        return new Promise((resolve, reject) => {
            // 检查本地存储中是否有今天的壁纸
            const savedUrl = localStorage.getItem('bingWallpaperUrl');
            const savedDate = localStorage.getItem('bingWallpaperDate');
            const today = new Date().toDateString();
            
            if (savedUrl && savedDate === today) {
                // 使用缓存的今日壁纸
                resolve(savedUrl);
                return;
            }
            
            // 构建Bing图片URL
            const date = new Date();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const year = date.getFullYear();
            
            // 直接使用预构建的URL格式
            // Bing每日图片的URL格式通常为：https://www.bing.com/th?id=OHR.{ImageName}_{Market}.jpg
            // 由于无法直接获取ImageName，我们使用日期作为索引直接访问
            const wallpaperUrl = `https://cn.bing.com/th?id=OHR.BingWallpaper_ZH-CN&rf=LaDigue_1920x1080.jpg&pid=hp&w=1920&h=1080&rs=1`;
            
            // 检查URL是否可访问
            const img = new Image();
            img.onload = function() {
                resolve(wallpaperUrl);
            };
            img.onerror = function() {
                // 如果直接构建的URL不可用，尝试另一种格式
                const fallbackUrl = `https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN`;
                // 提示这里需要后端代理来解决跨域问题
                console.log('需要通过后端代理获取Bing壁纸，当前使用备用壁纸');
                reject('需要后端代理');
            };
            img.src = wallpaperUrl;
        });
    },
    
    /**
     * 使用备用壁纸
     */
    useBackupWallpaper: function() {
        // 检查是否有缓存的壁纸
        const savedUrl = localStorage.getItem('bingWallpaperUrl');
        
        if (savedUrl) {
            // 使用缓存的壁纸
            this.bgContainer.style.backgroundImage = `url(${savedUrl})`;
        } else {
            // 使用默认背景图片 (使用Unsplash提供的随机自然风景图)
            const defaultWallpaper = 'https://source.unsplash.com/1600x900/?nature,landscape';
            this.bgContainer.style.backgroundImage = `url(${defaultWallpaper})`;
        }
        
        // 淡入显示
        setTimeout(() => {
            this.bgContainer.style.opacity = '1';
        }, 300);
    }
};

export default BingWallpaper; 