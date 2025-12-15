// 全局变量
let videoFile = null;
let videoElement = null;
let extractedFrames = [];
let selectedFrames = [];
let currentPreviewIndex = 0;
let isPlaying = false;
let playInterval = null;
let playbackSpeed = 1;
let extractedFrameRate = 1; // 提取时的帧率

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const videoInput = document.getElementById('videoInput');
const videoPlayerContainer = document.getElementById('videoPlayerContainer');
const uploadedVideoPlayer = document.getElementById('uploadedVideoPlayer');
const replaceVideoBtn = document.getElementById('replaceVideoBtn');
const videoInfo = document.getElementById('videoInfo');
const controlSection = document.getElementById('controlSection');
const framesSection = document.getElementById('framesSection');
const previewSection = document.getElementById('previewSection');
const framesGrid = document.getElementById('framesGrid');
const extractBtn = document.getElementById('extractBtn');
const frameRateInput = document.getElementById('frameRate');
const selectAllBtn = document.getElementById('selectAllBtn');
const deselectAllBtn = document.getElementById('deselectAllBtn');
const previewImage = document.getElementById('previewImage');
const previewSlider = document.getElementById('previewSlider');
const previewFrameNumber = document.getElementById('previewFrameNumber');
const firstFrameBtn = document.getElementById('firstFrameBtn');
const prevFrameBtn = document.getElementById('prevFrameBtn');
const nextFrameBtn = document.getElementById('nextFrameBtn');
const lastFrameBtn = document.getElementById('lastFrameBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const loopCheckbox = document.getElementById('loopCheckbox');
const playbackSpeedSelect = document.getElementById('playbackSpeed');
const cutoutSection = document.getElementById('cutoutSection');
const removeWatermarkCheckbox = document.getElementById('removeWatermarkCheckbox');
const watermarkRatioControl = document.getElementById('watermarkRatioControl');
const watermarkRatioInput = document.getElementById('watermarkRatio');
const removeBackgroundCheckbox = document.getElementById('removeBackgroundCheckbox');
const backgroundColorInfo = document.getElementById('backgroundColorInfo');
const bgColorPreview = document.getElementById('bgColorPreview');
const bgColorCode = document.getElementById('bgColorCode');
const outputResolutionCheckbox = document.getElementById('outputResolutionCheckbox');
const outputResolutionControl = document.getElementById('outputResolutionControl');
const presetResolution = document.getElementById('presetResolution');
const presetResolutionDisplay = document.getElementById('presetResolutionDisplay');
const presetHeightValue = document.getElementById('presetHeightValue');
const customResolutionInputs = document.getElementById('customResolutionInputs');
const outputWidth = document.getElementById('outputWidth');
const outputHeight = document.getElementById('outputHeight');
const outputResolutionInfo = document.getElementById('outputResolutionInfo');
const originalResolution = document.getElementById('originalResolution');
const processedResolution = document.getElementById('processedResolution');
const processCutoutBtn = document.getElementById('processCutoutBtn');
const downloadCutoutBtn = document.getElementById('downloadCutoutBtn');
const cutoutPreview = document.getElementById('cutoutPreview');
const cutoutPreviewGrid = document.getElementById('cutoutPreviewGrid');
const spritesheetSection = document.getElementById('spritesheetSection');
const generateSpritesheetBtn = document.getElementById('generateSpritesheetBtn');
const downloadSpritesheetBtn = document.getElementById('downloadSpritesheetBtn');
const spritesheetPreview = document.getElementById('spritesheetPreview');
const spritesheetPreviewImage = document.getElementById('spritesheetPreviewImage');
const spritesheetInfo = document.getElementById('spritesheetInfo');
const todayCount = document.getElementById('todayCount');
const totalCount = document.getElementById('totalCount');
const progressIndicator = document.getElementById('progressIndicator');

// 流程进度指示器
const progressSteps = ['upload', 'extract', 'select', 'process', 'spritesheet'];
let currentStep = 0;

function updateProgress(stepIndex) {
    if (stepIndex < 0 || stepIndex >= progressSteps.length) return;
    
    currentStep = stepIndex;
    
    // 更新所有步骤的状态
    progressSteps.forEach((step, index) => {
        const stepElement = progressIndicator.querySelector(`[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.remove('active', 'completed');
            if (index < stepIndex) {
                stepElement.classList.add('completed');
            } else if (index === stepIndex) {
                stepElement.classList.add('active');
            }
        }
    });
    
    // 进度条现在通过CSS的::after伪元素自动连接，不需要手动更新
}

// 初始化进度指示器
function initProgressIndicator() {
    updateProgress(0);
}

// 使用统计功能
function getTodayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getUsageStats() {
    const stats = localStorage.getItem('usageStats');
    if (stats) {
        return JSON.parse(stats);
    }
    return {
        total: 0,
        lastDate: '',
        today: 0
    };
}

function saveUsageStats(stats) {
    localStorage.setItem('usageStats', JSON.stringify(stats));
}

function updateUsageStats() {
    const stats = getUsageStats();
    const today = getTodayDate();
    
    // 如果是新的一天，重置今日计数
    if (stats.lastDate !== today) {
        stats.today = 0;
        stats.lastDate = today;
    }
    
    // 增加计数
    stats.today++;
    stats.total++;
    
    saveUsageStats(stats);
    displayUsageStats();
}

function displayUsageStats() {
    const stats = getUsageStats();
    const today = getTodayDate();
    
    // 如果是新的一天，重置今日计数显示
    if (stats.lastDate !== today) {
        stats.today = 0;
    }
    
    todayCount.textContent = stats.today || 0;
    totalCount.textContent = stats.total || 0;
}

// 初始化时显示统计
displayUsageStats();

// 初始化进度指示器
initProgressIndicator();

// 初始化事件监听
initEventListeners();

function initEventListeners() {
    // 上传区域点击
    uploadArea.addEventListener('click', () => videoInput.click());
    replaceVideoBtn.addEventListener('click', () => {
        // 允许重复选择同一文件
        videoInput.value = '';
        videoInput.click();
    });
    
    // 文件选择
    videoInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // 提取帧按钮
    extractBtn.addEventListener('click', extractFrames);
    
    // 全选/取消全选
    selectAllBtn.addEventListener('click', selectAllFrames);
    deselectAllBtn.addEventListener('click', deselectAllFrames);
    
    // 预览控制
    previewSlider.addEventListener('input', handleSliderChange);
    firstFrameBtn.addEventListener('click', () => goToFrame(0));
    prevFrameBtn.addEventListener('click', goToPreviousFrame);
    nextFrameBtn.addEventListener('click', goToNextFrame);
    lastFrameBtn.addEventListener('click', goToLastFrame);
    playPauseBtn.addEventListener('click', togglePlayPause);
    loopCheckbox.addEventListener('change', handleLoopChange);
    playbackSpeedSelect.addEventListener('change', handleSpeedChange);
    
    // 抠图功能
    processCutoutBtn.addEventListener('click', processCutout);
    downloadCutoutBtn.addEventListener('click', downloadCutoutFrames);
    removeWatermarkCheckbox.addEventListener('change', () => {
        watermarkRatioControl.style.display = removeWatermarkCheckbox.checked ? 'flex' : 'none';
    });
    removeBackgroundCheckbox.addEventListener('change', () => {
        if (!removeBackgroundCheckbox.checked) {
            backgroundColorInfo.style.display = 'none';
        }
    });
    
    
    // 更新分辨率显示（原始和处理后）
    window.updateResolutionDisplay = function() {
        if (!outputResolutionInfo || !originalResolution || !processedResolution) return;
        
        // 如果没有选中的帧，隐藏分辨率信息
        if (extractedFrames.length === 0 || selectedFrames.length === 0) {
            outputResolutionInfo.style.display = 'none';
            return;
        }
        
        const firstFrame = extractedFrames[selectedFrames[0]];
        if (!firstFrame) {
            outputResolutionInfo.style.display = 'none';
            return;
        }
        
        const img = new Image();
        img.onload = () => {
            const originalWidth = img.width;
            const originalHeight = img.height;
            const aspectRatio = originalWidth / originalHeight;
            
            // 显示原始分辨率
            originalResolution.textContent = `${originalWidth} × ${originalHeight}`;
            
            // 计算并显示处理后的分辨率
            let processedWidth = originalWidth;
            let processedHeight = originalHeight;
            
            if (outputResolutionCheckbox && outputResolutionCheckbox.checked) {
                if (presetResolution.value === 'custom') {
                    // 自定义分辨率
                    const customWidth = parseInt(outputWidth.value);
                    const customHeight = parseInt(outputHeight.value);
                    if (customWidth && customHeight) {
                        processedWidth = customWidth;
                        processedHeight = customHeight;
                    }
                } else {
                    // 预设分辨率
                    const presetWidth = parseInt(presetResolution.value);
                    if (presetWidth) {
                        processedWidth = presetWidth;
                        processedHeight = Math.round(presetWidth / aspectRatio);
                    }
                }
            }
            
            processedResolution.textContent = `${processedWidth} × ${processedHeight}`;
            outputResolutionInfo.style.display = 'flex';
        };
        img.src = firstFrame.image;
    };
    
    // 更新预设分辨率显示的高度值
    window.updatePresetResolutionDisplay = function() {
        if (!presetResolution || !presetResolutionDisplay || !presetHeightValue) return;
        
        if (presetResolution.value === 'custom') {
            presetResolutionDisplay.style.display = 'none';
            if (customResolutionInputs) customResolutionInputs.style.display = 'flex';
        } else {
            presetResolutionDisplay.style.display = 'flex';
            if (customResolutionInputs) customResolutionInputs.style.display = 'none';
            
            // 根据第一帧计算对应的高度
            if (extractedFrames.length > 0 && selectedFrames.length > 0) {
                const firstFrame = extractedFrames[selectedFrames[0]];
                if (firstFrame) {
                    const img = new Image();
                    img.onload = () => {
                        const aspectRatio = img.width / img.height;
                        const presetWidth = parseInt(presetResolution.value);
                        const calculatedHeight = Math.round(presetWidth / aspectRatio);
                        presetHeightValue.textContent = calculatedHeight;
                    };
                    img.src = firstFrame.image;
                }
            } else {
                presetHeightValue.textContent = '--';
            }
        }
        
        // 同时更新分辨率显示
        if (window.updateResolutionDisplay) {
            window.updateResolutionDisplay();
        }
    };
    
    // 预设分辨率变化
    presetResolution.addEventListener('change', () => {
        window.updatePresetResolutionDisplay();
        window.updateResolutionDisplay();
    });
    
    // 输出分辨率复选框变化
    outputResolutionCheckbox.addEventListener('change', () => {
        outputResolutionControl.style.display = outputResolutionCheckbox.checked ? 'flex' : 'none';
        window.updateResolutionDisplay();
    });
    
    // 当选中帧变化时，更新预设分辨率显示和分辨率显示
    const originalUpdatePreview = updatePreview;
    updatePreview = function() {
        originalUpdatePreview();
        if (outputResolutionCheckbox.checked && window.updatePresetResolutionDisplay) {
            window.updatePresetResolutionDisplay();
        }
        if (window.updateResolutionDisplay) {
            window.updateResolutionDisplay();
        }
    };
    
    // 宽度变化时，自动调整高度（基于第一帧的比例）
    outputWidth.addEventListener('input', () => {
        if (extractedFrames.length > 0 && selectedFrames.length > 0) {
            const firstFrame = extractedFrames[selectedFrames[0]];
            if (firstFrame) {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    if (outputWidth.value) {
                        outputHeight.value = Math.round(outputWidth.value / aspectRatio);
                    }
                };
                img.src = firstFrame.image;
            }
        }
    });
    
    // 高度变化时，自动调整宽度（基于第一帧的比例）
    outputHeight.addEventListener('input', () => {
        if (extractedFrames.length > 0 && selectedFrames.length > 0) {
            const firstFrame = extractedFrames[selectedFrames[0]];
            if (firstFrame) {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    if (outputHeight.value) {
                        outputWidth.value = Math.round(outputHeight.value * aspectRatio);
                    }
                };
                img.src = firstFrame.image;
            }
        }
    });
    
    // Spritesheet功能
    generateSpritesheetBtn.addEventListener('click', generateSpritesheet);
    downloadSpritesheetBtn.addEventListener('click', downloadSpritesheet);
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
        loadVideo(file);
    } else {
        alert('请选择有效的视频文件');
    }
}

// 处理拖拽
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
        loadVideo(file);
    } else {
        alert('请选择有效的视频文件');
    }
}

// 加载视频
function loadVideo(file) {
    videoFile = file;
    const url = URL.createObjectURL(file);
    
    // 切换到视频播放器视图
    if (uploadArea) uploadArea.style.display = 'none';
    if (videoPlayerContainer) videoPlayerContainer.style.display = 'block';
    
    // 使用页面中的播放器元素
    if (uploadedVideoPlayer) {
        // 清理旧的 object URL
        if (uploadedVideoPlayer.dataset.objectUrl) {
            URL.revokeObjectURL(uploadedVideoPlayer.dataset.objectUrl);
        }
        uploadedVideoPlayer.dataset.objectUrl = url;
        uploadedVideoPlayer.src = url;
        uploadedVideoPlayer.load();
        videoElement = uploadedVideoPlayer;
    } else {
        videoElement = document.createElement('video');
        videoElement.src = url;
    }
    
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = () => {
        displayVideoInfo(file, videoElement);
        controlSection.style.display = 'block';
        extractedFrames = [];
        selectedFrames = [];
        framesGrid.innerHTML = '';
        framesSection.style.display = 'none';
        previewSection.style.display = 'none';
        // 更新进度：上传视频完成
        updateProgress(0);
    };
}

// 显示视频信息
function displayVideoInfo(file, video) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('videoDuration').textContent = formatDuration(video.duration);
    document.getElementById('videoResolution').textContent = `${video.videoWidth} × ${video.videoHeight}`;
    videoInfo.style.display = 'flex';
}

// 格式化时长
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 提取帧
async function extractFrames() {
    if (!videoElement || !videoFile) {
        alert('请先上传视频');
        return;
    }
    
    const frameRate = parseFloat(frameRateInput.value);
    if (isNaN(frameRate) || frameRate <= 0) {
        alert('请输入有效的帧率');
        return;
    }
    
    extractBtn.disabled = true;
    extractBtn.textContent = '提取中...';
    framesGrid.innerHTML = '';
    framesSection.style.display = 'block';
    
    // 初始化
    extractedFrames = [];
    selectedFrames = [];
    currentPreviewIndex = 0;

    // 性能日志：跟踪每帧的耗时
    const perfStart = performance.now();
    const perfStats = {
        totalFrames: 0,
        totalDraw: 0,
        totalDom: 0,
        logEvery: 10
    };
    
    try {
        const interval = 1 / frameRate; // 每帧之间的时间间隔（秒）
        const duration = videoElement.duration;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // 创建缩略图canvas（最大宽度200px）
        const thumbnailCanvas = document.createElement('canvas');
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        const thumbnailMaxWidth = 200;
        const scale = Math.min(thumbnailMaxWidth / canvas.width, thumbnailMaxWidth / canvas.height);
        thumbnailCanvas.width = canvas.width * scale;
        thumbnailCanvas.height = canvas.height * scale;
        
        // 计算总帧数
        const totalFrames = Math.ceil(duration * frameRate);
        let currentFrameIndex = 0;
        let nextCaptureTime = 0;
        let stopped = false;
        
        // 播放设置
        videoElement.pause();
        videoElement.muted = true;
        videoElement.currentTime = 0;
        videoElement.playbackRate = 1;
        
        const captureFrame = (captureTime) => {
            const drawStart = performance.now();
            // 绘制完整分辨率图片
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/png');
            
            // 绘制缩略图
            thumbnailCtx.drawImage(videoElement, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
            const thumbnailData = thumbnailCanvas.toDataURL('image/jpeg', 0.85); // 使用JPEG格式和较低质量以减小文件大小
            const drawTime = performance.now() - drawStart;
            
            const frameIndex = extractedFrames.length;
            const frame = {
                time: captureTime,
                image: imageData, // 完整分辨率，用于预览
                thumbnail: thumbnailData, // 缩略图，用于网格显示
                index: frameIndex
            };
            extractedFrames.push(frame);
            selectedFrames.push(frameIndex); // 默认选中
            
            // 立即显示这一帧
            const domStart = performance.now();
            addFrameToGrid(frame, frameIndex);
            const domTime = performance.now() - domStart;
            
            // 记录性能数据
            perfStats.totalFrames += 1;
            perfStats.totalDraw += drawTime;
            perfStats.totalDom += domTime;
            
            // 分段日志，避免控制台刷屏
            if (perfStats.totalFrames % perfStats.logEvery === 0) {
                const avgDraw = (perfStats.totalDraw / perfStats.totalFrames).toFixed(2);
                const avgDom = (perfStats.totalDom / perfStats.totalFrames).toFixed(2);
                console.log(
                    `[Extract] ${perfStats.totalFrames}/${totalFrames} frames | ` +
                    `avg draw ${avgDraw}ms | avg dom ${avgDom}ms | ` +
                    `elapsed ${(performance.now() - perfStart).toFixed(0)}ms`
                );
            }
            
            // 更新进度
            currentFrameIndex++;
            const progress = Math.min(100, Math.round((currentFrameIndex / totalFrames) * 100));
            extractBtn.textContent = `提取中... ${progress}%`;
        };
        
        const useVideoFrameCb = typeof videoElement.requestVideoFrameCallback === 'function';
        
        await videoElement.play().catch((err) => {
            console.error('视频播放失败:', err);
            throw err;
        });
        
        await new Promise((resolve, reject) => {
            const cleanUp = () => {
                stopped = true;
                videoElement.pause();
                videoElement.onended = null;
            };
            
            const finish = () => {
                cleanUp();
                resolve();
            };
            
            const tick = (mediaTime) => {
                if (stopped) return;
                const currentTime = mediaTime !== undefined ? mediaTime : videoElement.currentTime;
                
                if (currentTime + 1e-3 >= nextCaptureTime && currentFrameIndex < totalFrames) {
                    captureFrame(currentTime);
                    nextCaptureTime += interval;
                }
                
                if (currentFrameIndex >= totalFrames || currentTime >= duration || videoElement.ended) {
                    finish();
                    return;
                }
                
                if (useVideoFrameCb) {
                    videoElement.requestVideoFrameCallback((_, metadata) => tick(metadata.mediaTime));
                } else {
                    requestAnimationFrame(() => tick());
                }
            };
            
            videoElement.onended = finish;
            
            if (useVideoFrameCb) {
                videoElement.requestVideoFrameCallback((_, metadata) => tick(metadata.mediaTime));
            } else {
                requestAnimationFrame(() => tick());
            }
        });
        
        // 最终性能总结
        if (perfStats.totalFrames > 0) {
            const avgDraw = (perfStats.totalDraw / perfStats.totalFrames).toFixed(2);
            const avgDom = (perfStats.totalDom / perfStats.totalFrames).toFixed(2);
            console.log(
                `[Extract][Summary] frames=${perfStats.totalFrames}, ` +
                `avg draw ${avgDraw}ms, avg dom ${avgDom}ms, ` +
                `total ${(performance.now() - perfStart).toFixed(0)}ms`
            );
        }

        extractedFrameRate = frameRate; // 保存提取时的帧率
        updatePreview();
        
        // 更新进度：提取帧完成
        updateProgress(1);
        
        // 更新使用统计
        updateUsageStats();
        
    } catch (error) {
        console.error('提取帧时出错:', error);
        alert('提取帧时出错，请重试');
    } finally {
        extractBtn.disabled = false;
        extractBtn.textContent = '提取帧';
    }
}

// 添加单个帧到网格
function addFrameToGrid(frame, index) {
    const frameItem = document.createElement('div');
    frameItem.className = 'frame-item';
    if (selectedFrames.includes(index)) {
        frameItem.classList.add('selected');
    }
    
    frameItem.innerHTML = `
        <div class="frame-checkbox-wrapper">
            <input type="checkbox" class="frame-checkbox" data-index="${index}" 
                   ${selectedFrames.includes(index) ? 'checked' : ''}>
        </div>
        <img src="${frame.thumbnail}" alt="帧 ${index + 1}" class="frame-thumbnail">
        <div class="frame-label">帧 ${index + 1}</div>
    `;
    
    // 点击缩略图切换选择
    const checkbox = frameItem.querySelector('.frame-checkbox');
    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        toggleFrameSelection(index);
    });
    
    frameItem.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            toggleFrameSelection(index);
        }
    });
    
    framesGrid.appendChild(frameItem);
}

// 渲染帧缩略图
function renderFrames() {
    framesGrid.innerHTML = '';
    
    extractedFrames.forEach((frame, index) => {
        addFrameToGrid(frame, index);
    });
    
    framesSection.style.display = 'block';
    updatePreview();
}

// 切换帧选择
function toggleFrameSelection(index) {
    const frameIndex = selectedFrames.indexOf(index);
    if (frameIndex > -1) {
        selectedFrames.splice(frameIndex, 1);
    } else {
        selectedFrames.push(index);
        selectedFrames.sort((a, b) => a - b);
    }
    
    // 更新UI
    const frameItem = framesGrid.children[index];
    if (selectedFrames.includes(index)) {
        frameItem.classList.add('selected');
    } else {
        frameItem.classList.remove('selected');
    }
    
    updatePreview();
}

// 全选帧
function selectAllFrames() {
    selectedFrames = extractedFrames.map((_, index) => index);
    renderFrames();
}

// 取消全选帧
function deselectAllFrames() {
    selectedFrames = [];
    renderFrames();
}

// 更新预览
function updatePreview() {
    if (selectedFrames.length === 0) {
        previewSection.style.display = 'none';
        cutoutSection.style.display = 'none';
        spritesheetSection.style.display = 'none';
        stopPlayback();
        return;
    }
    
    previewSection.style.display = 'block';
    cutoutSection.style.display = 'block';
    // Spritesheet模块只在抠图处理完成后显示
    if (processedFrames.length > 0) {
        spritesheetSection.style.display = 'block';
    } else {
        spritesheetSection.style.display = 'none';
    }
    
    // 更新进度：选择帧完成（如果有选中的帧）
    if (selectedFrames.length > 0) {
        updateProgress(2);
    }
    
    // 确保当前预览索引有效
    if (currentPreviewIndex >= selectedFrames.length) {
        currentPreviewIndex = selectedFrames.length - 1;
    }
    if (currentPreviewIndex < 0) {
        currentPreviewIndex = 0;
    }
    
    // 更新滑块
    previewSlider.max = selectedFrames.length - 1;
    previewSlider.value = currentPreviewIndex;
    
    // 显示当前帧
    showPreviewFrame(currentPreviewIndex);
    
    // 自动开始播放（如果当前没有在播放）
    if (!isPlaying) {
        startPlayback();
    }
    
    // 更新预设分辨率显示（如果输出分辨率已勾选）
    if (outputResolutionCheckbox && outputResolutionCheckbox.checked && window.updatePresetResolutionDisplay) {
        window.updatePresetResolutionDisplay();
    }
    
    // 更新分辨率显示
    if (window.updateResolutionDisplay) {
        window.updateResolutionDisplay();
    }
}

// 显示预览帧
function showPreviewFrame(index) {
    if (selectedFrames.length === 0) return;
    
    const frameIndex = selectedFrames[index];
    const frame = extractedFrames[frameIndex];
    
    if (frame) {
        previewImage.src = frame.image;
        previewFrameNumber.textContent = `帧 ${frameIndex + 1}`;
        currentPreviewIndex = index;
        previewSlider.value = index;
    }
}

// 滑块变化
function handleSliderChange(e) {
    const index = parseInt(e.target.value);
    showPreviewFrame(index);
    if (isPlaying) {
        stopPlayback();
    }
}

// 跳转到第一帧
function goToFrame(index) {
    if (selectedFrames.length === 0) return;
    showPreviewFrame(index);
    if (isPlaying) {
        stopPlayback();
    }
}

// 上一帧
function goToPreviousFrame() {
    if (currentPreviewIndex > 0) {
        goToFrame(currentPreviewIndex - 1);
    } else if (loopCheckbox.checked && selectedFrames.length > 0) {
        goToFrame(selectedFrames.length - 1);
    }
}

// 下一帧
function goToNextFrame() {
    if (currentPreviewIndex < selectedFrames.length - 1) {
        goToFrame(currentPreviewIndex + 1);
    } else if (loopCheckbox.checked) {
        goToFrame(0);
    }
}

// 最后帧
function goToLastFrame() {
    if (selectedFrames.length > 0) {
        goToFrame(selectedFrames.length - 1);
    }
}

// 切换播放/暂停
function togglePlayPause() {
    if (selectedFrames.length === 0) return;
    
    if (isPlaying) {
        stopPlayback();
    } else {
        startPlayback();
    }
}

// 开始播放
function startPlayback() {
    if (selectedFrames.length === 0) return;
    
    isPlaying = true;
    updatePlayPauseButton();
    
    // 根据提取帧率和播放速度倍数计算播放间隔
    // 正常速度（playbackSpeed=1）时，按提取帧率播放
    // 0.5x 和 2x 分别对应正常速度的0.5倍和2倍
    const actualFrameRate = extractedFrameRate * playbackSpeed;
    const interval = 1000 / actualFrameRate; // 毫秒
    
    playInterval = setInterval(() => {
        if (currentPreviewIndex < selectedFrames.length - 1) {
            showPreviewFrame(currentPreviewIndex + 1);
        } else if (loopCheckbox.checked) {
            showPreviewFrame(0);
        } else {
            stopPlayback();
        }
    }, interval);
}

// 停止播放
function stopPlayback() {
    isPlaying = false;
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
    updatePlayPauseButton();
}

// 更新播放/暂停按钮
function updatePlayPauseButton() {
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

// 循环播放变化
function handleLoopChange() {
    // 循环设置变化时，如果正在播放，继续播放
}

// 播放速度变化
function handleSpeedChange(e) {
    playbackSpeed = parseFloat(e.target.value);
    if (isPlaying) {
        stopPlayback();
        startPlayback();
    }
}

// 处理后的帧数据
let processedFrames = [];

// 处理抠图
async function processCutout() {
    if (selectedFrames.length === 0) {
        alert('请先选择要处理的帧');
        return;
    }
    
    const removeWatermark = removeWatermarkCheckbox.checked;
    const watermarkRatio = removeWatermark ? parseFloat(watermarkRatioInput.value) / 100 : 0.1; // 默认10%
    const removeBg = removeBackgroundCheckbox.checked;
    const outputResolution = outputResolutionCheckbox.checked;
    
    if (!removeWatermark && !removeBg && !outputResolution) {
        alert('请至少选择一个处理选项');
        return;
    }
    
    // 获取输出分辨率设置
    let targetWidth = null;
    let targetHeight = null;
    if (outputResolution) {
        if (presetResolution.value === 'custom') {
            targetWidth = parseInt(outputWidth.value);
            targetHeight = parseInt(outputHeight.value);
            if (!targetWidth || !targetHeight) {
                alert('请输入有效的自定义分辨率');
                return;
            }
        } else {
            // 预设分辨率，宽度已确定，高度会在处理时根据原图比例计算
            targetWidth = parseInt(presetResolution.value);
        }
    }
    
    processCutoutBtn.disabled = true;
    processCutoutBtn.textContent = '处理中...';
    cutoutPreview.style.display = 'block';
    cutoutPreviewGrid.innerHTML = '';
    // 开始处理时隐藏Spritesheet模块
    spritesheetSection.style.display = 'none';
    
    try {
        processedFrames = [];
        
        // 获取选中的帧
        const framesToProcess = selectedFrames.map(idx => extractedFrames[idx]);
        
        // 处理每一帧
        let detectedBgColor = null;
        for (let i = 0; i < framesToProcess.length; i++) {
            const frame = framesToProcess[i];
            const processed = await processFrame(frame, removeWatermark, watermarkRatio, removeBg, outputResolution, targetWidth, targetHeight);
            processedFrames.push(processed);
            
            // 保存第一帧检测到的背景色用于显示
            if (removeBg && processed.backgroundColor && !detectedBgColor) {
                detectedBgColor = processed.backgroundColor;
                displayBackgroundColor(detectedBgColor);
            }
            
            // 第一帧处理完成后，立即显示分辨率信息
            if (i === 0 && processed.originalWidth && processed.originalHeight) {
                originalResolution.textContent = `${processed.originalWidth} × ${processed.originalHeight}`;
                processedResolution.textContent = `${processed.processedWidth} × ${processed.processedHeight}`;
                outputResolutionInfo.style.display = 'flex';
            }
            
            // 立即显示这一帧
            addCutoutPreviewItem(processed, i);
            
            // 显示处理进度
            const progress = Math.round(((i + 1) / framesToProcess.length) * 100);
            processCutoutBtn.textContent = `处理中... ${progress}%`;
        }
        
        downloadCutoutBtn.style.display = 'inline-flex';
        processCutoutBtn.textContent = '处理选中帧';
        
        // 更新进度：抠图处理完成
        updateProgress(3);
        
        // 更新使用统计
        updateUsageStats();
        
        // 处理完成后显示Spritesheet模块
        if (processedFrames.length > 0) {
            spritesheetSection.style.display = 'block';
        }
        
    } catch (error) {
        console.error('处理抠图时出错:', error);
        alert('处理抠图时出错，请重试');
    } finally {
        processCutoutBtn.disabled = false;
    }
}

// 处理单帧
function processFrame(frame, removeWatermark, watermarkRatio, removeBg, outputResolution, targetWidth, targetHeight) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            // 保存原始分辨率
            const originalWidth = img.width;
            const originalHeight = img.height;
            const originalAspectRatio = originalWidth / originalHeight;
            
            // 创建临时canvas来处理图片
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            tempCtx.drawImage(img, 0, 0);
            
            // 如果需要移除水印，先处理（在移除背景之前）
            if (removeWatermark) {
                removeWatermarkFromCanvas(tempCtx, tempCanvas.width, tempCanvas.height, watermarkRatio);
            }
            
            // 如果需要移除背景，再处理
            let bgColor = null;
            if (removeBg) {
                bgColor = removeBackgroundFromCanvas(tempCtx, tempCanvas.width, tempCanvas.height);
            }
            
            // 计算最终输出尺寸
            let finalWidth = tempCanvas.width;
            let finalHeight = tempCanvas.height;
            
            if (outputResolution && targetWidth) {
                if (targetHeight) {
                    // 自定义尺寸
                    finalWidth = targetWidth;
                    finalHeight = targetHeight;
                } else {
                    // 预设分辨率，根据原图比例计算高度
                    finalWidth = targetWidth;
                    finalHeight = Math.round(targetWidth / originalAspectRatio);
                }
            }
            
            // 创建最终canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = finalWidth;
            canvas.height = finalHeight;
            
            // 绘制图像（缩放）
            ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, finalWidth, finalHeight);
            
            const finalImageData = canvas.toDataURL('image/png');
            resolve({
                image: finalImageData,
                index: frame.index,
                time: frame.time,
                originalWidth: originalWidth,
                originalHeight: originalHeight,
                processedWidth: canvas.width,
                processedHeight: canvas.height,
                backgroundColor: bgColor
            });
        };
        img.src = frame.image;
    });
}

// 查找像素区域边界
function findPixelBounds(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let hasPixel = false;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            if (data[idx + 3] > 0) { // 非透明像素
                hasPixel = true;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }
    
    if (!hasPixel) {
        return null;
    }
    
    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
}

// 绘制像素区域边界框（黑色虚线）
function drawPixelBoundsBox(ctx, bounds) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8; // 4倍粗（原来是2px，现在是8px）
    ctx.setLineDash([5, 5]); // 虚线样式
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.restore();
}

// 移除水印（移除四个角的长方形区域）
function removeWatermarkFromCanvas(ctx, width, height, ratio) {
    // 计算水印区域的长宽（对应原视频的长宽比例）
    const watermarkWidth = Math.floor(width * ratio);
    const watermarkHeight = Math.floor(height * ratio);
    
    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // 移除四个角的长方形区域
    // 左上角
    for (let y = 0; y < watermarkHeight; y++) {
        for (let x = 0; x < watermarkWidth; x++) {
            const idx = (y * width + x) * 4;
            data[idx + 3] = 0; // 设置为透明
        }
    }
    
    // 右上角
    for (let y = 0; y < watermarkHeight; y++) {
        for (let x = width - watermarkWidth; x < width; x++) {
            const idx = (y * width + x) * 4;
            data[idx + 3] = 0; // 设置为透明
        }
    }
    
    // 左下角
    for (let y = height - watermarkHeight; y < height; y++) {
        for (let x = 0; x < watermarkWidth; x++) {
            const idx = (y * width + x) * 4;
            data[idx + 3] = 0; // 设置为透明
        }
    }
    
    // 右下角
    for (let y = height - watermarkHeight; y < height; y++) {
        for (let x = width - watermarkWidth; x < width; x++) {
            const idx = (y * width + x) * 4;
            data[idx + 3] = 0; // 设置为透明
        }
    }
    
    // 将修改后的数据写回canvas
    ctx.putImageData(imageData, 0, 0);
}

// 获取最外一圈轮廓的众数颜色
function getBorderColorMode(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // 收集最外一圈的像素颜色
    const borderPixels = [];
    
    // 上边
    for (let x = 0; x < width; x++) {
        const idx = (0 * width + x) * 4;
        if (data[idx + 3] > 0) { // 非透明像素
            borderPixels.push({
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2]
            });
        }
    }
    
    // 下边
    for (let x = 0; x < width; x++) {
        const idx = ((height - 1) * width + x) * 4;
        if (data[idx + 3] > 0) { // 非透明像素
            borderPixels.push({
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2]
            });
        }
    }
    
    // 左边
    for (let y = 1; y < height - 1; y++) {
        const idx = (y * width + 0) * 4;
        if (data[idx + 3] > 0) { // 非透明像素
            borderPixels.push({
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2]
            });
        }
    }
    
    // 右边
    for (let y = 1; y < height - 1; y++) {
        const idx = (y * width + (width - 1)) * 4;
        if (data[idx + 3] > 0) { // 非透明像素
            borderPixels.push({
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2]
            });
        }
    }
    
    if (borderPixels.length === 0) {
        return null;
    }
    
    // 将颜色量化到相近的颜色组（容差为5）
    const colorGroups = new Map();
    const tolerance = 5;
    
    for (const pixel of borderPixels) {
        // 量化颜色
        const quantizedR = Math.floor(pixel.r / tolerance) * tolerance;
        const quantizedG = Math.floor(pixel.g / tolerance) * tolerance;
        const quantizedB = Math.floor(pixel.b / tolerance) * tolerance;
        const key = `${quantizedR},${quantizedG},${quantizedB}`;
        
        if (!colorGroups.has(key)) {
            colorGroups.set(key, { color: pixel, count: 0 });
        }
        colorGroups.get(key).count++;
    }
    
    // 找到出现次数最多的颜色组
    let maxCount = 0;
    let modeColor = null;
    for (const [key, group] of colorGroups) {
        if (group.count > maxCount) {
            maxCount = group.count;
            modeColor = group.color;
        }
    }
    
    return modeColor;
}

// 移除背景（使用最外一圈轮廓的众数颜色）
function removeBackgroundFromCanvas(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // 获取最外一圈轮廓的众数颜色
    const bgColor = getBorderColorMode(ctx, width, height);
    
    if (!bgColor) {
        // 如果没有找到背景色，返回null
        return null;
    }
    
    // 阈值：颜色相似度阈值
    const threshold = 30;
    
    // 遍历所有像素
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // 计算与背景色的距离
        const distance = Math.sqrt(
            Math.pow(r - bgColor.r, 2) +
            Math.pow(g - bgColor.g, 2) +
            Math.pow(b - bgColor.b, 2)
        );
        
        // 如果颜色接近背景色，设置为透明
        if (distance < threshold) {
            data[i + 3] = 0; // 设置alpha为0（透明）
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 返回背景色信息
    return bgColor;
}

// 显示背景色信息
function displayBackgroundColor(bgColor) {
    if (!bgColor) return;
    
    const hexColor = rgbToHex(bgColor.r, bgColor.g, bgColor.b);
    bgColorPreview.style.backgroundColor = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;
    bgColorCode.textContent = `#${hexColor} (RGB: ${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;
    backgroundColorInfo.style.display = 'flex';
}

// RGB转十六进制
function rgbToHex(r, g, b) {
    return [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// 计算所有帧的像素区域并集
function calculateUnionBounds(frames, removeBg) {
    return new Promise((resolve) => {
        if (frames.length === 0) {
            resolve(null);
            return;
        }
        
        const bounds = {
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        };
        
        let processed = 0;
        let firstImgWidth = 0;
        let firstImgHeight = 0;
        
        frames.forEach((frame, index) => {
            const img = new Image();
            img.onload = () => {
                if (index === 0) {
                    firstImgWidth = img.width;
                    firstImgHeight = img.height;
                }
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // 如果需要移除背景，先处理
                if (removeBg) {
                    removeBackgroundFromCanvas(ctx, canvas.width, canvas.height);
                }
                
                // 获取图像数据
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // 找到非透明像素的边界
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                let hasPixel = false;
                
                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const idx = (y * canvas.width + x) * 4;
                        if (data[idx + 3] > 0) { // 非透明像素
                            hasPixel = true;
                            minX = Math.min(minX, x);
                            minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x);
                            maxY = Math.max(maxY, y);
                        }
                    }
                }
                
                if (hasPixel) {
                    bounds.minX = Math.min(bounds.minX, minX);
                    bounds.minY = Math.min(bounds.minY, minY);
                    bounds.maxX = Math.max(bounds.maxX, maxX);
                    bounds.maxY = Math.max(bounds.maxY, maxY);
                }
                
                processed++;
                if (processed === frames.length) {
                    // 如果没有任何像素，使用第一张图片的尺寸
                    if (bounds.minX === Infinity) {
                        resolve({
                            x: 0,
                            y: 0,
                            width: firstImgWidth,
                            height: firstImgHeight
                        });
                    } else {
                        resolve({
                            x: bounds.minX,
                            y: bounds.minY,
                            width: bounds.maxX - bounds.minX + 1,
                            height: bounds.maxY - bounds.minY + 1
                        });
                    }
                }
            };
            img.onerror = () => {
                processed++;
                if (processed === frames.length) {
                    resolve({
                        x: 0,
                        y: 0,
                        width: firstImgWidth || 100,
                        height: firstImgHeight || 100
                    });
                }
            };
            img.src = frame.image;
        });
    });
}

// 添加单个抠图预览项
function addCutoutPreviewItem(frame, index) {
    const frameItem = document.createElement('div');
    frameItem.className = 'cutout-preview-item';
    
    frameItem.innerHTML = `
        <img src="${frame.image}" alt="处理后的帧 ${index + 1}" class="cutout-preview-image">
        <div class="cutout-preview-label">帧 ${frame.index + 1}</div>
    `;
    cutoutPreviewGrid.appendChild(frameItem);
}

// 显示抠图预览
function displayCutoutPreview() {
    cutoutPreviewGrid.innerHTML = '';
    
    processedFrames.forEach((frame, index) => {
        addCutoutPreviewItem(frame, index);
    });
    
    cutoutPreview.style.display = 'block';
}

// 下载处理后的帧
async function downloadCutoutFrames() {
    if (processedFrames.length === 0) {
        alert('没有可下载的帧');
        return;
    }
    
    if (typeof JSZip === 'undefined') {
        alert('JSZip库加载失败，请刷新页面重试');
        return;
    }
    
    try {
        downloadCutoutBtn.disabled = true;
        downloadCutoutBtn.textContent = '打包中...';
        
        const zip = new JSZip();
        
        // 将每个帧添加到ZIP中
        for (let i = 0; i < processedFrames.length; i++) {
            const frame = processedFrames[i];
            const fileName = `frame_${frame.index + 1}_processed.png`;
            
            // 将base64数据转换为blob
            const base64Data = frame.image.split(',')[1]; // 移除data:image/png;base64,前缀
            zip.file(fileName, base64Data, { base64: true });
        }
        
        // 生成ZIP文件
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `processed_frames_${new Date().getTime()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        URL.revokeObjectURL(link.href);
        
        downloadCutoutBtn.textContent = '下载处理后的帧';
    } catch (error) {
        console.error('打包ZIP时出错:', error);
        alert('打包ZIP时出错，请重试');
    } finally {
        downloadCutoutBtn.disabled = false;
    }
}

// 生成Spritesheet
let generatedSpritesheet = null;

async function generateSpritesheet() {
    if (processedFrames.length === 0) {
        alert('请先处理选中帧');
        return;
    }
    
    generateSpritesheetBtn.disabled = true;
    generateSpritesheetBtn.textContent = '生成中...';
    spritesheetPreview.style.display = 'none';
    
    try {
        const spacing = 0; // 固定间距为0px
        const frameCount = processedFrames.length;
        const frameWidth = processedFrames[0].processedWidth;
        const frameHeight = processedFrames[0].processedHeight;
        
        // 自动计算行列数，使spritesheet尽可能接近正方形（长>=宽）
        // 目标：找到一个cols和rows的组合，使得 spritesheetWidth >= spritesheetHeight 且尽可能接近正方形
        let bestCols = 1;
        let bestRows = frameCount;
        let bestRatio = Infinity;
        
        // 尝试不同的列数，找到最接近正方形的组合
        for (let cols = 1; cols <= frameCount; cols++) {
            const rows = Math.ceil(frameCount / cols);
            const spritesheetWidth = cols * frameWidth + (cols - 1) * spacing;
            const spritesheetHeight = rows * frameHeight + (rows - 1) * spacing;
            
            // 确保长>=宽
            if (spritesheetWidth >= spritesheetHeight) {
                // 计算长宽比，越接近1越好
                const ratio = spritesheetWidth / spritesheetHeight;
                if (ratio < bestRatio) {
                    bestRatio = ratio;
                    bestCols = cols;
                    bestRows = rows;
                }
            }
        }
        
        // 如果找不到满足长>=宽的组合，使用最接近的组合
        if (bestRatio === Infinity) {
            // 使用最接近正方形的组合
            bestCols = Math.ceil(Math.sqrt(frameCount));
            bestRows = Math.ceil(frameCount / bestCols);
        }
        
        const cols = bestCols;
        const rows = bestRows;
        const spritesheetWidth = cols * frameWidth + (cols - 1) * spacing;
        const spritesheetHeight = rows * frameHeight + (rows - 1) * spacing;
        
        // 创建spritesheet canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = spritesheetWidth;
        canvas.height = spritesheetHeight;
        
        // 绘制每一帧
        for (let i = 0; i < processedFrames.length; i++) {
            const frame = processedFrames[i];
            const img = new Image();
            
            await new Promise((resolve) => {
                img.onload = () => {
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const x = col * (frameWidth + spacing);
                    const y = row * (frameHeight + spacing);
                    
                    ctx.drawImage(img, x, y);
                    resolve();
                };
                img.src = frame.image;
            });
        }
        
        // 生成图片数据
        const spritesheetData = canvas.toDataURL('image/png');
        generatedSpritesheet = {
            data: spritesheetData,
            width: spritesheetWidth,
            height: spritesheetHeight,
            frameWidth: frameWidth,
            frameHeight: frameHeight,
            cols: cols,
            rows: rows,
            frameCount: frameCount
        };
        
        // 显示预览和单元分辨率信息
        spritesheetPreviewImage.src = spritesheetData;
        spritesheetInfo.innerHTML = `
            <div class="spritesheet-info-item">
                <span class="spritesheet-info-label">Spritesheet尺寸：</span>
                <span class="spritesheet-info-value">${spritesheetWidth} × ${spritesheetHeight} px</span>
            </div>
            <div class="spritesheet-info-item">
                <span class="spritesheet-info-label">单元分辨率：</span>
                <span class="spritesheet-info-value">${frameWidth} × ${frameHeight} px</span>
            </div>
            <div class="spritesheet-info-item">
                <span class="spritesheet-info-label">布局：</span>
                <span class="spritesheet-info-value">${cols} 列 × ${rows} 行 (共 ${frameCount} 帧)</span>
            </div>
        `;
        spritesheetPreview.style.display = 'block';
        downloadSpritesheetBtn.style.display = 'inline-flex';
        generateSpritesheetBtn.textContent = '生成Spritesheet';
        
        // 更新进度：生成Spritesheet完成
        updateProgress(4);
        
        // 更新使用统计
        updateUsageStats();
        
    } catch (error) {
        console.error('生成Spritesheet时出错:', error);
        alert('生成Spritesheet时出错，请重试');
    } finally {
        generateSpritesheetBtn.disabled = false;
    }
}

// 下载Spritesheet
function downloadSpritesheet() {
    if (!generatedSpritesheet) {
        alert('请先生成Spritesheet');
        return;
    }
    
    const link = document.createElement('a');
    // 文件名包含单元分辨率信息
    const filename = `spritesheet_${generatedSpritesheet.frameWidth}x${generatedSpritesheet.frameHeight}_${generatedSpritesheet.cols}x${generatedSpritesheet.rows}_${new Date().getTime()}.png`;
    link.download = filename;
    link.href = generatedSpritesheet.data;
    link.click();
}

