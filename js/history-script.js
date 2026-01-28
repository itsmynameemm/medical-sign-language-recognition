// history-script.js - 历史记录页面脚本

class HistoryApp {
  constructor() {
    this.history = [];
    this.filteredHistory = [];
    this.filters = {
      timeRange: 'month',
      startDate: '',
      endDate: '',
      recognitionType: 'all',
      confidenceLevel: 'all'
    };
    this.chart = null; // 图表实例
    this.init();
  }

  init() {
    this.loadHistory();
    this.initEventListeners();
    this.initDateInputs();
    this.updateStats();
    this.renderRecords();
    this.updateInsights();
    // 延迟初始化图表，确保Chart.js已加载
    setTimeout(() => {
      this.initChart();
    }, 100);
  }

  initDateInputs() {
    // 设置默认日期范围（起始日期为2025年1月1日）
    const now = new Date();
    const firstDay = new Date(2025, 0, 1); // 2025年1月1日
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    // 设置起始日期为2025年1月1日
    if (startDateInput) {
      startDateInput.value = firstDay.toISOString().split('T')[0];
      this.filters.startDate = startDateInput.value;
    }
    
    // 如果结束日期为空，设置为当前月的最后一天
    if (endDateInput && !endDateInput.value) {
      endDateInput.value = lastDay.toISOString().split('T')[0];
      this.filters.endDate = endDateInput.value;
    }
  }

  loadHistory() {
    // 从localStorage加载历史记录
    const stored = localStorage.getItem('diagnosisHistory');
    if (stored) {
      try {
        this.history = JSON.parse(stored);
        // 兼容旧数据格式：为没有id和isError字段的记录添加默认值
        this.history = this.history.map((item, index) => {
          if (!item.id) {
            item.id = `legacy_${index}_${Date.now()}`;
          }
          if (item.isError === undefined) {
            item.isError = false;
          }
          return item;
        });
      } catch (e) {
        console.error('加载历史记录失败:', e);
        this.history = [];
      }
    }
    this.filteredHistory = [...this.history];
  }

