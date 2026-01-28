// diagnosis-script.js - 诊断页面专用脚本
import { showMessage, showLoading, hideLoading } from './script.js';
import { signLanguageAPI } from './api_service.js';

class DiagnosisApp {
  constructor() {
    this.init();
  }

  init() {
    this.initCamera();
    this.initEventListeners();
    this.initDiagnosisData();
    this.updateUI();
  }

  initCamera() {
    this.videoElement = document.getElementById('cameraFeed');
    this.cameraStream = null;
    this.isRecognizing = false;
    this.recognitionCount = 0;
    this.successfulRecognition = 0;
    this.recognitionInterval = null; // 用于存储识别定时器

    // 初始化摄像头
    this.initCameraStream();

    // 检查后端连接
    this.checkBackendConnection();
  }

  async checkBackendConnection() {
    try {
      const health = await signLanguageAPI.checkHealth();
      if (health.status === 'ok') {
        console.log('✅ 后端服务连接成功');
        showMessage('后端服务已连接', 'success');
      } else {
        console.warn('⚠️ 后端服务异常');
        showMessage('后端服务异常，将使用模拟数据', 'warning');
      }
    } catch (error) {
      console.warn('⚠️ 无法连接到后端服务:', error);
      showMessage('无法连接到后端服务，请确保后端已启动', 'warning');
    }
  }

