/**
 * 背景管理模块
 * 用于管理网页背景的上传、预览和应用
 */

import TooltipHandler from './tooltip-handler.js';

const BackgroundManager = {
    init: function() {
        this.uploadBgBtn = document.querySelector('.upload-bg-btn');
        this.uploadBgModal = document.getElementById('upload-bg-modal');
        this.closeButtons = this.uploadBgModal.querySelectorAll('.modal-close, .modal-close-btn');
        this.applyBgBtn = document.getElementById('apply-bg-btn');
        this.resetBgBtn = document.getElementById('reset-bg-btn');
        
        this.bgTypeRadios = this.uploadBgModal.querySelectorAll('input[name="bg-type"]');
        this.imageUploadContainer = document.getElementById('image-upload-container');
        this.videoUploadContainer = document.getElementById('video-upload-container');
        
        this.bindEvents();
        this.loadCustomBackground();
    },
    
    bindEvents: function() {
        this.uploadBgBtn.addEventListener('click', () => this.openModal());
        
        this.closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeModal());
        });
        
        this.bgTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleBgTypeChange());
        });
        
        this.applyBgBtn.addEventListener('click', () => this.applyBackground());
        this.resetBgBtn.addEventListener('click', () => this.resetBackground());
        
        document.getElementById('bg-opacity').addEventListener('input', (e) => {
            document.getElementById('opacity-value').textContent = e.target.value + '%';
        });
    },
    
    openModal: function() {
        this.uploadBgModal.style.display = 'flex';
    },
    
    closeModal: function() {
        this.uploadBgModal.style.display = 'none';
        this.clearPreview();
    },
    
    handleBgTypeChange: function() {
        const selectedType = this.uploadBgModal.querySelector('input[name="bg-type"]:checked').value;
        
        if (selectedType === 'image') {
            this.imageUploadContainer.style.display = 'block';
            this.videoUploadContainer.style.display = 'none';
        } else {
            this.imageUploadContainer.style.display = 'none';
            this.videoUploadContainer.style.display = 'block';
        }
        
        this.clearPreview();
    },
    
    clearPreview: function() {
        const previewContent = document.getElementById('bg-preview-content');
        previewContent.innerHTML = '';
    },
    
    applyBackground: function() {
        const selectedType = this.uploadBgModal.querySelector('input[name="bg-type"]:checked').value;
        const opacity = document.getElementById('bg-opacity').value;
        const enableParticles = document.getElementById('enable-particles').checked;
        
        let file;
        if (selectedType === 'image') {
            file = document.getElementById('bg-image-file').files[0];
        } else {
            file = document.getElementById('bg-video-file').files[0];
        }
        
        if (!file) {
            TooltipHandler.showTooltip('请选择文件', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const backgroundData = {
                type: selectedType,
                data: e.target.result,
                opacity: opacity,
                enableParticles: enableParticles
            };
            
            localStorage.setItem('customBackground', JSON.stringify(backgroundData));
            localStorage.setItem('usingCustomBackground', 'true');
            
            this.applyBackgroundToPage(backgroundData);
            this.closeModal();
            
            TooltipHandler.showTooltip('背景应用成功', 'success');
        };
        
        reader.readAsDataURL(file);
    },
    
    resetBackground: function() {
        localStorage.removeItem('customBackground');
        localStorage.setItem('usingCustomBackground', 'false');
        
        this.removeCustomBackground();
        this.closeModal();
        
        TooltipHandler.showTooltip('背景已重置', 'success');
        
        setTimeout(() => location.reload(), 1000);
    },
    
    loadCustomBackground: function() {
        const backgroundData = localStorage.getItem('customBackground');
        if (backgroundData) {
            try {
                const data = JSON.parse(backgroundData);
                this.applyBackgroundToPage(data);
            } catch (error) {
                TooltipHandler.showTooltip('背景加载失败', 'error');
            }
        }
    },
    
    applyBackgroundToPage: function(data) {
        this.removeCustomBackground();
        
        const container = document.createElement('div');
        container.id = 'custom-background';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '-1';
        container.style.opacity = data.opacity / 100;
        
        if (data.type === 'image') {
            container.style.backgroundImage = `url(${data.data})`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
        } else {
            const video = document.createElement('video');
            video.src = data.data;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            container.appendChild(video);
        }
        
        document.body.insertBefore(container, document.body.firstChild);
    },
    
    removeCustomBackground: function() {
        const existingBg = document.getElementById('custom-background');
        if (existingBg) {
            existingBg.remove();
        }
    }
};

export default BackgroundManager;