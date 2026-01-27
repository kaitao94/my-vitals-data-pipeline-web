
// 模块级变量存储URL参数
let moduleUrlParams = {};

// 血压监测应用配置文件
const CONFIG = {

    // 文本配置 - 所有显示的文本内容
    text: {
        title: "Blood Pressure Monitoring Report",  // 页面标题
        dateFormat: "MM/DD HH:mm",  // 日期格式
        systolicLabel: "(mmHg)",  // 收缩压单位
        diastolicLabel: "(mmHg)",  // 舒张压单位
        heartRateLabel: "(bpm)",  // 心率单位
        comparisonTitle: "Comparison with your 7-day average",  // 7天对比标题
        systolicComparisonLabel: "Systolic",  // 收缩压对比标签
        diastolicComparisonLabel: "Diastolic",  // 舒张压对比标签
        aiAnalysisLabel: "Text generated with AI",  // AI分析标签
        betaBadge: "beta",  // Beta标识
        feedbackPlaceholder: "Tell us how we can improve",  // 反馈输入框占位符
        reminderText: "Don’t remind me permanently",  // 7天不再提醒文本
        submitButton: "Submit",  // 提交按钮文本
        loadingText: "Loading...",  // 加载中文本
        errorMissingParams: "Missing required parameters",  // 缺少参数错误
        errorLoadFailed: "Failed to load data, please try again later",  // 数据加载失败错误
        errorNetwork: "Network error",  // 网络错误
        alertNoFeedback: "Please enter feedback content",  // 无反馈内容警告
        alertSubmitSuccess: "Feedback submitted successfully!",  // 提交成功提示
        alertSubmitFailed: "Submission failed, please try again later",  // 提交失败提示
    },

    // 图片配置 - 所有使用的图片路径
    images: {
        systolicUpArrow: "./icon_up.png",  // 收缩压上升箭头
        systolicDownArrow: "./icon_down.png",  // 收缩压下降箭头
        diastolicUpArrow: "./icon_up.png",  // 舒张压上升箭头
        diastolicDownArrow: "./icon_down.png",  // 舒张压下降箭头
        playIcon: "./icon_play.png",  // 播放图标
        likeIcon: "./icon_like.png",  // 点赞图标
        likeIconActive: "./icon_like_seletct.png",  // 点赞激活图标
        dislikeIcon: "./icon_downvote.png",  // 点踩图标
        dislikeIconActive: "./icon_downvote_select.png",  // 点踩激活图标
        stableIcon: "./icon_stable.png",  // 稳定图标
        stopIcon: "./icon_stop.png"  // 停止图标
    },

    // API配置 - 后端接口地址
    api: {
        fetchData: "/api/blood-pressure",  // 获取血压数据接口
        submitFeedback: "/api/feedback"  // 提交反馈接口
    },

    // 默认数据 - 用于测试或初始显示
    defaultData: {
        blood_pressure_data: {
            measurement_time: "",  // 默认日期
            high_pressure: 0,  // 默认收缩压
            low_pressure: 0,  // 默认舒张压
            heart_rate: 0  // 默认心率
        },
        incentive_data: {
            AvgHigh: 0,  // 默认收缩压差值
            AvgLow: 0,  // 默认舒张压差值
            VoiceText: "Your blood pressure is at the upper limit of the normal range. It is recommended to continue to maintain a healthy lifestyle and increase physical activity appropriately.",  // 默认AI分析文本
            bpLevel: 0  // 默认血压等级：1=正常，2=偏高，3=高血压1期，4=高血压2期
        }
    }
};

// 获取URL参数函数
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const sanitize = (v) => v ? v.trim().replace(/^[`'\"]+|[`'\"]+$/g, '') : v;
    return {
        token: sanitize(urlParams.get('token')),
        phoneDataId: sanitize(urlParams.get('phoneDataId')),
        un: sanitize(urlParams.get('un')),
        baseUrl: sanitize(urlParams.get('baseUrl')),
        timeFormat: sanitize(urlParams.get('timeFormat')),
        bpUnit: sanitize(urlParams.get('bpUnit'))
    };
}

// 更新文本内容函数
function updateTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;  // 设置元素文本内容
    }
}

