/**
 * 背景管理模块
 * 用于管理网页背景的上传、预览和应用
 */

import TooltipHandler from './tooltip-handler.js';

const BackgroundManager = {
    /**
     * 初始化背景管理器
     */
    init: function() {
        console.log('初始化背景管理器');
        
        // 获取DOM元素
        this.uploadBgBtn = document.querySelector('.upload-bg-btn');
        this.uploadBgModal = document.getElementById('upload-bg-modal');
        this.closeButtons = this.uploadBgModal.querySelectorAll('.modal-close, .modal-close-btn');
        this.applyBgBtn = document.getElementById('apply-bg-btn');
        this.resetBgBtn = document.getElementById('reset-bg-btn');
        
        // 背景类型选择
        this.bgTypeRadios = this.uploadBgModal.querySelectorAll('input[name="bg-type"]');
        this.imageUploadContainer = document.getElementById('image-upload-container');
        this.videoUploadContainer = document.getElementById('video-upload-container');
        
        // 文件输入和预览
        this.bgImageFile = document.getElementById('bg-image-file');
        this.bgVideoFile = document.getElementById('bg-video-file');
        this.bgPreviewContent = document.getElementById('bg-preview-content');
        
        // 透明度控制
        this.opacitySlider = document.getElementById('bg-opacity');
        this.opacityValue = document.getElementById('opacity-value');
        
        // 当前背景数据
        this.currentBackground = {
            type: 'image',
            url: null,
            opacity: 100,
            dataUrl: null
        };
        
        // 标记是否已应用自定义背景
        this.customBackgroundApplied = false;
        
        // 绑定事件
        this.bindEvents();
        
        // 立即加载背景设置
        this.loadBackgroundFromStorage();
        
        // 确保在页面完全加载后再次检查背景
        window.addEventListener('load', () => {
            console.log('页面加载完成，检查背景状态');
            // 延迟一小段时间再次检查，确保其他模块不会覆盖
            setTimeout(() => {
                const usingCustomBg = localStorage.getItem('usingCustomBackground');
                console.log('检查自定义背景状态:', usingCustomBg);
                if (usingCustomBg === 'true' && !this.customBackgroundApplied) {
                    console.log('检测到背景不一致，重新应用自定义背景');
                    this.loadBackgroundFromStorage();
                }
            }, 100);
        });
    },
    
    /**
     * 绑定事件处理函数
     */
    bindEvents: function() {
        // 上传背景按钮点击事件
        if (this.uploadBgBtn) {
            this.uploadBgBtn.addEventListener('click', this.showModal.bind(this));
        }
        
        // 关闭按钮点击事件
        this.closeButtons.forEach(button => {
            button.addEventListener('click', this.hideModal.bind(this));
        });
        
        // 应用背景按钮点击事件
        if (this.applyBgBtn) {
            this.applyBgBtn.addEventListener('click', this.applyBackground.bind(this));
        }
        
        // 重置背景按钮点击事件
        if (this.resetBgBtn) {
            this.resetBgBtn.addEventListener('click', this.resetBackground.bind(this));
        }
        
        // 背景类型切换事件
        this.bgTypeRadios.forEach(radio => {
            radio.addEventListener('change', this.handleBgTypeChange.bind(this));
        });
        
        // 文件选择事件
        this.bgImageFile.addEventListener('change', this.handleImageFileSelect.bind(this));
        this.bgVideoFile.addEventListener('change', this.handleVideoFileSelect.bind(this));
        
        // 透明度滑块事件
        this.opacitySlider.addEventListener('input', this.handleOpacityChange.bind(this));
    },
    
    /**
     * 显示上传背景模态框
     */
    showModal: function() {
        // 检查是否在编辑模式
        if (!document.body.classList.contains('edit-mode')) {
            TooltipHandler.showTooltip('请先启用编辑模式', 'error');
            return;
        }
        
        // 重置预览
        this.resetPreview();
        
        // 显示模态框
        this.uploadBgModal.classList.add('active');
    },
    
    /**
     * 隐藏模态框
     */
    hideModal: function() {
        this.uploadBgModal.classList.remove('active');
    },
    
    /**
     * 重置预览
     */
    resetPreview: function() {
        this.bgPreviewContent.innerHTML = '选择文件以预览背景';
        this.bgImageFile.value = '';
        this.bgVideoFile.value = '';
        
        // 重置opacity滑块
        this.opacitySlider.value = 100;
        this.opacityValue.textContent = '100%';
        
        // 根据保存的设置选择背景类型
        const savedType = localStorage.getItem('backgroundType') || 'image';
        this.bgTypeRadios.forEach(radio => {
            radio.checked = radio.value === savedType;
        });
        
        this.handleBgTypeChange({target: {value: savedType}});
    },
    
    /**
     * 处理背景类型变更
     */
    handleBgTypeChange: function(event) {
        const bgType = (event.target && event.target.value) || event;
        
        // 更新当前背景类型
        this.currentBackground.type = bgType;
        
        // 显示/隐藏相应的上传容器
        if (bgType === 'image') {
            this.imageUploadContainer.style.display = 'block';
            this.videoUploadContainer.style.display = 'none';
        } else if (bgType === 'video') {
            this.imageUploadContainer.style.display = 'none';
            this.videoUploadContainer.style.display = 'block';
        }
    },
    
    /**
     * 处理图片文件选择
     */
    handleImageFileSelect: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            TooltipHandler.showTooltip('请选择有效的图片文件', 'error');
            this.resetPreview();
            return;
        }
        
        // 检查文件大小
        if (file.size > 2 * 1024 * 1024) { // 2MB
            TooltipHandler.showTooltip('图片文件过大，请选择小于2MB的图片', 'error');
            this.resetPreview();
            return;
        }
        
        // 将文件读取为DataURL
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            
            // 更新预览
            this.bgPreviewContent.innerHTML = '';
            const img = document.createElement('img');
            img.src = dataUrl;
            img.alt = 'Background Preview';
            this.bgPreviewContent.appendChild(img);
            
            // 更新当前背景数据
            this.currentBackground.dataUrl = dataUrl;
            this.currentBackground.file = file;
            
            // 应用透明度
            img.style.opacity = this.currentBackground.opacity / 100;
        };
        
        reader.readAsDataURL(file);
    },
    
    /**
     * 处理视频文件选择
     */
    handleVideoFileSelect: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 检查文件类型
        if (!file.type.startsWith('video/')) {
            TooltipHandler.showTooltip('请选择有效的视频文件', 'error');
            this.resetPreview();
            return;
        }
        
        // 检查文件大小
        if (file.size > 5 * 1024 * 1024) { // 5MB
            TooltipHandler.showTooltip('视频文件过大，请选择小于5MB的视频', 'error');
            this.resetPreview();
            return;
        }
        
        // 为预览创建临时URL
        const tempUrl = URL.createObjectURL(file);
        
        // 更新预览
        this.bgPreviewContent.innerHTML = '';
        const video = document.createElement('video');
        video.src = tempUrl;
        video.controls = true;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.style.maxWidth = '100%';
        this.bgPreviewContent.appendChild(video);
        
        // 将文件读取为DataURL
        const reader = new FileReader();
        reader.onload = (e) => {
            // 保存DataURL
            this.currentBackground.dataUrl = e.target.result;
            
            // 应用透明度
            video.style.opacity = this.currentBackground.opacity / 100;
        };
        
        reader.onerror = (error) => {
            console.error('读取视频文件失败:', error);
            TooltipHandler.showTooltip('视频文件读取失败，可能文件过大', 'error');
        };
        
        // 保存文件引用
        this.currentBackground.file = file;
        this.currentBackground.tempUrl = tempUrl;
        
        reader.readAsDataURL(file);
    },
    
    /**
     * 处理透明度变更
     */
    handleOpacityChange: function(event) {
        const opacity = event.target.value;
        
        // 更新显示值
        this.opacityValue.textContent = `${opacity}%`;
        
        // 更新当前背景透明度
        this.currentBackground.opacity = opacity;
        
        // 在预览中更新透明度
        const previewElement = this.bgPreviewContent.querySelector('img, video');
        if (previewElement) {
            previewElement.style.opacity = opacity / 100;
        }
    },
    
    /**
     * 应用背景
     */
    applyBackground: function() {
        if (!this.currentBackground.dataUrl && !this.currentBackground.file) {
            TooltipHandler.showTooltip('请先选择背景文件', 'error');
            return;
        }
        
        // 如果是视频且没有dataUrl，则需要先读取
        if (this.currentBackground.type === 'video' && !this.currentBackground.dataUrl && this.currentBackground.file) {
            const loadingMsg = document.createElement('div');
            loadingMsg.textContent = '正在处理视频文件，请稍候...';
            loadingMsg.className = 'loading-msg';
            this.bgPreviewContent.appendChild(loadingMsg);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentBackground.dataUrl = e.target.result;
                this.applyBackgroundToDOM();
            };
            reader.onerror = (error) => {
                console.error('读取视频文件失败:', error);
                TooltipHandler.showTooltip('视频文件读取失败，可能文件过大', 'error');
                loadingMsg.remove();
            };
            reader.readAsDataURL(this.currentBackground.file);
        } else {
            // 直接应用背景
            this.applyBackgroundToDOM();
        }
    },
    
    /**
     * 将背景应用到DOM
     */
    applyBackgroundToDOM: function() {
        try {
            console.log('开始应用背景到DOM');
            
            // 从DOM中移除旧的背景元素
            const oldBgElement = document.getElementById('custom-background');
            if (oldBgElement) {
                oldBgElement.remove();
            }
            
            // 隐藏原始背景图片
            document.body.style.backgroundImage = 'none';
            
            // 隐藏背景粒子动画
            const bgAnimation = document.getElementById('background-animation');
            if (bgAnimation) {
                bgAnimation.style.display = 'none';
            }
            
            // 使用DataURL创建背景元素
            let bgElement;
            const dataUrl = this.currentBackground.dataUrl;
            
            if (this.currentBackground.type === 'image') {
                bgElement = document.createElement('div');
                bgElement.style.backgroundImage = `url(${dataUrl})`;
                bgElement.style.backgroundSize = 'cover';
                bgElement.style.backgroundPosition = 'center center';
                bgElement.style.backgroundRepeat = 'no-repeat';
            } else if (this.currentBackground.type === 'video') {
                bgElement = document.createElement('video');
                bgElement.src = dataUrl;
                bgElement.autoplay = true;
                bgElement.loop = true;
                bgElement.muted = true;
                bgElement.style.objectFit = 'cover';
            }
            
            // 设置通用样式
            bgElement.id = 'custom-background';
            bgElement.style.position = 'fixed';
            bgElement.style.top = '0';
            bgElement.style.left = '0';
            bgElement.style.width = '100%';
            bgElement.style.height = '100%';
            bgElement.style.opacity = this.currentBackground.opacity / 100;
            bgElement.style.zIndex = '-1';
            bgElement.style.pointerEvents = 'none';
            
            // 添加到DOM
            document.body.appendChild(bgElement);
            
            // 标记已应用自定义背景
            this.customBackgroundApplied = true;
            
            // 保存设置到本地存储
            this.saveBackgroundToStorage();
            
            // 隐藏模态框
            this.hideModal();
            
            // 显示成功提示
            TooltipHandler.showTooltip('背景已成功应用', 'success');
            
            console.log('背景已成功应用到DOM');
        } catch (error) {
            console.error('应用背景到DOM失败:', error);
            TooltipHandler.showTooltip('应用背景失败', 'error');
        }
    },
    
    /**
     * 将背景设置保存到本地存储
     */
    saveBackgroundToStorage: function() {
        try {
            console.log('开始保存背景设置到localStorage');
            
            // 保存基本设置
            localStorage.setItem('backgroundType', this.currentBackground.type);
            localStorage.setItem('backgroundOpacity', this.currentBackground.opacity);
            localStorage.setItem('usingCustomBackground', 'true');
            
            // 如果已经有DataURL，则直接保存
            if (this.currentBackground.dataUrl) {
                console.log('保存背景数据URL，类型:', this.currentBackground.type);
                console.log('DataURL长度:', this.currentBackground.dataUrl.length);
                
                // 检查数据大小
                const dataSize = this.currentBackground.dataUrl.length * 0.75; // 估算实际大小
                console.log('估算数据大小:', Math.round(dataSize / 1024), 'KB');
                
                if (dataSize > 4 * 1024 * 1024) { // 4MB
                    console.warn('背景数据过大，可能超出localStorage限制');
                    TooltipHandler.showTooltip('背景文件过大，无法保存，刷新后将丢失', 'error');
                    return;
                }
                
                try {
                    // 先尝试清除旧数据
                    localStorage.removeItem('backgroundData');
                    
                    // 保存新数据
                    localStorage.setItem('backgroundData', this.currentBackground.dataUrl);
                    
                    // 验证保存是否成功
                    const savedData = localStorage.getItem('backgroundData');
                    if (!savedData) {
                        throw new Error('背景数据保存后无法读取');
                    }
                    
                    // 验证所有必要的键是否都已保存
                    const allKeys = ['backgroundType', 'backgroundOpacity', 'usingCustomBackground', 'backgroundData'];
                    const missingKeys = allKeys.filter(key => !localStorage.getItem(key));
                    
                    if (missingKeys.length > 0) {
                        console.error('以下键未成功保存:', missingKeys);
                        throw new Error('部分背景数据未成功保存');
                    }
                    
                    console.log('背景数据已成功保存到localStorage');
                    console.log('localStorage当前状态:', {
                        type: localStorage.getItem('backgroundType'),
                        opacity: localStorage.getItem('backgroundOpacity'),
                        usingCustomBg: localStorage.getItem('usingCustomBackground'),
                        hasData: !!localStorage.getItem('backgroundData')
                    });
                } catch (e) {
                    console.error('保存背景数据失败:', e);
                    TooltipHandler.showTooltip('背景文件过大，无法保存，刷新后将丢失', 'error');
                }
            } else {
                console.warn('没有背景数据URL可保存');
            }
        } catch (err) {
            console.error('保存背景设置失败:', err);
        }
    },
    
    /**
     * 从本地存储加载背景设置
     */
    loadBackgroundFromStorage: function() {
        try {
            console.log('开始从localStorage加载背景设置');
            
            // 检查所有必要的键是否存在
            const allKeys = ['backgroundType', 'backgroundOpacity', 'usingCustomBackground', 'backgroundData'];
            const missingKeys = allKeys.filter(key => !localStorage.getItem(key));
            
            if (missingKeys.length > 0) {
                console.log('缺少以下键:', missingKeys);
                return;
            }
            
            const bgType = localStorage.getItem('backgroundType');
            const bgOpacity = localStorage.getItem('backgroundOpacity');
            const bgData = localStorage.getItem('backgroundData');
            const usingCustomBg = localStorage.getItem('usingCustomBackground');
            
            console.log('加载的背景设置:', {
                type: bgType,
                opacity: bgOpacity,
                hasData: !!bgData,
                usingCustomBg: usingCustomBg
            });
            
            if (!bgType || !bgData || usingCustomBg !== 'true') {
                console.log('没有找到自定义背景数据或未启用自定义背景');
                return;
            }
            
            // 设置当前背景属性
            this.currentBackground.type = bgType;
            this.currentBackground.opacity = parseInt(bgOpacity || '100');
            this.currentBackground.dataUrl = bgData;
            
            // 隐藏原始背景图片
            document.body.style.backgroundImage = 'none';
            
            // 隐藏背景粒子动画
            const bgAnimation = document.getElementById('background-animation');
            if (bgAnimation) {
                console.log('隐藏背景动画');
                bgAnimation.style.display = 'none';
            }
            
            // 移除可能存在的旧背景元素
            const oldBgElement = document.getElementById('custom-background');
            if (oldBgElement) {
                console.log('移除旧的背景元素');
                oldBgElement.remove();
            }
            
            // 创建背景元素
            let bgElement;
            if (bgType === 'image') {
                console.log('创建图片背景元素');
                bgElement = document.createElement('div');
                bgElement.style.backgroundImage = `url(${bgData})`;
                bgElement.style.backgroundSize = 'cover';
                bgElement.style.backgroundPosition = 'center center';
                bgElement.style.backgroundRepeat = 'no-repeat';
            } else if (bgType === 'video') {
                console.log('创建视频背景元素');
                bgElement = document.createElement('video');
                bgElement.src = bgData;
                bgElement.autoplay = true;
                bgElement.loop = true;
                bgElement.muted = true;
                bgElement.style.objectFit = 'cover';
                // 确保视频加载失败时有错误处理
                bgElement.onerror = () => {
                    console.error('背景视频加载失败');
                    TooltipHandler.showTooltip('背景视频加载失败', 'error');
                    this.resetBackground(true);
                };
            }
            
            // 设置通用样式
            bgElement.id = 'custom-background';
            bgElement.style.position = 'fixed';
            bgElement.style.top = '0';
            bgElement.style.left = '0';
            bgElement.style.width = '100%';
            bgElement.style.height = '100%';
            bgElement.style.opacity = this.currentBackground.opacity / 100;
            bgElement.style.zIndex = '-1';
            bgElement.style.pointerEvents = 'none';
            
            // 添加到DOM
            document.body.appendChild(bgElement);
            
            // 标记已应用自定义背景
            this.customBackgroundApplied = true;
            
            console.log('背景已从localStorage成功恢复');
        } catch (err) {
            console.error('加载背景设置失败:', err);
            // 出错时重置背景
            this.resetBackground(true);
        }
    },
    
    /**
     * 重置背景到原始状态
     */
    resetBackground: async function(skipConfirm) {
        // 确认重置，除非skipConfirm为true
        if (!skipConfirm && !confirm('确定要删除自定义背景并恢复默认背景吗？')) {
            return;
        }
        
        console.log('开始重置背景');
        
        // 从DOM中移除自定义背景元素
        const customBgElement = document.getElementById('custom-background');
        if (customBgElement) {
            customBgElement.remove();
        }
        
        // 恢复原始背景图片
        document.body.style.backgroundImage = 'url("images/back.png")';
        
        try {
            // 恢复背景粒子动画
            const bgAnimation = document.getElementById('background-animation');
            if (bgAnimation) {
                console.log('恢复背景粒子动画');
                bgAnimation.style.display = 'block';
            } else {
                console.log('重新初始化背景粒子动画');
                // 如果背景动画元素不存在，重新初始化它
                const BackgroundAnimation = await import('./background-animation.js');
                await BackgroundAnimation.default.init();
            }
            
            // 清除本地存储中的背景数据
            localStorage.removeItem('backgroundType');
            localStorage.removeItem('backgroundOpacity');
            localStorage.removeItem('backgroundData');
            localStorage.removeItem('usingCustomBackground');
            
            // 重置当前背景数据
            this.currentBackground = {
                type: 'image',
                url: null,
                opacity: 100,
                dataUrl: null
            };
            
            // 标记未应用自定义背景
            this.customBackgroundApplied = false;
            
            // 隐藏模态框
            this.hideModal();
            
            // 显示成功提示（除非是出错时的静默重置）
            if (!skipConfirm) {
                TooltipHandler.showTooltip('已恢复默认背景', 'success');
            }
            
            console.log('背景重置完成');
        } catch (error) {
            console.error('重置背景时出错:', error);
            TooltipHandler.showTooltip('重置背景失败', 'error');
        }
    }
};

export default BackgroundManager; 