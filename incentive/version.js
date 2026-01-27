/**
 * 版本号统一管理文件
 * 修改此文件后，所有页面会自动更新版本号
 */

const APP_VERSION = {
    // 主版本号
    version: '1.1.1',
    
    // 构建日期
    buildDate: '2026-01-27',
    
    // 更新日志
    changelog: '修改ui文案',
    
    // 获取完整版本信息
    getFullVersion: function() {
        return `v${this.version} (${this.buildDate})`;
    },
    
    // 打印版本信息到控制台
    logVersion: function() {
        console.log(`%c[Incentive App] Version: ${this.version}`, 'color: #49A0D9; font-weight: bold;');
        console.log(`%c[Incentive App] Build Date: ${this.buildDate}`, 'color: #999;');
        console.log(`%c[Incentive App] Changelog: ${this.changelog}`, 'color: #999;');
    }
};

// 页面加载时打印版本信息
if (typeof window !== 'undefined') {
    window.APP_VERSION = APP_VERSION;
    document.addEventListener('DOMContentLoaded', function() {
        APP_VERSION.logVersion();
    });
}