// 更新文本内容和颜色函数
function updateTextContentWithColor(elementId, text, color) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;  // 设置元素文本内容
        element.style.color = color;   // 设置文本颜色
    }
}
function updateAiText(text) {
    const el = document.getElementById('aiAnalysisText');
    if (el) {
        el.textContent = text;
        const spacer = document.createElement('span');
        spacer.className = 'last-line-spacer';
        el.appendChild(spacer);
    }
}

// 更新图片源函数
function updateImageSource(elementId, src, alt = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.src = src;  // 设置图片源
        if (alt) element.alt = alt;  // 设置可选的alt文本
    }
}

// 更新页面数据函数
function updatePageData(data) {
    const { timeFormat, bpUnit } = moduleUrlParams;
    let displayTime = data.blood_pressure_data.measurement_time;

    updateTextContent('dateDisplay', formatDisplayTime(displayTime, timeFormat));  // 更新日期显示
    updateTextContent('systolicValue', bpUnit === 'mmHg' ? data.blood_pressure_data.high_pressure : mmhgToKpa(data.blood_pressure_data.high_pressure));  // 更新收缩压值
    updateTextContent('diastolicValue', bpUnit === 'mmHg' ? data.blood_pressure_data.low_pressure : mmhgToKpa(data.blood_pressure_data.low_pressure));  // 更新舒张压值
    updateTextContent('heartRateValue', data.blood_pressure_data.heart_rate);  // 更新心率值
    updateAiText(data.incentive_data.VoiceText);  // 更新AI分析文本
    updateTextContent('systolicLabel', bpUnit === 'mmHg' ? '(mmHg)' : '(kPa)');  // 更新收缩压单位
    updateTextContent('diastolicLabel', bpUnit === 'mmHg' ? '(mmHg)' : '(kPa)');  // 更新舒张压单位
    // 根据血压等级设置背景色
    const bpLevelElement = document.getElementById('bpLevel');
    if (bpLevelElement) {
        // 移除之前的等级类
        bpLevelElement.classList.remove('bp-level-1', 'bp-level-2', 'bp-level-3', 'bp-level-4');

        // 添加当前等级类
        const bpLevel = data.incentive_data.BpLevel;
        if (bpLevel >= 1 && bpLevel <= 4) {
            bpLevelElement.classList.add(`bp-level-${bpLevel}`);
        }
    }

    // 更新箭头图片
    var systolicArrowSrc = CONFIG.images.stableIcon
    const hight = data.blood_pressure_data.high_pressure - data.incentive_data.AvgHigh
    if (hight > 0) {
        systolicArrowSrc = CONFIG.images.systolicUpArrow
    } else if (hight < 0) {
        systolicArrowSrc = CONFIG.images.systolicDownArrow
    } 
    var diastolicArrowSrc = CONFIG.images.stableIcon
    const low = data.blood_pressure_data.low_pressure - data.incentive_data.AvgLow
    if (low > 0) {
        diastolicArrowSrc = CONFIG.images.systolicUpArrow
    } else if (low < 0) {
        diastolicArrowSrc = CONFIG.images.systolicDownArrow
    }
    // 根据差值设置颜色：高值红色，低值绿色
    const systolicColor = hight > 0 ? 'rgba(235, 70, 82, 1)' : (hight < 0 ? 'rgba(46, 209, 55, 1)' : '');
    const diastolicColor = low > 0 ? 'rgba(235, 70, 82, 1)' : (low < 0 ? 'rgba(46, 209, 55, 1)' : '');

    updateTextContentWithColor('systolicDiff', hight == 0 ? '' : Math.abs(bpUnit === 'mmHg' ? hight : mmhgToKpa(hight)), systolicColor);  // 更新收缩压差值和颜色
    updateTextContentWithColor('diastolicDiff', low == 0 ? '' : Math.abs(bpUnit === 'mmHg' ? low : mmhgToKpa(low)), diastolicColor);  // 更新舒张压差值和颜色
    updateImageSource('systolicArrow', systolicArrowSrc, "");
    updateImageSource('diastolicArrow', diastolicArrowSrc, "");
}
function formatDisplayTime(dateTimeStr, timeFormat) {
    const date = new Date(dateTimeStr);


    const datePart = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    const timeOptions = {
        hour12: timeFormat === '12',
        hour: 'numeric',
        minute: '2-digit'
    };

    const timePart = date.toLocaleString('en-US', timeOptions);

    return `${datePart} ${timePart}`;
}
function mmhgToKpa(mmhg) {
    const f = mmhg / 7.5;
    // 使用 toFixed(1) 实现四舍五入保留一位小数
    return parseFloat(f.toFixed(1));
}
// 创建主要内容HTML函数
function createMainContent(data) {
    console.log('创建主要内容，数据:', data);
    return `
        <!-- 血压 -->
        <div class="bp-reading">
            <div class="bp-value">
                <div class="value" id="systolicValue">${data.blood_pressure_data.high_pressure}</div>
                <div class="label" id="systolicLabel">${CONFIG.text.systolicLabel}</div>
            </div>
            <div class="divider"></div>
            <div class="bp-value">
                <div class="value" id="diastolicValue">${data.blood_pressure_data.low_pressure}</div>
                <div class="label" id="diastolicLabel">${CONFIG.text.diastolicLabel}</div>
            </div>
            <div class="divider"></div>
            <div class="bp-value">
                <div class="value" id="heartRateValue">${data.blood_pressure_data.heart_rate}</div>
                <div class="label" id="heartRateLabel">${CONFIG.text.heartRateLabel}</div>
            </div>
        </div>
        <div class="separator" id="bpLevel"></div>
        <!-- 7天提示 -->
        <div class="comparison-title" id="comparisonTitle">${CONFIG.text.comparisonTitle}</div>
        <div class="comparison-values">
            <div class="comparison-item">
                <div class="comparison-label" id="systolicComparisonLabel">${CONFIG.text.systolicComparisonLabel}</div>
                <img class="comparison-img" id="systolicArrow" src="${data.incentive_data.AvgHigh > 0 ? CONFIG.images.systolicUpArrow : (data.incentive_data.AvgHigh < 0 ? CONFIG.images.systolicDownArrow : CONFIG.images.stableIcon)}" alt="${data.incentive_data.AvgHigh > 0 ? 'Up arrow' : (data.incentive_data.AvgHigh < 0 ? 'Down arrow' : 'Stable')}">
                <div class="avg" id="systolicDiff">${Math.abs(data.incentive_data.AvgHigh)}</div>
            </div>
            <div class="divider-small"></div>
            <div class="comparison-item">
                <div class="comparison-label" id="diastolicComparisonLabel">${CONFIG.text.diastolicComparisonLabel}</div>
                <img class="comparison-img" id="diastolicArrow" src="${data.incentive_data.AvgLow > 0 ? CONFIG.images.diastolicUpArrow : (data.incentive_data.AvgLow < 0 ? CONFIG.images.diastolicDownArrow : CONFIG.images.stableIcon)}" alt="${data.incentive_data.AvgLow > 0 ? 'Up arrow' : (data.incentive_data.AvgLow < 0 ? 'Down arrow' : 'Stable')}">
                <div class="avg" id="diastolicDiff">${Math.abs(data.incentive_data.AvgLow)}</div>
            </div>
        </div>

        <!-- AI分析 -->
        <div class="ai-analysis">
            <div class="ai-text" id="aiAnalysisText">${data.incentive_data.VoiceText}</div>
            <img class="play-icon" id="playIcon" src="${CONFIG.images.playIcon}" alt="Play icon">
        </div>
        
        <!-- 反馈 -->
        <div class="feedback-buttons">
            <div class="feedback-button" id="likeButton">
                <img class="feedback-icon" id="likeIcon" src="${CONFIG.images.likeIcon}" alt="Like">
            </div>
            <div class="button-spacing"></div>
            <div class="feedback-button" id="dislikeButton">
                <img class="feedback-icon" id="dislikeIcon" src="${CONFIG.images.dislikeIcon}" alt="Dislike">
            </div>
        </div>
        
        <div id="feedbackContainer" style="display: none;margin-top: 20px;">
            <textarea class="feedback-textarea" id="feedbackTextarea" placeholder="${CONFIG.text.feedbackPlaceholder}"></textarea>
            <div class="reminder">
                    <label class="checkbox-container">
                        <input type="checkbox" class="checkbox" id="reminderCheckbox">
                        <span class="checkbox-custom"></span>
                    </label>
                    <label class="reminder-label" for="reminderCheckbox">${CONFIG.text.reminderText}</label>
                </div>
            <button class="feedback-btn" id="submitButton">
                ${CONFIG.text.submitButton}
            </button>
        </div>
         <!-- beta -->
        <div class="ai-label-container">
            <div class="ai-label" id="aiAnalysisLabel">${CONFIG.text.aiAnalysisLabel}</div>
            <div class="beta-badge" id="betaBadge">${CONFIG.text.betaBadge}</div>
        </div> 
    `;
}