  async initCameraStream() {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.cameraStream = stream;
      this.videoElement.srcObject = stream;

      // 更新状态
      showMessage('摄像头已就绪', 'success');
    } catch (error) {
      console.error('摄像头访问失败:', error);
      showMessage('无法访问摄像头，请检查权限', 'error');

      // 显示错误状态
      document.querySelectorAll('.quality-item')[0].innerHTML =
        '<i class="fas fa-times-circle"></i> 摄像头错误';
    }
  }

  initEventListeners() {
    // 开始识别按钮
    document.getElementById('startRecognition').addEventListener('click', () => {
      this.startRecognition();
    });

    // 停止识别按钮
    document.getElementById('stopRecognition').addEventListener('click', () => {
      this.stopRecognition();
    });

    // 拍摄按钮
    document.getElementById('captureImage').addEventListener('click', () => {
      this.captureImage();
    });

    // 切换摄像头按钮
    document.getElementById('toggleCamera').addEventListener('click', () => {
      this.toggleCamera();
    });

    // 清空历史记录按钮
    document.getElementById('clearHistory').addEventListener('click', () => {
      this.clearHistory();
    });

    // 清空结果按钮
    document.getElementById('clearResults').addEventListener('click', () => {
      this.clearResults();
    });

    // 诊断引导按钮
    document.getElementById('prevQuestion').addEventListener('click', () => {
      this.prevQuestion();
    });

    document.getElementById('nextQuestion').addEventListener('click', () => {
      this.nextQuestion();
    });

    // 生成卡片按钮
    document.getElementById('generateCard').addEventListener('click', () => {
      this.generateCard();
    });

    // 症状选项点击
    document.querySelectorAll('.option-item').forEach(item => {
      item.addEventListener('click', () => {
        this.selectSymptom(item);
      });
    });

    // 卡片操作按钮
    document.querySelectorAll('.btn-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.querySelector('i').className.split(' ')[1];
        this.handleCardAction(action);
      });
    });

    // 自定义输入按钮
    document.getElementById('customInputBtn').addEventListener('click', () => {
      this.openCustomInput();
    });

    // 自定义输入模态框相关事件
    document.getElementById('closeModal').addEventListener('click', () => {
      this.closeCustomInput();
    });

    document.getElementById('cancelCustomInput').addEventListener('click', () => {
      this.closeCustomInput();
    });

    document.getElementById('submitCustomInput').addEventListener('click', (e) => {
      e.stopPropagation(); // 只阻止冒泡，不阻止默认行为
      this.submitCustomInput();
    });

    // 点击模态框外部关闭
    const modal = document.getElementById('customInputModal');
    modal.addEventListener('click', (e) => {
      // 如果点击的是示例项，处理示例点击
      const exampleItem = e.target.closest('.example-item');
      if (exampleItem) {
        this.selectExample(exampleItem.textContent.trim());
        return;
      }

      // 只关闭模态框本身，不关闭内容区域
      if (e.target === modal) {
        this.closeCustomInput();
      }
    });

    // 防止模态框内容区域的点击事件冒泡到模态框外层
    const modalContent = document.querySelector('#customInputModal .modal-content');
    if (modalContent) {
      modalContent.addEventListener('click', (e) => {
        // 如果点击的是示例项，不阻止冒泡，让它在模态框层处理
        if (!e.target.closest('.example-item') && !e.target.closest('button')) {
          e.stopPropagation();
        }
      });
    }

    // 医生填写部分输入监听
    const doctorDiagnosis = document.getElementById('doctorDiagnosis');
    const doctorMedication = document.getElementById('doctorMedication');
    const doctorSignature = document.getElementById('doctorSignature');

    if (doctorDiagnosis) {
      doctorDiagnosis.addEventListener('input', (e) => {
        this.doctorInfo.diagnosis = e.target.value;
        this.saveDoctorInfo();
        this.updateCardStatus();
      });
    }

    if (doctorMedication) {
      doctorMedication.addEventListener('input', (e) => {
        this.doctorInfo.medication = e.target.value;
        this.saveDoctorInfo();
        this.updateCardStatus();
      });
    }

    if (doctorSignature) {
      doctorSignature.addEventListener('input', (e) => {
        this.doctorInfo.signature = e.target.value;
        this.saveDoctorInfo();
        this.updateCardStatus();
      });
    }
  }

  initDiagnosisData() {
    // 加载历史记录
    this.history = JSON.parse(localStorage.getItem('diagnosisHistory') || '[]');
    this.currentQuestion = 1;
    this.totalQuestions = 4;
    this.answers = {};

    // 初始化医生填写部分
    this.doctorInfo = {
      diagnosis: '',
      medication: '',
      signature: ''
    };

    // 从本地存储加载医生信息（如果有）
    const savedDoctorInfo = localStorage.getItem('doctorInfo');
    if (savedDoctorInfo) {
      try {
        this.doctorInfo = JSON.parse(savedDoctorInfo);
        // 恢复输入框的值
        const diagnosisInput = document.getElementById('doctorDiagnosis');
        const medicationInput = document.getElementById('doctorMedication');
        const signatureInput = document.getElementById('doctorSignature');
        if (diagnosisInput) diagnosisInput.value = this.doctorInfo.diagnosis || '';
        if (medicationInput) medicationInput.value = this.doctorInfo.medication || '';
        if (signatureInput) signatureInput.value = this.doctorInfo.signature || '';
      } catch (e) {
        console.warn('加载医生信息失败:', e);
      }
    }

    // 更新卡片日期
    const now = new Date();
    document.getElementById('cardDate').textContent =
      `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    // 初始化卡片状态（不根据历史记录预先推荐科室，保持“分析中...”）
    setTimeout(() => {
      this.updateCardStatus();
    }, 100);
  }

  updateDepartmentRecommendation() {
    // 从历史记录中提取去重后的所有症状
    const uniqueSymptoms = [...new Set(this.history.map(item => item.text))];

    // 调用推荐函数，获取推荐科室
    const recommendedDept = this.recommendDepartment(uniqueSymptoms);

    // 更新"就医辅助卡"上的UI
    const recommendationEl = document.getElementById('departmentRecommendationValue');
    if (recommendationEl) {
      recommendationEl.textContent = recommendedDept;
    }
  }

  updateUI() {
    // 计算当天的识别成功率：基于历史记录，点击报错是错误，没有点击报错就是正确
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRecords = this.history.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= today;
    });

    // 更新今日识别次数
    const todayTotalCount = todayRecords.length;
    document.getElementById('recognitionCount').textContent = todayTotalCount;

    const todayCorrectCount = todayRecords.filter(item => !item.isError).length;
    const successRate = todayTotalCount > 0 ?
      Math.round((todayCorrectCount / todayTotalCount) * 100) : 0;
    document.getElementById('successRate').textContent = `${successRate}%`;

    // 更新历史记录列表
    this.updateHistoryList();

    // 更新问题进度
    this.updateQuestionProgress();
  }

  startRecognition() {
    if (!this.cameraStream) {
      showMessage('请先启用摄像头', 'warning');
      return;
    }

    this.isRecognizing = true;

    // 更新按钮状态
    document.getElementById('startRecognition').disabled = true;
    document.getElementById('stopRecognition').disabled = false;

    // 显示识别指示器
    document.querySelector('.recording-indicator').classList.add('active');

    // 开始真实识别
    this.startRealRecognition();

    showMessage('手语识别已开始', 'success');
  }

  stopRecognition() {
    this.isRecognizing = false;

    // 清除识别定时器
    if (this.recognitionInterval) {
      clearInterval(this.recognitionInterval);
      this.recognitionInterval = null;
    }

    // 更新按钮状态
    document.getElementById('startRecognition').disabled = false;
    document.getElementById('stopRecognition').disabled = true;

    // 隐藏识别指示器
    document.querySelector('.recording-indicator').classList.remove('active');

    showMessage('手语识别已停止', 'info');
  }

  captureFrame() {
    // 创建Canvas来捕获当前视频帧
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth || 640;
    canvas.height = this.videoElement.videoHeight || 480;

    const context = canvas.getContext('2d');
    context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

    // 转换为base64数据URL
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  async recognizeFrame() {
    try {
      // 捕获当前帧
      const imageData = this.captureFrame();

      // 调用后端API进行识别
      const result = await signLanguageAPI.recognize(imageData);

      if (result.success && result.result) {
        // 添加识别结果（传递置信度）
        this.addRecognitionResult(result.result, result.confidence);

        // 更新UI
        this.updateUI();

        // 显示成功消息
        showMessage(`识别成功: ${result.result}`, 'success');
      } else {
        // 识别失败（未检测到手部）
        showMessage(result.error || '未检测到手部，请将手放在识别框内', 'warning');
      }
    } catch (error) {
      console.error('识别请求失败:', error);
      showMessage('识别请求失败，请检查后端服务', 'error');
    }
  }

  startRealRecognition() {
    if (!this.isRecognizing) return;

    // 每2秒识别一次
    this.recognitionInterval = setInterval(async () => {
      if (!this.isRecognizing) {
        if (this.recognitionInterval) {
          clearInterval(this.recognitionInterval);
          this.recognitionInterval = null;
        }
        return;
      }

      // 执行识别
      await this.recognizeFrame();
    }, 2000); // 每2秒识别一次
  }

  addRecognitionResult(resultText, confidence = null) {
    const time = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // 添加到结果展示区域
    const resultsDisplay = document.getElementById('resultsDisplay');

    // 移除空状态
    const emptyState = resultsDisplay.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    const recordId = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    resultItem.innerHTML = `
            <div class="result-header">
                <div class="result-time">${time}</div>
                <button class="btn-error-report" data-record-id="${recordId}" title="标记为识别错误">
                    <i class="fas fa-exclamation-triangle"></i>
                    报错
                </button>
            </div>
            <div class="result-content">识别结果: ${resultText}</div>
        `;

    resultsDisplay.insertBefore(resultItem, resultsDisplay.firstChild);

    // 添加到历史记录
    const historyRecord = {
      id: recordId,
      text: resultText,
      time: time,
      timestamp: new Date().toISOString(),
      isError: false, // 默认未标记为错误
      confidence: confidence || null // 如果有置信度，保存它
    };

    this.history.unshift(historyRecord);

    // 添加报错按钮事件监听
    const errorBtn = resultItem.querySelector('.btn-error-report');
    if (errorBtn) {
      errorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.reportError(recordId, resultItem);
      });
    }

    // 保存到本地存储
    localStorage.setItem('diagnosisHistory', JSON.stringify(this.history));

    // 更新历史记录列表
    this.updateHistoryList();

    // 更新推荐科室
    this.updateDepartmentRecommendation();
  }

  reportError(recordId, resultItem) {
    // 找到对应的历史记录
    const recordIndex = this.history.findIndex(item => item.id === recordId);

    if (recordIndex !== -1) {
      // 更新历史记录中的错误标记
      this.history[recordIndex].isError = true;

      // 保存到本地存储
      localStorage.setItem('diagnosisHistory', JSON.stringify(this.history));

      // 更新UI显示
      if (resultItem) {
        resultItem.classList.add('result-error');
        const errorBtn = resultItem.querySelector('.btn-error-report');
        if (errorBtn) {
          errorBtn.classList.add('error-reported');
          errorBtn.innerHTML = '<i class="fas fa-check-circle"></i> 已报错';
          errorBtn.disabled = true;
        }
      }

      showMessage('已标记为识别错误，将用于计算准确率', 'success');

      // 更新历史记录列表显示
      this.updateHistoryList();
    } else {
      showMessage('未找到对应记录', 'warning');
    }
  }

  updateHistoryList() {
    const historyList = document.getElementById('historyList');
    const emptyState = historyList.querySelector('.empty-state');

    if (this.history.length === 0) {
      if (!emptyState) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.innerHTML = `
                    <i class="fas fa-history"></i>
                    <h4>暂无识别记录</h4>
                    <p>开始手语识别后，历史记录将在这里显示</p>
                `;
        historyList.innerHTML = '';
        historyList.appendChild(emptyDiv);
      }
      return;
    }

    // 移除空状态
    if (emptyState) emptyState.remove();

    // 显示历史记录
    historyList.innerHTML = '';
    this.history.slice(0, 10).forEach((item, index) => {
      // 兼容旧数据格式（没有id和isError字段的）
      if (!item.id) {
        item.id = `legacy_${index}_${Date.now()}`;
      }
      if (item.isError === undefined) {
        item.isError = false;
      }

      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';

      // 如果标记为错误，添加视觉提示
      const errorBadge = item.isError ? '<span class="error-badge" style="color: var(--danger-color); font-size: 0.75rem;"><i class="fas fa-exclamation-triangle"></i> 已报错</span>' : '';

      historyItem.innerHTML = `
                <div class="history-content">
                    <div class="history-text">${item.text} ${errorBadge}</div>
                    <div class="history-time">${item.time || new Date(item.timestamp).toLocaleTimeString('zh-CN')}</div>
                </div>
            `;

      // 点击查看详情
      historyItem.addEventListener('click', () => {
        this.showHistoryDetail(item);
      });

      historyList.appendChild(historyItem);
    });
  }

  captureImage() {
    if (!this.cameraStream) {
      showMessage('请先启用摄像头', 'warning');
      return;
    }

    // 创建Canvas来捕获图像
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

    // 转换为数据URL
    const imageData = canvas.toDataURL('image/jpeg');

    // 保存图片
    this.saveImage(imageData);

    showMessage('图片已保存', 'success');
  }

  saveImage(imageData) {
    // 这里可以实现图片保存逻辑
    console.log('图片数据:', imageData.substring(0, 100) + '...');

    // 示例：下载图片
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `hand-sign-${new Date().getTime()}.jpg`;
    link.click();
  }

  async toggleCamera() {
    if (!this.cameraStream) return;

    // 停止当前流
    this.cameraStream.getTracks().forEach(track => track.stop());

    // 获取所有摄像头
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    if (videoDevices.length < 2) {
      showMessage('未找到其他摄像头', 'warning');
      this.initCameraStream(); // 重新初始化原摄像头
      return;
    }

    // 切换摄像头
    const currentDeviceId = this.cameraStream.getVideoTracks()[0].getSettings().deviceId;
    const nextDevice = videoDevices.find(device => device.deviceId !== currentDeviceId);

    const constraints = {
      video: {
        deviceId: { exact: nextDevice.deviceId }
      },
      audio: false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.cameraStream = stream;
      this.videoElement.srcObject = stream;

      showMessage('已切换摄像头', 'success');
    } catch (error) {
      console.error('切换摄像头失败:', error);
      showMessage('切换摄像头失败', 'error');
      this.initCameraStream(); // 重新初始化原摄像头
    }
  }

  clearHistory() {
    if (this.history.length === 0) {
      showMessage('历史记录已为空', 'info');
      return;
    }

    if (confirm('确定要清空所有历史记录吗？')) {
      this.history = [];
      localStorage.removeItem('diagnosisHistory');
      this.updateHistoryList();
      showMessage('历史记录已清空', 'success');
    }
  }

  clearResults() {
    const resultsDisplay = document.getElementById('resultsDisplay');

    if (resultsDisplay.querySelector('.result-item')) {
      resultsDisplay.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <h4>等待识别结果</h4>
                    <p>请开始手语识别，结果将实时显示在这里</p>
                </div>
            `;

      showMessage('识别结果已清空', 'info');
    } else {
      showMessage('没有需要清空的结果', 'info');
    }
  }

  selectSymptom(item) {
    // 如果点击的是自定义答案显示项，不执行普通选择逻辑
    if (item.classList.contains('custom-answer-display')) {
      this.openCustomInput();
      return;
    }

    // 移除之前的选择（包括自定义答案）
    document.querySelectorAll('.option-item').forEach(el => {
      el.classList.remove('selected');
    });
    const customDisplay = document.querySelector('.custom-answer-display');
    if (customDisplay) {
      customDisplay.remove();
    }

    // 添加当前选择
    item.classList.add('selected');

    // 更新答案（标记为非自定义）
    const symptom = item.querySelector('.option-text').textContent;
    this.answers[`question${this.currentQuestion}`] = symptom;
    delete this.answers[`question${this.currentQuestion}_custom`];

    // 更新卡片内容
    this.updateCardContent();

    // 启用下一个问题按钮
    document.getElementById('nextQuestion').disabled = false;
  }

  updateQuestionProgress() {
    const progressElement = document.querySelector('.guidance-progress');
    progressElement.innerHTML = `
            <i class="fas fa-sign-language"></i>
            问题 ${this.currentQuestion}/${this.totalQuestions}
        `;

    // 更新问题内容
    const questions = {
      1: "您哪里感到不适？（请用手语表示身体部位）",
      2: "这种不适持续多久了？",
      3: "请描述疼痛的程度（1-10分）",
      4: "还有其他伴随症状吗？"
    };

    document.querySelector('.question-content').textContent = questions[this.currentQuestion] || "请描述您的症状";
    document.querySelector('.question-number').textContent = this.currentQuestion;

    // 更新提示内容
    const hints = {
      1: "例如：头部、胸部、腹部、四肢等",
      2: "例如：几小时、几天等",
      3: "1分表示轻微不适，10分表示剧烈疼痛",
      4: "例如：发热、恶心、头晕等"
    };

    document.querySelector('.question-hint').innerHTML = `
            <i class="fas fa-lightbulb"></i>
            ${hints[this.currentQuestion] || "请尽可能详细地描述"}
        `;

    // 更新选项
    this.updateQuestionOptions();

    // 检查当前问题是否有自定义答案，如果有则显示
    if (this.answers[`question${this.currentQuestion}_custom`] && this.answers[`question${this.currentQuestion}`]) {
      this.updateCustomAnswerDisplay(this.answers[`question${this.currentQuestion}`]);
    }

    // 更新按钮状态
    document.getElementById('prevQuestion').disabled = this.currentQuestion === 1;
    document.getElementById('nextQuestion').disabled = !this.answers[`question${this.currentQuestion}`];

    // 更新生成卡片按钮状态（包含医生填写部分）
    this.updateCardStatus();
  }

  updateQuestionOptions() {
    const optionsContainer = document.querySelector('.options-grid');
    let options = [];

    switch (this.currentQuestion) {
      case 1:
        options = ["头", "手", "心脏", "脖子"];
        break;
      case 2:
        options = ["几小时", "几天"];
        break;
      case 3:
        options = ["1-3分 轻微", "4-6分 中度", "7-8分 严重", "9-10分 剧烈"];
        break;
      case 4:
        options = ["感冒", "发烧", "恶心", "呕吐"];
        break;
    }

    optionsContainer.innerHTML = '';
    options.forEach(option => {
      const item = document.createElement('div');
      item.className = 'option-item';
      if (this.answers[`question${this.currentQuestion}`] === option.split(' ')[0] && !this.answers[`question${this.currentQuestion}_custom`]) {
        item.classList.add('selected');
      }
      item.innerHTML = `<div class="option-text">${option}</div>`;

      item.addEventListener('click', () => {
        this.selectSymptom(item);
      });

      optionsContainer.appendChild(item);
    });
  }

  prevQuestion() {
    if (this.currentQuestion > 1) {
      this.currentQuestion--;
      this.updateQuestionProgress();
    }
  }

  nextQuestion() {
    if (this.currentQuestion < this.totalQuestions) {
      this.currentQuestion++;
      this.updateQuestionProgress();
    }
  }

  saveDoctorInfo() {
    // 保存医生信息到本地存储
    localStorage.setItem('doctorInfo', JSON.stringify(this.doctorInfo));
  }

  updateCardStatus() {
    // 检查患者是否回答完所有问题
    const patientAnswered = Object.keys(this.answers).filter(key => !key.endsWith('_custom')).length === this.totalQuestions;

    // 检查医生是否填写完所有信息
    const doctorFilled = this.doctorInfo.diagnosis.trim() !== '' &&
                         this.doctorInfo.medication.trim() !== '' &&
                         this.doctorInfo.signature.trim() !== '';

    // 只有患者和医生都完成，才算完成
    const allComplete = patientAnswered && doctorFilled;

    // 更新生成卡片按钮状态
    const generateBtn = document.getElementById('generateCard');
    if (generateBtn) {
      generateBtn.disabled = !allComplete;
    }

    // 更新状态徽章
    const statusBadge = document.querySelector('.status-badge');
    if (statusBadge) {
      if (allComplete) {
        statusBadge.className = 'status-badge complete';
        statusBadge.textContent = '已完成';
      } else {
        statusBadge.className = 'status-badge incomplete';
        statusBadge.textContent = '未完成';
      }
    }
  }

  recommendDepartment(symptoms) {
    const departmentRules = {
      "神经内科": { score: 0, keywords: ["头", "脖子"] },
      "心血管内科": { score: 0, keywords: ["心脏"] },
      "消化内科": { score: 0, keywords: ["恶心"] },
      "呼吸内科": { score: 0, keywords: ["发烧", "感冒"] },
      "骨科": { score: 0, keywords: ["手"] }
    };

    symptoms.forEach(symptom => {
      for (const dept in departmentRules) {
        if (departmentRules[dept].keywords.includes(symptom)) {
          departmentRules[dept].score++;
        }
      }
    });

    let highestScore = 0;
    let recommendedDept = "分析中...";

    for (const dept in departmentRules) {
      if (departmentRules[dept].score > highestScore) {
        highestScore = departmentRules[dept].score;
        recommendedDept = dept;
      }
    }

    if (highestScore === 0 && symptoms.length > 0) {
      recommendedDept = "暂无明确指向，建议咨询全科";
    }

    return recommendedDept;
  }

  updateCardContent() {
    try {
      const symptom = this.answers.question1 || '待填写';
      const duration = this.answers.question2 || '待填写';
      const painLevel = this.answers.question3 || '待填写';
      const otherSymptoms = this.answers.question4 || '待填写';

      // 如果是自定义答案，添加标记
      const symptomDisplay = this.answers.question1_custom ? `${symptom} (自定义)` : symptom;
      const durationDisplay = this.answers.question2_custom ? `${duration} (自定义)` : duration;
      const painLevelDisplay = this.answers.question3_custom ? `${painLevel} (自定义)` : painLevel;
      const otherSymptomsDisplay = this.answers.question4_custom ? `${otherSymptoms} (自定义)` : otherSymptoms;

      // 更新卡片显示值
      const symptomEl = document.getElementById('symptomValue');
      const durationEl = document.getElementById('durationValue');
      const painLevelEl = document.getElementById('painLevelValue');
      const otherSymptomsEl = document.getElementById('otherSymptomsValue');
      const aggravatingEl = document.getElementById('aggravatingValue');

      if (symptomEl) symptomEl.textContent = symptomDisplay;
      if (durationEl) durationEl.textContent = durationDisplay;
      if (painLevelEl) painLevelEl.textContent = painLevelDisplay;
      if (otherSymptomsEl) otherSymptomsEl.textContent = otherSymptomsDisplay;

      // 更新医生填写部分（如果有输入框，显示值；否则显示文本）
      const diagnosisInput = document.getElementById('doctorDiagnosis');
      const medicationInput = document.getElementById('doctorMedication');
      const signatureInput = document.getElementById('doctorSignature');

      if (diagnosisInput) {
        diagnosisInput.value = this.doctorInfo.diagnosis || '';
      }
      if (medicationInput) {
        medicationInput.value = this.doctorInfo.medication || '';
      }
      if (signatureInput) {
        signatureInput.value = this.doctorInfo.signature || '';
      }

      // --- 推荐科室功能 ---
      // 1. 收集所有已知的症状（仅从答案中）
      const allSymptoms = [];
      if (this.answers.question1) allSymptoms.push(this.answers.question1);
      if (this.answers.question4) allSymptoms.push(this.answers.question4);

      // 2. 调用推荐方法
      const recommendedDept = this.recommendDepartment(allSymptoms);

      // 3. 更新推荐科室的UI
      const recommendationEl = document.getElementById('departmentRecommendationValue');
      if (recommendationEl) {
        recommendationEl.textContent = recommendedDept;
      }
      // --- 推荐科室功能结束 ---

      // 更新卡片状态
      this.updateCardStatus();
    } catch (error) {
      console.error('更新卡片内容时出错:', error);
    }
  }

  generateCard() {
    const loading = showLoading(document.querySelector('.card-section'), '正在生成卡片...');

    // 模拟生成过程
    setTimeout(() => {
      hideLoading(document.querySelector('.card-section'));

      // 生成PDF或图片
      this.downloadCard();

      showMessage('就医辅助卡已生成并下载', 'success');
    }, 1500);
  }

  downloadCard() {
    const symptom = this.answers.question1 || '未填写';
    const duration = this.answers.question2 || '未填写';
    const painLevel = this.answers.question3 || '未填写';
    const otherSymptoms = this.answers.question4 || '未填写';

    // 标记自定义答案
    const symptomMark = this.answers.question1_custom ? ' (自定义)' : '';
    const durationMark = this.answers.question2_custom ? ' (自定义)' : '';
    const painLevelMark = this.answers.question3_custom ? ' (自定义)' : '';
    const otherSymptomsMark = this.answers.question4_custom ? ' (自定义)' : '';

    // 获取医生填写信息
    const doctorDiagnosis = this.doctorInfo.diagnosis || '未填写';
    const doctorMedication = this.doctorInfo.medication || '未填写';
    const doctorSignature = this.doctorInfo.signature || '未填写';

    const cardContent = `=== 就医辅助卡 ===================================
日期: ${document.getElementById('cardDate').textContent}
--------------------------------------------------------
患者症状信息 (注：标注"自定义"的为患者自行描述):
--------------------------------------------------------
主要症状: ${symptom}${symptomMark}
持续时间: ${duration}${durationMark}
疼痛程度: ${painLevel}${painLevelMark}
其他症状: ${otherSymptoms}${otherSymptomsMark}
--------------------------------------------------------
医生诊断信息:
--------------------------------------------------------
医生诊断: ${doctorDiagnosis}
建议用药: ${doctorMedication}
医生签名: ${doctorSignature}
--------------------------------------------------------
患者签名: ____________________
=================================================`;

    const blob = new Blob([cardContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `就医辅助卡-${new Date().getTime()}.txt`;
    link.click();
  }

  handleCardAction(action) {
    switch (action) {
      case 'fa-print':
        window.print();
        break;
      case 'fa-download':
        this.downloadCard();
        break;
      case 'fa-share-alt':
        this.shareCard();
        break;
    }
  }

  shareCard() {
    if (navigator.share) {
      navigator.share({
        title: '我的就医辅助卡',
        text: '手语医疗助手生成的诊断信息',
        url: window.location.href
      });
    } else {
      showMessage('分享功能在当前浏览器不可用', 'warning');
    }
  }

  showHistoryDetail(item) {
    // 显示历史记录详情
    const detail = `
识别时间: ${item.time}
识别结果: ${item.text}
详细描述: 这是手语识别系统识别出的症状描述。
        `;

    alert(detail);
  }

  // 自定义输入相关方法
  openCustomInput() {
    const modal = document.getElementById('customInputModal');
    const textarea = document.getElementById('customInputValue');
    const label = document.getElementById('customInputLabel');
    const hint = document.getElementById('customInputHint');

    // 根据当前问题设置提示信息
    const questionInfo = this.getQuestionInfo(this.currentQuestion);
    label.textContent = `请输入关于"${questionInfo.label}"的描述：`;
    hint.textContent = questionInfo.hint;

    // 填充已有的自定义答案
    if (this.answers[`question${this.currentQuestion}_custom`] && this.answers[`question${this.currentQuestion}`]) {
      textarea.value = this.answers[`question${this.currentQuestion}`];
    } else {
      textarea.value = '';
    }

    // 显示模态框
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('show');
      textarea.focus();
    }, 10);

    // 更新示例答案
    this.updateExampleAnswers(questionInfo.examples);
  }

  closeCustomInput() {
    const modal = document.getElementById('customInputModal');
    if (modal) {
      // 移除show类以触发关闭动画
      modal.classList.remove('show');
      // 等待动画完成后隐藏模态框
      setTimeout(() => {
        if (modal) {
          modal.style.display = 'none';
          // 清空输入框
          const textarea = document.getElementById('customInputValue');
          if (textarea) {
            textarea.value = '';
          }
        }
      }, 300);
    }
  }

  selectExample(text) {
    document.getElementById('customInputValue').value = text;
  }

  submitCustomInput() {
    try {
      const inputValue = document.getElementById('customInputValue').value.trim();

      if (!inputValue) {
        showMessage('请输入内容', 'warning');
        return;
      }

      // 保存自定义答案
      this.answers[`question${this.currentQuestion}`] = inputValue;
      this.answers[`question${this.currentQuestion}_custom`] = true; // 标记为自定义输入

      // 更新UI显示自定义答案
      this.updateCustomAnswerDisplay(inputValue);

      // 启用下一个问题按钮
      const nextBtn = document.getElementById('nextQuestion');
      if (nextBtn) {
        nextBtn.disabled = false;
      }

      // 更新卡片内容（立即更新）
      this.updateCardContent();

      // 关闭模态框
      this.closeCustomInput();

      // 显示成功消息
      showMessage('自定义答案已保存', 'success');
    } catch (error) {
      console.error('提交自定义输入时出错:', error);
      showMessage('保存失败，请重试', 'error');
    }
  }

  // 根据问题编号获取问题信息
  getQuestionInfo(questionNumber) {
    const questions = {
      1: {
        label: "不适部位",
        hint: "请描述您感到不适的具体身体部位，例如：左侧太阳穴、右下腹部、背部中央等",
        examples: ["左侧头部太阳穴", "右下腹部", "背部中央", "右手腕关节"]
      },
      2: {
        label: "持续时间",
        hint: "请描述症状持续的时间，例如：间断性发作3小时、持续疼痛2天、每周发作一次等",
        examples: ["间断性发作3小时", "持续疼痛2天", "每周发作一次", "一个月前开始"]
      },
      3: {
        label: "疼痛程度",
        hint: "请用1-10分描述疼痛程度，并附加描述，例如：7分，伴有刺痛感",
        examples: ["7分，伴有刺痛感", "4分，持续性钝痛", "9分，难以忍受的剧痛"]
      },
      4: {
        label: "伴随症状",
        hint: "请描述其他伴随症状，例如：发热38.5℃、恶心呕吐、头晕目眩等",
        examples: ["发热38.5℃", "恶心呕吐", "头晕目眩", "食欲不振"]
      }
    };

    return questions[questionNumber] || {
      label: "症状描述",
      hint: "请详细描述您的症状",
      examples: ["请详细描述"]
    };
  }

  // 更新示例答案显示
  updateExampleAnswers(examples) {
    const exampleItems = document.querySelector('.example-items');
    exampleItems.innerHTML = '';

    examples.forEach(example => {
      const exampleItem = document.createElement('div');
      exampleItem.className = 'example-item';
      exampleItem.textContent = example;
      exampleItem.title = "点击使用此示例";
      exampleItems.appendChild(exampleItem);
    });
  }

  // 更新自定义答案显示
  updateCustomAnswerDisplay(answer) {
    // 移除之前的选择（包括预设选项）
    document.querySelectorAll('.option-item').forEach(el => {
      el.classList.remove('selected');
    });

    // 创建或更新自定义答案显示
    let customDisplay = document.querySelector('.custom-answer-display');
    if (!customDisplay) {
      customDisplay = document.createElement('div');
      customDisplay.className = 'custom-answer-display option-item selected';
      customDisplay.innerHTML = `
        <div class="option-text"></div>
        <div class="custom-badge">
          <i class="fas fa-edit"></i>
          自定义
        </div>
      `;

      // 添加点击编辑功能
      customDisplay.addEventListener('click', () => {
        this.openCustomInput();
      });

      // 插入到选项网格内部（作为最后一个选项）
      const optionsGrid = document.querySelector('.options-grid');
      if (optionsGrid) {
        optionsGrid.appendChild(customDisplay);
      } else {
        // 如果找不到选项网格，尝试插入到父容器
        const guidanceOptions = document.querySelector('.guidance-options');
        if (guidanceOptions) {
          const customInputSection = document.querySelector('.custom-input-section');
          if (customInputSection && customInputSection.parentNode === guidanceOptions) {
            guidanceOptions.insertBefore(customDisplay, customInputSection);
          } else {
            guidanceOptions.appendChild(customDisplay);
          }
        }
      }
    }

    // 更新显示内容
    const optionText = customDisplay.querySelector('.option-text');
    if (optionText) {
      optionText.textContent = answer;
    }
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  const app = new DiagnosisApp();
  window.diagnosisApp = app; // 全局访问
});