  initEventListeners() {
    // 筛选条件变化
    document.getElementById('timeRange').addEventListener('change', (e) => {
      this.filters.timeRange = e.target.value;
      this.applyFilters();
    });

    document.getElementById('startDate').addEventListener('change', (e) => {
      this.filters.startDate = e.target.value;
      this.applyFilters();
    });

    document.getElementById('endDate').addEventListener('change', (e) => {
      this.filters.endDate = e.target.value;
      this.applyFilters();
    });

    document.getElementById('recognitionType').addEventListener('change', (e) => {
      this.filters.recognitionType = e.target.value;
      this.applyFilters();
    });

    document.getElementById('confidenceLevel').addEventListener('change', (e) => {
      this.filters.confidenceLevel = e.target.value;
      this.applyFilters();
    });

    // 筛选按钮
    document.getElementById('applyFilters').addEventListener('click', () => {
      this.applyFilters();
    });

    document.getElementById('resetFilters').addEventListener('click', () => {
      this.resetFilters();
    });

    // 记录操作
    document.getElementById('selectAll').addEventListener('click', () => {
      this.selectAllRecords();
    });

    document.getElementById('deleteSelected').addEventListener('click', () => {
      this.deleteSelectedRecords();
    });

    // 导出功能
    document.querySelectorAll('.export-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const format = e.currentTarget.dataset.format;
        this.exportData(format);
      });
    });

    document.getElementById('exportAll').addEventListener('click', () => {
      this.exportAllData();
    });
  }

  applyFilters() {
    let filtered = [...this.history];

    // 时间范围筛选
    if (this.filters.timeRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (this.filters.timeRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'yesterday':
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          const yesterdayEnd = new Date(startDate);
          yesterdayEnd.setHours(23, 59, 59, 999);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= startDate && itemDate <= yesterdayEnd;
          });
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      if (this.filters.timeRange !== 'yesterday') {
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.timestamp);
          return itemDate >= startDate && itemDate <= now;
        });
      }
    }

    // 自定义日期范围
    if (this.filters.startDate && this.filters.endDate) {
      const start = new Date(this.filters.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(this.filters.endDate);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= start && itemDate <= end;
      });
    }

    this.filteredHistory = filtered;
    this.updateStats();
    this.renderRecords();
    this.updateChart();
  }

  resetFilters() {
    this.filters = {
      timeRange: 'month',
      startDate: '',
      endDate: '',
      recognitionType: 'all',
      confidenceLevel: 'all'
    };

    document.getElementById('timeRange').value = 'month';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('recognitionType').value = 'all';
    document.getElementById('confidenceLevel').value = 'all';

    this.applyFilters();
  }

  updateStats() {
    const data = this.filteredHistory.length > 0 ? this.filteredHistory : this.history;
    
    // 总识别次数
    const totalCount = data.length;
    
    // 今日识别次数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= today;
    }).length;

    // 计算准确率（未标记为错误的记录占比）
    const correctCount = data.filter(item => !item.isError).length;
    const accuracy = totalCount > 0 ? ((correctCount / totalCount) * 100).toFixed(1) : 0;

    // 最常识别症状（统计出现频率最高的）
    const symptomCounts = {};
    data.forEach(item => {
      const symptom = item.text || '未知';
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
    const mostCommon = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])[0];
    const mostCommonSymptom = mostCommon ? mostCommon[0] : '无';

    // 计算趋势数据
    const trends = this.calculateTrends(data);

    // 更新统计卡片
    this.updateStatCard('.stat-card-lg:nth-child(1) .stat-number-lg', totalCount);
    this.updateStatCard('.stat-card-lg:nth-child(2) .stat-number-lg', todayCount);
    this.updateStatCard('.stat-card-lg:nth-child(3) .stat-number-lg', `${accuracy}%`);
    this.updateStatCard('.stat-card-lg:nth-child(4) .stat-number-lg', mostCommonSymptom);

    // 更新趋势显示
    this.updateTrend('.stat-card-lg:nth-child(1) .stat-trend', trends.totalTrend);
    this.updateTrend('.stat-card-lg:nth-child(2) .stat-trend', trends.todayTrend);
    this.updateTrend('.stat-card-lg:nth-child(3) .stat-trend', trends.accuracyTrend);
    this.updateTrend('.stat-card-lg:nth-child(4) .stat-trend', trends.symptomTrend);
  }

  calculateTrends(data) {
    const now = new Date();
    
    // 计算本周数据
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay()); // 本周一
    thisWeekStart.setHours(0, 0, 0, 0);
    const thisWeekData = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= thisWeekStart;
    });

    // 计算上周数据
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);
    const lastWeekData = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= lastWeekStart && itemDate <= lastWeekEnd;
    });

    // 计算今天数据
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayData = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= todayStart;
    });

    // 计算昨天数据
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);
    yesterdayEnd.setMilliseconds(-1);
    const yesterdayData = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= yesterdayStart && itemDate <= yesterdayEnd;
    });

    // 计算本周准确率
    const thisWeekCorrect = thisWeekData.filter(item => !item.isError).length;
    const thisWeekAccuracy = thisWeekData.length > 0 ? (thisWeekCorrect / thisWeekData.length) * 100 : 0;

    // 计算上周准确率
    const lastWeekCorrect = lastWeekData.filter(item => !item.isError).length;
    const lastWeekAccuracy = lastWeekData.length > 0 ? (lastWeekCorrect / lastWeekData.length) * 100 : 0;

    // 计算总识别次数趋势（比昨天）
    const totalTrend = this.calculatePercentageChange(thisWeekData.length, yesterdayData.length, '比昨天');

    // 计算今日识别次数趋势（比昨天）
    const todayTrend = this.calculatePercentageChange(todayData.length, yesterdayData.length, '比昨天');

    // 计算准确率趋势（比昨天）
    const todayCorrect = todayData.filter(item => !item.isError).length;
    const todayAccuracy = todayData.length > 0 ? (todayCorrect / todayData.length) * 100 : 0;
    const yesterdayCorrect = yesterdayData.filter(item => !item.isError).length;
    const yesterdayAccuracy = yesterdayData.length > 0 ? (yesterdayCorrect / yesterdayData.length) * 100 : 0;
    const accuracyTrend = this.calculatePercentageChange(todayAccuracy, yesterdayAccuracy, '比昨天', true);

    // 最常识别症状趋势（简化处理，显示无变化）
    const symptomTrend = {
      text: '无数据',
      class: ''
    };

    return {
      totalTrend,
      todayTrend,
      accuracyTrend,
      symptomTrend
    };
  }

  calculatePercentageChange(current, previous, label, isPercentage = false) {
    if (previous === 0) {
      if (current === 0) {
        return {
          text: '无数据',
          class: ''
        };
      } else {
        return {
          text: `${label}新增 ${current}${isPercentage ? '%' : '次'}`,
          class: 'trend-up'
        };
      }
    }

    const change = ((current - previous) / previous) * 100;
    const absChange = Math.abs(change).toFixed(1);

    if (change > 0) {
      return {
        text: `${label}增加 ${absChange}%`,
        class: 'trend-up'
      };
    } else if (change < 0) {
      return {
        text: `${label}减少 ${absChange}%`,
        class: 'trend-down'
      };
    } else {
      return {
        text: `${label}无变化`,
        class: ''
      };
    }
  }

  updateTrend(selector, trend) {
    const element = document.querySelector(selector);
    if (element) {
      // 移除所有趋势类
      element.classList.remove('trend-up', 'trend-down');
      
      if (trend.class) {
        element.classList.add(trend.class);
      }
      
      // 更新文本和图标
      if (trend.text === '无数据') {
        element.innerHTML = '<span>暂无数据</span>';
      } else {
        const icon = trend.class === 'trend-up' 
          ? '<i class="fas fa-arrow-up"></i>' 
          : trend.class === 'trend-down' 
          ? '<i class="fas fa-arrow-down"></i>' 
          : '';
        element.innerHTML = `${icon} ${trend.text}`;
      }
    }
  }

  updateStatCard(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }

  renderRecords() {
    const recordsList = document.getElementById('recordsList');
    
    if (this.filteredHistory.length === 0) {
      recordsList.innerHTML = `
        <div class="empty-records">
          <i class="fas fa-inbox"></i>
          <h3>暂无记录</h3>
          <p>根据当前筛选条件，没有找到匹配的历史记录</p>
        </div>
      `;
      return;
    }

    recordsList.innerHTML = '';
    this.filteredHistory.forEach((record, index) => {
      const recordItem = this.createRecordItem(record, index);
      recordsList.appendChild(recordItem);
    });
  }

  createRecordItem(record, index) {
    const item = document.createElement('div');
    item.className = 'record-item';
    
    const date = new Date(record.timestamp);
    const timeStr = date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 确定状态（根据isError字段）
    const statusClass = record.isError ? 'status-error' : 'status-success';
    const statusText = record.isError ? '识别错误' : '识别成功';

    item.innerHTML = `
      <div class="record-status ${statusClass}"></div>
      <div class="record-details">
        <div class="record-title">${record.text || '未知'}</div>
        <div class="record-description">${statusText}</div>
        <div class="record-meta">
          <div class="record-meta-item">
            <i class="fas fa-clock"></i>
            <span>${timeStr}</span>
          </div>
          ${record.confidence ? `
            <div class="record-meta-item">
              <i class="fas fa-percentage"></i>
              <span>置信度: ${(record.confidence * 100).toFixed(1)}%</span>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="record-actions">
        <button class="record-action-btn" data-action="view" data-index="${index}" title="查看详情">
          <i class="fas fa-eye"></i>
        </button>
        <button class="record-action-btn" data-action="delete" data-index="${index}" title="删除">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    // 添加事件监听
    item.querySelectorAll('.record-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const idx = parseInt(btn.dataset.index);
        
        if (action === 'view') {
          this.viewRecordDetail(this.filteredHistory[idx]);
        } else if (action === 'delete') {
          this.deleteRecord(idx);
        }
      });
    });

    // 点击整行查看详情
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.record-actions')) {
        this.viewRecordDetail(record);
      }
    });

    return item;
  }

  viewRecordDetail(record) {
    const date = new Date(record.timestamp);
    const detail = `
识别时间: ${date.toLocaleString('zh-CN')}
识别结果: ${record.text || '未知'}
识别状态: ${record.isError ? '识别错误' : '识别成功'}
${record.confidence ? `置信度: ${(record.confidence * 100).toFixed(1)}%` : ''}
    `.trim();

    alert(detail);
  }

  deleteRecord(index) {
    if (confirm('确定要删除这条记录吗？')) {
      const record = this.filteredHistory[index];
      // 从原始历史记录中删除
      const originalIndex = this.history.findIndex(item => 
        item.timestamp === record.timestamp && item.text === record.text
      );
      
      if (originalIndex !== -1) {
        this.history.splice(originalIndex, 1);
        localStorage.setItem('diagnosisHistory', JSON.stringify(this.history));
        this.applyFilters();
        showMessage('记录已删除', 'success');
      }
    }
  }

  selectAllRecords() {
    // 实现全选功能（如果需要复选框）
    showMessage('全选功能待实现', 'info');
  }

  deleteSelectedRecords() {
    // 实现删除选中功能
    showMessage('删除选中功能待实现', 'info');
  }

  exportData(format) {
    const data = this.filteredHistory.length > 0 ? this.filteredHistory : this.history;
    
    if (data.length === 0) {
      showMessage('没有数据可导出', 'warning');
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `历史记录_${new Date().getTime()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = this.convertToCSV(data);
        filename = `历史记录_${new Date().getTime()}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        showMessage('该格式暂不支持', 'warning');
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    showMessage('导出成功', 'success');
  }

  convertToCSV(data) {
    const headers = ['时间', '识别结果', '状态', '置信度'];
    const rows = data.map(item => {
      const date = new Date(item.timestamp);
      return [
        date.toLocaleString('zh-CN'),
        item.text || '未知',
        item.isError ? '识别错误' : '识别成功',
        item.confidence ? `${(item.confidence * 100).toFixed(1)}%` : '-'
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  exportAllData() {
    this.exportData('json');
  }

  updateInsights() {
    const data = this.history;
    
    if (data.length === 0) {
      // 没有数据时显示默认提示
      this.updateInsightCard('.insight-card:nth-child(1)', {
        title: '活跃时间段',
        content: '暂无使用数据，开始使用后将显示您的活跃时间段分析。'
      });
      this.updateInsightCard('.insight-card:nth-child(2)', {
        title: '进步显著',
        content: '暂无使用数据，开始使用后将显示您的进步情况分析。'
      });
      this.updateInsightCard('.insight-card:nth-child(3)', {
        title: '学习建议',
        content: '暂无使用数据，开始使用后将根据您的识别情况提供学习建议。'
      });
      return;
    }

    // 计算活跃时间段
    const hourCounts = {};
    data.forEach(item => {
      const date = new Date(item.timestamp);
      const hour = date.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const mostActiveHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    let activeTimeText = '暂无数据';
    if (mostActiveHour) {
      const hour = parseInt(mostActiveHour[0]);
      const count = mostActiveHour[1];
      const timeRange = `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`;
      const avgPerDay = (count / Math.max(1, this.getDaysWithData(data))).toFixed(1);
      activeTimeText = `您最活跃的时间是 <strong>${timeRange}</strong>，平均每天在此时间段进行${avgPerDay}次识别。建议保持这一良好的使用习惯。`;
    }

    // 计算进步情况（比较本月和上月）
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonthData = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= thisMonthStart;
    });

    const lastMonthData = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= lastMonthStart && itemDate <= lastMonthEnd;
    });

    const thisMonthAccuracy = thisMonthData.length > 0 
      ? ((thisMonthData.filter(item => !item.isError).length / thisMonthData.length) * 100).toFixed(1)
      : 0;
    
    const lastMonthAccuracy = lastMonthData.length > 0
      ? ((lastMonthData.filter(item => !item.isError).length / lastMonthData.length) * 100).toFixed(1)
      : 0;

    let progressText = '暂无数据';
    if (thisMonthData.length > 0 && lastMonthData.length > 0) {
      const accuracyChange = (parseFloat(thisMonthAccuracy) - parseFloat(lastMonthAccuracy)).toFixed(1);
      if (accuracyChange > 0) {
        progressText = `与上月相比，您的识别准确率提升了 <strong>${accuracyChange}%</strong>，从${lastMonthAccuracy}%提高到${thisMonthAccuracy}%，进步非常明显！`;
      } else if (accuracyChange < 0) {
        progressText = `与上月相比，您的识别准确率下降了 <strong>${Math.abs(accuracyChange)}%</strong>，建议多练习以提高识别准确率。`;
      } else {
        progressText = `与上月相比，您的识别准确率保持稳定，为 <strong>${thisMonthAccuracy}%</strong>，继续保持！`;
      }
    } else if (thisMonthData.length > 0) {
      progressText = `本月识别准确率为 <strong>${thisMonthAccuracy}%</strong>，继续努力提升识别准确率！`;
    }

    // 计算学习建议（找出识别错误最多的症状）
    const errorCounts = {};
    data.filter(item => item.isError).forEach(item => {
      const symptom = item.text || '未知';
      errorCounts[symptom] = (errorCounts[symptom] || 0) + 1;
    });

    const successCounts = {};
    data.filter(item => !item.isError).forEach(item => {
      const symptom = item.text || '未知';
      successCounts[symptom] = (successCounts[symptom] || 0) + 1;
    });

    let suggestionText = '暂无数据';
    if (Object.keys(errorCounts).length > 0) {
      const mostErrorSymptom = Object.entries(errorCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
      const errorCount = errorCounts[mostErrorSymptom];
      suggestionText = `您对"${mostErrorSymptom}"的识别错误次数较多（${errorCount}次），建议重点练习相关手语动作，提高识别准确率。`;
    } else if (Object.keys(successCounts).length > 0) {
      suggestionText = `您已掌握多种手语识别，当前识别准确率良好。建议继续练习以保持和提高识别水平。`;
    }

    // 更新洞察卡片
    this.updateInsightCard('.insight-card:nth-child(1)', {
      title: '活跃时间段',
      content: activeTimeText
    });

    this.updateInsightCard('.insight-card:nth-child(2)', {
      title: '进步显著',
      content: progressText
    });

    this.updateInsightCard('.insight-card:nth-child(3)', {
      title: '学习建议',
      content: suggestionText
    });
  }

  updateInsightCard(selector, data) {
    const card = document.querySelector(selector);
    if (card) {
      const titleEl = card.querySelector('.insight-title');
      const contentEl = card.querySelector('.insight-content');
      
      if (titleEl) {
        titleEl.textContent = data.title;
      }
      
      if (contentEl) {
        contentEl.innerHTML = data.content;
      }
    }
  }

  getDaysWithData(data) {
    const days = new Set();
    data.forEach(item => {
      const date = new Date(item.timestamp);
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      days.add(dayKey);
    });
    return days.size || 1;
  }

  // 初始化图表
  initChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // 检查Chart.js是否已加载
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js未加载，图表功能不可用');
      return;
    }

    // 销毁已存在的图表
    if (this.chart) {
      this.chart.destroy();
    }

    // 准备数据
    const chartData = this.prepareChartData();

    // 创建图表
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: '识别次数',
            data: chartData.recognitionCounts,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y',
          },
          {
            label: '准确率',
            data: chartData.accuracyRates,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: '识别趋势分析',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
            },
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.datasetIndex === 0) {
                  label += context.parsed.y + ' 次';
                } else {
                  label += context.parsed.y + '%';
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '日期',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: '识别次数',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return value + ' 次';
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: '准确率 (%)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              drawOnChartArea: false,
            },
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }

  // 准备图表数据
  prepareChartData() {
    const data = this.filteredHistory.length > 0 ? this.filteredHistory : this.history;
    
    if (data.length === 0) {
      return {
        labels: [],
        recognitionCounts: [],
        accuracyRates: []
      };
    }

    // 按日期分组数据
    const dateGroups = {};
    data.forEach(item => {
      const date = new Date(item.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD格式
      
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = {
          total: 0,
          correct: 0
        };
      }
      
      dateGroups[dateKey].total++;
      if (!item.isError) {
        dateGroups[dateKey].correct++;
      }
    });

    // 排序日期
    const sortedDates = Object.keys(dateGroups).sort();
    
    // 准备标签和数据
    const labels = sortedDates.map(date => {
      const d = new Date(date);
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${month}-${day}`;
    });
    
    const recognitionCounts = sortedDates.map(date => dateGroups[date].total);
    const accuracyRates = sortedDates.map(date => {
      const group = dateGroups[date];
      return group.total > 0 ? Math.round((group.correct / group.total) * 100) : 0;
    });

    return {
      labels,
      recognitionCounts,
      accuracyRates
    };
  }

  // 更新图表
  updateChart() {
    // 如果图表未初始化，先初始化
    if (!this.chart) {
      // 延迟初始化，确保Chart.js已加载
      setTimeout(() => {
        this.initChart();
      }, 100);
      return;
    }

    const chartData = this.prepareChartData();
    
    // 更新图表数据
    this.chart.data.labels = chartData.labels;
    this.chart.data.datasets[0].data = chartData.recognitionCounts;
    this.chart.data.datasets[1].data = chartData.accuracyRates;
    
    // 更新图表
    this.chart.update('active');
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  const app = new HistoryApp();
  window.historyApp = app; // 全局访问
});