// 创建加载中内容函数
function createLoadingContent() {
    return `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> ${CONFIG.text.loadingText}
        </div>
    `;
}

// 创建成功提示内容函数（Toast样式）
function createSuccessContent(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `
        <div class="toast-message">${message}</div>
    `;
    return toast;
}

// 创建错误提示内容函数（Toast样式）
function createErrorContent(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `
        <div class="toast-message">${message}</div>
    `;
    return toast;
}

// 显示Toast提示并自动隐藏
function showToast(toastElement, duration = 1000) {
    // 清除之前的toast
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    // 添加到页面
    document.body.appendChild(toastElement);

    // 自动隐藏
    setTimeout(() => {
        toastElement.classList.add('fade-out');
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 100);
    }, duration);
}

// 事件处理函数
function handleLikeButton() {
    console.log('处理点赞按钮点击');
    const likeButton = document.getElementById('likeButton');
    const dislikeButton = document.getElementById('dislikeButton');
    const likeIcon = document.getElementById('likeIcon');
    const dislikeIcon = document.getElementById('dislikeIcon');

    likeButton.classList.toggle('active');  // 切换激活状态
    dislikeButton.classList.remove('active');  // 移除点踩激活状态

    // 根据激活状态更新图标
    if (likeButton.classList.contains('active')) {
        likeIcon.src = CONFIG.images.likeIconActive;  // 使用激活图标
        setIncentiveFeedback(1)
        hideFeedbackContainer();  // 隐藏反馈区域
    } else {
        likeIcon.src = CONFIG.images.likeIcon;  // 使用默认图标
        setIncentiveFeedback(0)
    }

    dislikeIcon.src = CONFIG.images.dislikeIcon;  // 使用默认图标
}

