/**
 * 主入口文件
 * 初始化应用程序
 */

// 导入模块
import UIController from './ui-controller.js';
import Animations from './animations.js';
import DataStore from './data-store.js';
import ModalHandler from './modal-handler.js';
import TooltipHandler from './tooltip-handler.js';
import BackgroundAnimation from './background-animation.js';
// import BingWallpaper from './bing-wallpaper.js'; // 注释掉Bing壁纸背景
import GradientBackground from './gradient-background.js'; // 导入渐变背景模块
import DataTransfer from './data-transfer.js';
import ChromeImport from './chrome-import.js'; // 导入Chrome收藏夹导入模块
import TitleManager from './title-manager.js'; // 导入标题管理模块
import BackgroundManager from './background-manager.js'; // 导入背景管理模块

// 在DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 首先初始化背景管理模块，确保自定义背景设置最早被应用
    BackgroundManager.init();
    
    // 初始化UI控制器
    UIController.init();
    
    // 初始化工具提示处理器
    TooltipHandler.init();
    
    // 初始化渐变背景（替换Bing壁纸背景）
    GradientBackground.init();
    
    // 初始化背景动画
    BackgroundAnimation.init();
    
    // 初始化数据传输模块
    DataTransfer.init();
    
    // 初始化Chrome收藏夹导入模块
    ChromeImport.init();
    
    // 初始化标题管理模块
    TitleManager.init();
    
    // 初始化动画效果
    Animations.init();
    
    console.log('规则制度管理系统已加载');
}); 