function handleDislikeButton() {
    const likeButton = document.getElementById('likeButton');
    const dislikeButton = document.getElementById('dislikeButton');
    const dislikeIcon = document.getElementById('dislikeIcon');
    const likeIcon = document.getElementById('likeIcon');

    dislikeButton.classList.toggle('active');  // 切换激活状态
    likeButton.classList.remove('active');  // 移除点赞激活状态

    // 根据激活状态更新图标
    if (dislikeButton.classList.contains('active')) {
        dislikeIcon.src = CONFIG.images.dislikeIconActive;  // 使用激活图标
        setIncentiveFeedback(2)
        showFeedbackContainer();  // 显示反馈区域
    } else {
        dislikeIcon.src = CONFIG.images.dislikeIcon;  // 使用默认图标
        setIncentiveFeedback(0)
        hideFeedbackContainer();  // 隐藏反馈区域
    }
    likeIcon.src = CONFIG.images.likeIcon;  // 使用默认图标
}

let currentAudio = null;
let playAnimationInterval = null;
let currentPlayIconIndex = 0;
const playIcons = ['./icon_play.png', './icon_play1.png', './icon_play2.png'];
const stopIcon = './icon_stop.png';
let vvHandler = null;
let vvListenersAttached = false;
async function getSystemVolume() {
    try {
        if (window.ihealthBridge && typeof window.ihealthBridge.getSystemVolume === 'function') {
            const v = await window.ihealthBridge.getSystemVolume();
            return typeof v === 'number' ? v : null;
        }
        if (window.Android && typeof window.Android.getSystemVolume === 'function') {
            const v = window.Android.getSystemVolume();
            return typeof v === 'number' ? v : null;
        }
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.getSystemVolume && typeof window.webkit.messageHandlers.getSystemVolume.postMessage === 'function') {
            return await new Promise((resolve) => {
                const cb = '__onSystemVolume';
                window[cb] = (v) => {
                    resolve(typeof v === 'number' ? v : null);
                    try { delete window[cb]; } catch (_) {}
                };
                window.webkit.messageHandlers.getSystemVolume.postMessage({ callback: cb });
                setTimeout(() => resolve(null), 800);
            });
        }
        return null;
    } catch (_) {
        return null;
    }
}

async function handlePlay(VoiceUrl) {
    console.log(VoiceUrl)
    // 如果已经在播放，点击则停止
    if (currentAudio && !currentAudio.paused) {
        stopPlayback();
        return;
    }

    // // 如果已经有音频对象但处于暂停状态，恢复播放
    // if (currentAudio && currentAudio.paused) {
    //     resumePlayback();
    //     return;
    // }

    // const systemVol = await getSystemVolume();
    // if (systemVol !== null && systemVol <= 0) {
    //     const toast = createErrorContent('Turn on phone sound for voice broadcasts.');
    //     showToast(toast);
    //     return;
    // }
    // if (isMuted()) {
    //     const toast = createErrorContent('Turn on phone sound for voice broadcasts.');
    //     showToast(toast);
    //     return;
    // }
    try {
        currentAudio = new Audio(VoiceUrl);
        startPlayAnimation();
        currentAudio.play().then(() => {
            console.log('音频开始播放');
            onPlayStart();
        }).catch(error => {
            console.error('播放失败:', error);
            stopPlayAnimation();
            resetPlayIcon();
            currentAudio = null;
            const toast = createErrorContent(CONFIG.text.errorNetwork);
            showToast(toast);
        });
          currentAudio.addEventListener('ended', () => {
            console.log('音频播放结束');
            stopPlayAnimation();
            resetPlayIcon();
            onPlayEnd();
            currentAudio = null;
        });

        currentAudio.addEventListener('error', (e) => {
            console.error('音频播放错误:', e);
            stopPlayAnimation();
            resetPlayIcon();
            currentAudio = null;
            const toast = createErrorContent(CONFIG.text.errorNetwork);
            showToast(toast);
        });
        return currentAudio;
    } catch (error) {
        console.error('播放异常:', error);
        stopPlayAnimation();
        resetPlayIcon();
        currentAudio = null;
        const toast = createErrorContent(CONFIG.text.errorNetwork);
        showToast(toast);
        return null;
    }
}

// 开始播放动画
function startPlayAnimation() {
    const playButton = document.getElementById('playIcon');
    if (!playButton) return;

    stopPlayAnimation(); // 先清除之前的动画

    currentPlayIconIndex = 0;
    playAnimationInterval = setInterval(() => {
        currentPlayIconIndex = (currentPlayIconIndex + 1) % playIcons.length;
        playButton.src = playIcons[currentPlayIconIndex];
    }, 500); // 每500毫秒切换一次图标
}

// 停止播放动画
function stopPlayAnimation() {
    if (playAnimationInterval) {
        clearInterval(playAnimationInterval);
        playAnimationInterval = null;
    }
}

// 重置播放图标
function resetPlayIcon() {
    const playButton = document.getElementById('playIcon');
    if (playButton) {
        playButton.src = playIcons[0]; // 重置为第一个播放图标
    }
}

// 停止播放函数
function stopPlayback() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        console.log('音频已停止');
        stopPlayAnimation();
        currentAudio = null;
        const playButton = document.getElementById('playIcon');
        if (playButton) {
            playButton.src = stopIcon;
        }
    }
}

// 暂停播放函数
// function pausePlayback() {
//     if (currentAudio && !currentAudio.paused) {
//         currentAudio.pause();
//         console.log('音频已暂停');
//         stopPlayAnimation();
//         // 暂停时显示停止图标
//         const playButton = document.getElementById('playIcon');
//         if (playButton) {
//             playButton.src = stopIcon;
//         }
//     }
// }

// 继续播放函数
function resumePlayback() {
    if (currentAudio && currentAudio.paused) {
        currentAudio.play();
        console.log('音频继续播放');
        startPlayAnimation();
    }
}

// 播放开始回调
function onPlayStart() {
    console.log('播放开始，可以更新UI状态');
    // 比如：显示播放中状态、禁用播放按钮等
}

// 播放结束回调
function onPlayEnd() {
    console.log('播放结束，可以更新UI状态');
    // 比如：显示播放完成状态、启用播放按钮等
}

// 处理播放按钮点击事件
function handlePlayButtonClick(data) {
    return function () {
        const playButton = document.getElementById('playIcon');
        if (!playButton) return;

        // 如果正在播放，点击则停止
        if (currentAudio && !currentAudio.paused) {
            stopPlayback();
        } else {
            handlePlay(data.incentive_data.VoiceUrl);
        }
    };
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (currentAudio) {
        stopPlayback();
    }
    if (playAnimationInterval) {
        clearInterval(playAnimationInterval);
    }
});

// 显示反馈区域函数
function showFeedbackContainer() {
    const feedbackContainer = document.getElementById('feedbackContainer');
    console.log('显示反馈区域，容器元素:', feedbackContainer);
    if (feedbackContainer) {
        feedbackContainer.classList.add('show');
        feedbackContainer.style.display = 'block';
        console.log('反馈区域已显示');
    } else {
        console.error('未找到反馈容器元素');
    }
}

// 隐藏反馈区域函数
function hideFeedbackContainer() {
    const feedbackContainer = document.getElementById('feedbackContainer');
    const feedbackTextarea = document.getElementById('feedbackTextarea');
    if (feedbackContainer) {
        feedbackContainer.classList.remove('show');
        feedbackContainer.style.display = 'none';
    }
    // 清空反馈内容
    if (feedbackTextarea) {
        feedbackTextarea.value = '';
    }
}

// 异步处理提交按钮点击
async function handleSubmitButton() {
    const submitButton = document.getElementById('submitButton');
    const feedbackTextarea = document.getElementById('feedbackTextarea');
    const reminderCheckbox = document.getElementById('reminderCheckbox');

    const feedback = feedbackTextarea.value.trim();  // 获取反馈内容并去除首尾空格
    const dontRemind = reminderCheckbox.checked;  // 获取是否7天内不再提醒

    if (!feedback) {
        const errorToast = createErrorContent(CONFIG.text.alertNoFeedback);  // 创建无反馈内容提示
        showToast(errorToast);  // 显示错误toast
        return;
    }

    // 更新按钮状态为提交中
    submitButton.disabled = true;
    submitButton.textContent = CONFIG.text.submittingText;
    setIncentiveFeedback(2, feedback, dontRemind)

}
function handleReminderChange() {
    const reminderCheckbox = document.getElementById('reminderCheckbox');

    if (reminderCheckbox.checked) {
        setIncentiveFeedback(null, null, true)
    } else {
        setIncentiveFeedback(null, null, false)
    }
}
// 绑定事件函数
function bindEvents(data) {
    const playButton = document.getElementById('playIcon');
    const likeButton = document.getElementById('likeButton');
    const dislikeButton = document.getElementById('dislikeButton');
    const submitButton = document.getElementById('submitButton');
    const feedbackContainer = document.getElementById('feedbackContainer');
    const reminderCheckbox = document.getElementById('reminderCheckbox');

    console.log('绑定事件:', {
        likeButton: likeButton,
        dislikeButton: dislikeButton,
        submitButton: submitButton,
        feedbackContainer: feedbackContainer,
        reminderCheckbox: reminderCheckbox
    });

    // 绑定播放按钮事件
    if (playButton) {
        playButton.addEventListener('click', handlePlayButtonClick(data));
        console.log('播放按钮事件已绑定');
    } else {
        console.error('播放按钮未找到');
    }

    if (likeButton) {
        likeButton.addEventListener('click', handleLikeButton);
        console.log('点赞按钮事件已绑定');
    } else {
        console.error('点赞按钮未找到');
    }

    if (dislikeButton) {
        dislikeButton.addEventListener('click', handleDislikeButton);
        console.log('点踩按钮事件已绑定');
    } else {
        console.error('点踩按钮未找到');
    }

    if (submitButton) {
        submitButton.addEventListener('click', handleSubmitButton);
        console.log('提交按钮事件已绑定');
    } else {
        console.error('提交按钮未找到');
    }

    if (reminderCheckbox) {
        reminderCheckbox.addEventListener('change', handleReminderChange);
        console.log('提醒复选框事件已绑定');
    } else {
        console.error('提醒复选框未找到');
    }
}

// 主初始化函数
async function initPage() {
    console.log('初始化页面开始');
    const { token, phoneDataId, un, baseUrl, timeFormat, bpUnit } = getUrlParams();
    const mainContent = document.querySelector('.main-content');
    const normalizedBaseUrl = baseUrl ? (baseUrl.endsWith('/') ? baseUrl : baseUrl + '/') : '';
    moduleUrlParams = { token, phoneDataId, un, baseUrl: normalizedBaseUrl, timeFormat, bpUnit };
    if (!token || !phoneDataId) {
        const errorEl = createErrorContent(CONFIG.text.errorMissingParams);
        if (mainContent) {
            mainContent.innerHTML = '';
            mainContent.appendChild(errorEl);
        }
        return;
    }
    getIncentiveInfo()
}
// 获取激励信息函数
async function getIncentiveInfo() {
    const { baseUrl, token, phoneDataId, un } = moduleUrlParams;
    const mainContent = document.querySelector('.main-content');  // 获取主要内容容器
    mainContent.innerHTML = createLoadingContent();
    try {
        // const data = JSON.parse(dataText);
        fetch(baseUrl + "api/common/data/incentive/getIncentiveInfo", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'ihealthapi ' + token,
                'Un': un
            },
            body: JSON.stringify({
                phone_data_id: phoneDataId,
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应不正常');
                }
                return response.json();
            })
            .then(data => {
                console.log(11, data.ReturnValue.blood_pressure_data.high_pressure)
                mainContent.innerHTML = createMainContent(data.ReturnValue);  // 创建主要内容
                updatePageData(data.ReturnValue);  // 更新页面数据
                bindEvents(data.ReturnValue);  // 绑定事件
                handlePlay(data.ReturnValue.incentive_data.VoiceUrl);
            })
            .catch(error => {
                console.error('获取激励信息失败:', error);
                const errorEl = createErrorContent(CONFIG.text.errorLoadFailed);
                mainContent.innerHTML = '';
                mainContent.appendChild(errorEl);
            });
    } catch (error) {
        console.error('获取激励信息失败:', error);
        const errorEl = createErrorContent(CONFIG.text.errorLoadFailed);
        mainContent.innerHTML = '';
        mainContent.appendChild(errorEl);
    }
}
async function setIncentiveFeedback(commentType, commentContent, isDisableReminder) {
    const { baseUrl, token, phoneDataId, un } = moduleUrlParams;
    try {
        // const data = JSON.parse(dataText);
        fetch(baseUrl + "api/common/data/incentive/setIncentiveFeedback", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'ihealthapi ' + token,
                'Un': un
            },
            body: JSON.stringify({
                phone_data_id: phoneDataId,
                comment_type: commentType,
                comment_content: commentContent,
                disable_reminder: isDisableReminder,
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应不正常');
                }
                return response.json();
            })
            .then(data => {
                if (data.ResultMessage == "100") {
                    const successToast = createSuccessContent("success");  // 创建成功提示
                    if (commentType === 2 && commentContent && commentContent.trim().length > 0) {
                        // 重置表单
                        feedbackTextarea.value = '';
                        // 隐藏反馈区域
                        hideFeedbackContainer();
                    }
                    showToast(successToast);  // 显示成功toast
                } else {
                    const errorToast = createErrorContent(data.ResultMessage);  // 创建错误提示
                    showToast(errorToast);  // 显示错误toast
                }
                submitButton.disabled = false;
                submitButton.textContent = CONFIG.text.submitButton;
            })
            .catch(error => {
                console.error('设置激励信息失败:', error);
                const errorToast = createErrorContent(error.message);
                showToast(errorToast);
            });
    } catch (error) {
        console.error('设置激励信息失败:', error);
        const errorToast = createErrorContent(error.message);
        showToast(errorToast);
    }
}
// 更新页面标题
document.title = CONFIG.text.title;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);

// 导出函数供全局访问（如需要）
window.BloodPressureApp = {
    CONFIG,  // 配置对象
    updatePageData,  // 更新页面数据函数
    initPage,  // 初始化页面函数
    getUrlParams  // 获取URL参数函数
};
function isMuted() {
    try {
        const el = currentAudio || new Audio();
        return el.muted === true || el.volume === 0;
    } catch (e) {
        return false;
    }
}
