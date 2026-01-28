// dictionary-script.js - 手语词库页面脚本
import { showMessage } from './script.js';

class DictionaryApp {
  constructor() {
    // 根据实际的手语标签定义19个手语词汇，并添加对应的图片路径
    this.signWords = [
      { id: 1, chinese: '感冒', pinyin: 'gǎnmào', category: 'symptom', description: '上呼吸道感染引起的常见疾病', difficulty: '初级', icon: 'fas fa-thermometer-half', image: 'img/cold.png' },
      { id: 2, chinese: '天', pinyin: 'tiān', category: 'time', description: '时间单位，24小时为一天', difficulty: '初级', icon: 'fas fa-calendar-day', image: 'img/day.png' },
      { id: 3, chinese: '发热', pinyin: 'fārè', category: 'symptom', description: '体温升高，身体发热的症状', difficulty: '初级', icon: 'fas fa-thermometer-full', image: 'img/fever.png' },
      { id: 4, chinese: '五', pinyin: 'wǔ', category: 'number', description: '数字五', difficulty: '初级', icon: 'fas fa-hashtag', image: 'img/five.png' },
      { id: 5, chinese: '四', pinyin: 'sì', category: 'number', description: '数字四', difficulty: '初级', icon: 'fas fa-hashtag', image: 'img/four.png' },
      { id: 6, chinese: '手', pinyin: 'shǒu', category: 'body', description: '人体上肢的一部分', difficulty: '初级', icon: 'fas fa-hand-paper', image: 'img/hand.png' },
      { id: 7, chinese: '头', pinyin: 'tóu', category: 'body', description: '人体最上部的器官', difficulty: '初级', icon: 'fas fa-head-side-virus', image: 'img/head.png' },
      { id: 8, chinese: '心脏', pinyin: 'xīnzàng', category: 'body', description: '人体重要的循环器官', difficulty: '中级', icon: 'fas fa-heartbeat', image: 'img/heart.jpg' },
      { id: 9, chinese: '小时', pinyin: 'xiǎoshí', category: 'time', description: '时间单位，60分钟为一小时', difficulty: '初级', icon: 'fas fa-clock', image: 'img/hour.png' },
      { id: 10, chinese: '分钟', pinyin: 'fēnzhōng', category: 'time', description: '时间单位，60秒为一分钟', difficulty: '初级', icon: 'fas fa-hourglass-half', image: 'img/minute.png' },
      { id: 11, chinese: '恶心', pinyin: 'ěxīn', category: 'symptom', description: '想要呕吐的感觉', difficulty: '中级', icon: 'fas fa-dizzy', image: 'img/nausea.png' },
      { id: 12, chinese: '脖子', pinyin: 'bózi', category: 'body', description: '连接头部和躯干的部分', difficulty: '初级', icon: 'fas fa-user-md', image: 'img/neck.png' },
      { id: 13, chinese: '九', pinyin: 'jiǔ', category: 'number', description: '数字九', difficulty: '初级', icon: 'fas fa-hashtag', image: 'img/nine.png' },
      { id: 14, chinese: '一', pinyin: 'yī', category: 'number', description: '数字一', difficulty: '初级', icon: 'fas fa-hashtag', image: 'img/one.png' },
      { id: 15, chinese: '七', pinyin: 'qī', category: 'number', description: '数字七', difficulty: '初级', icon: 'fas fa-hashtag', image: 'img/seven.png' },
      { id: 16, chinese: '六', pinyin: 'liù', category: 'number', description: '数字六', difficulty: '初级', icon: 'fas fa-hashtag', image: 'img/six.png' },
      { id: 17, chinese: '十', pinyin: 'shí', category: 'number', description: '数字十', difficulty: '初级', icon: 'fas fa-hashtag', image: 'img/ten.png' },
      { id: 18, chinese: '三', pinyin: 'sān', category: 'number', description: '数字三', difficulty: '初级', icon: 'fas fa-hashtag', image: 'img/three.png' },
      { id: 19, chinese: '二', pinyin: 'èr', category: 'number', description: '数字二', difficulty: '初级', icon: 'fas fa-hashtag', image: 'img/two.png' }
    ];

    this.currentFilter = 'all';
    this.currentPage = 1;
    this.itemsPerPage = 9;
    this.searchQuery = '';
    this.learningProgress = this.loadLearningProgress();
    
    this.init();
  }

  init() {
    this.initEventListeners();
    this.renderWords();
    this.updateStats();
    this.updateLearningProgress();
    this.renderPracticeWords();
  }

  initEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('dictionarySearch');
    const searchBtn = document.querySelector('.search-section .btn-primary');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.currentPage = 1;
        this.renderWords();
        this.updateStats();
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.searchQuery = searchInput.value.toLowerCase();
        this.currentPage = 1;
        this.renderWords();
        this.updateStats();
      });
    }

    // 筛选标签
    document.querySelectorAll('.filter-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        // 移除所有active类
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        // 添加active类到当前标签
        e.currentTarget.classList.add('active');
        this.currentFilter = e.currentTarget.dataset.filter;
        this.currentPage = 1;
        this.renderWords();
        this.updateStats();
      });
    });

    // 分类卡片
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        // 设置对应的筛选标签为active
        document.querySelectorAll('.filter-tag').forEach(t => {
          t.classList.remove('active');
          if (t.dataset.filter === category) {
            t.classList.add('active');
          }
        });
        this.currentFilter = category;
        this.currentPage = 1;
        this.renderWords();
        this.updateStats();
      });
    });

    // 排序按钮
    const sortAlphabetically = document.getElementById('sortAlphabetically');
    const sortByDifficulty = document.getElementById('sortByDifficulty');

    if (sortAlphabetically) {
      sortAlphabetically.addEventListener('click', () => {
        this.sortWords('alphabetical');
        this.renderWords();
      });
    }

    if (sortByDifficulty) {
      sortByDifficulty.addEventListener('click', () => {
        this.sortWords('difficulty');
        this.renderWords();
      });
    }

    // 分页按钮
    this.initPagination();
  }

  getFilteredWords() {
    let filtered = [...this.signWords];

    // 应用搜索过滤
    if (this.searchQuery) {
      filtered = filtered.filter(word => 
        word.chinese.toLowerCase().includes(this.searchQuery) ||
        word.pinyin.toLowerCase().includes(this.searchQuery) ||
        word.description.includes(this.searchQuery)
      );
    }

    // 应用分类过滤
    if (this.currentFilter !== 'all') {
      // 映射分类
      const categoryMap = {
        'symptom': 'symptom',
        'body': 'body',
        'time': 'time',
        'number': 'number',
        'action': 'action',
        'treatment': 'treatment',
        'emergency': 'emergency',
        'medication': 'medication'
      };
      
      const targetCategory = categoryMap[this.currentFilter];
      if (targetCategory) {
        filtered = filtered.filter(word => word.category === targetCategory);
      }
    }

    return filtered;
  }

  sortWords(sortType) {
    if (sortType === 'alphabetical') {
      this.signWords.sort((a, b) => a.chinese.localeCompare(b.chinese, 'zh-CN'));
    } else if (sortType === 'difficulty') {
      const difficultyOrder = { '初级': 1, '中级': 2, '高级': 3 };
      this.signWords.sort((a, b) => {
        return (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99);
      });
    }
  }

  renderWords() {
    const wordsGrid = document.getElementById('wordsGrid');
    if (!wordsGrid) return;

    const filtered = this.getFilteredWords();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedWords = filtered.slice(startIndex, endIndex);

    if (paginatedWords.length === 0) {
      wordsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <i class="fas fa-search" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
          <h3 style="color: var(--gray-600); margin-bottom: 0.5rem;">未找到相关词汇</h3>
          <p style="color: var(--gray-500);">请尝试其他搜索关键词或筛选条件</p>
        </div>
      `;
      return;
    }

    wordsGrid.innerHTML = paginatedWords.map(word => {
      const categoryName = this.getCategoryName(word.category);
      const isLearned = this.learningProgress.learned.includes(word.id);
      const isMastered = this.learningProgress.mastered.includes(word.id);
      
      return `
        <div class="word-card" data-word-id="${word.id}">
          <div class="word-header">
            <div class="word-text">
              <div class="word-chinese">${word.chinese}</div>
              <div class="word-pinyin">${word.pinyin}</div>
            </div>
            <div class="word-category">${categoryName}</div>
          </div>
          
          <div class="word-image">
            ${word.image ? 
              `<img src="${word.image}" alt="${word.chinese}" 
                    onerror="this.onerror=null; this.style.display='none'; const icon = this.parentElement.querySelector('.placeholder-image'); if(icon) icon.style.display='flex';" />
               <i class="${word.icon} placeholder-image" style="display: none;"></i>` :
              `<i class="${word.icon} placeholder-image"></i>`
            }
          </div>
          
          <div class="word-description">
            <p>${word.description}</p>
          </div>
          
          <div class="word-details">
            <div class="detail-item">
              <span class="detail-label">难度：</span>
              <span class="detail-value">${word.difficulty}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">分类：</span>
              <span class="detail-value">${categoryName}</span>
            </div>
          </div>
          
          <div class="word-actions">
            <button class="action-btn" onclick="dictionaryApp.toggleLearn(${word.id})">
              <i class="fas fa-${isLearned ? 'check' : 'book'}"></i>
              ${isLearned ? '已学习' : '学习'}
            </button>
            <button class="action-btn primary" onclick="dictionaryApp.viewDetails(${word.id})">
              <i class="fas fa-info-circle"></i>
              详情
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.updatePagination(filtered.length);
  }

  getCategoryName(category) {
    const categoryNames = {
      'symptom': '症状描述',
      'body': '身体部位',
      'time': '时间单位',
      'number': '数字',
      'action': '医疗动作',
      'treatment': '治疗相关',
      'emergency': '紧急情况',
      'medication': '药物相关'
    };
    return categoryNames[category] || '其他';
  }

  updateStats() {
    const filtered = this.getFilteredWords();
    const totalWords = this.signWords.length;
    const learnedCount = this.learningProgress.learned.length;
    
    const statsElement = document.querySelector('.search-stats');
    if (statsElement) {
      statsElement.innerHTML = `
        <span>共收录 <strong>${totalWords}</strong> 个医疗手语词汇</span>
        <span>您已学习 <strong>${learnedCount}</strong> 个词汇</span>
        ${this.searchQuery || this.currentFilter !== 'all' ? `<span>当前显示 <strong>${filtered.length}</strong> 个词汇</span>` : ''}
      `;
    }
  }

  updateLearningProgress() {
    const totalWords = this.signWords.length;
    const learnedCount = this.learningProgress.learned.length;
    const masteredCount = this.learningProgress.mastered.length;
    const progress = Math.round((learnedCount / totalWords) * 100);

    const progressValue = document.querySelector('.progress-value');
    const progressFill = document.querySelector('.progress-fill');
    const progressStats = document.querySelector('.progress-stats');

    if (progressValue) {
      progressValue.textContent = `${progress}%`;
    }

    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }

    if (progressStats) {
      progressStats.innerHTML = `
        <span>已学习: ${learnedCount}个</span>
        <span>待学习: ${totalWords - learnedCount}个</span>
        <span>已掌握: ${masteredCount}个</span>
      `;
    }
  }

  renderPracticeWords() {
    const practiceWords = this.getPracticeWords();
    const practiceContainer = document.querySelector('.practice-words');
    
    if (!practiceContainer) return;

    practiceContainer.innerHTML = practiceWords.map(word => {
      const isLearned = this.learningProgress.learned.includes(word.id);
      const isMastered = this.learningProgress.mastered.includes(word.id);
      
      let status = 'status-new';
      let statusText = '未学习';
      
      if (isMastered) {
        status = 'status-mastered';
        statusText = '已掌握';
      } else if (isLearned) {
        status = 'status-learning';
        statusText = '学习中';
      }

      return `
        <div class="practice-card" onclick="dictionaryApp.viewDetails(${word.id})">
          <div class="practice-word">${word.chinese}</div>
          <div class="practice-difficulty">${word.difficulty}难度</div>
          <div class="practice-status ${status}">${statusText}</div>
        </div>
      `;
    }).join('');
  }

  getPracticeWords() {
    // 返回推荐练习的词汇（优先选择未学习或学习中的）
    const unlearned = this.signWords.filter(w => !this.learningProgress.learned.includes(w.id));
    const learning = this.signWords.filter(w => 
      this.learningProgress.learned.includes(w.id) && 
      !this.learningProgress.mastered.includes(w.id)
    );
    
    const recommended = [...unlearned.slice(0, 2), ...learning.slice(0, 2)];
    return recommended.length >= 4 ? recommended.slice(0, 4) : this.signWords.slice(0, 4);
  }

  toggleLearn(wordId) {
    const word = this.signWords.find(w => w.id === wordId);
    if (!word) return;

    const index = this.learningProgress.learned.indexOf(wordId);
    
    if (index > -1) {
      // 已学习，取消学习
      this.learningProgress.learned.splice(index, 1);
      const masteredIndex = this.learningProgress.mastered.indexOf(wordId);
      if (masteredIndex > -1) {
        this.learningProgress.mastered.splice(masteredIndex, 1);
      }
      showMessage(`已取消学习"${word.chinese}"`, 'info');
    } else {
      // 未学习，添加到学习列表
      this.learningProgress.learned.push(wordId);
      showMessage(`已开始学习"${word.chinese}"`, 'success');
    }

    this.saveLearningProgress();
    this.renderWords();
    this.updateLearningProgress();
    this.renderPracticeWords();
  }

  viewDetails(wordId) {
    const word = this.signWords.find(w => w.id === wordId);
    if (!word) return;

    const categoryName = this.getCategoryName(word.category);
    const isLearned = this.learningProgress.learned.includes(word.id);
    const isMastered = this.learningProgress.mastered.includes(word.id);

    const details = `
手语词汇详情

词汇：${word.chinese}
拼音：${word.pinyin}
分类：${categoryName}
难度：${word.difficulty}
描述：${word.description}
学习状态：${isMastered ? '已掌握' : isLearned ? '学习中' : '未学习'}
    `;

    alert(details);
  }

  initPagination() {
    // 分页按钮事件在renderWords中通过updatePagination处理
  }

  updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    const pagination = document.querySelector('.pagination');
    
    if (!pagination) return;

    if (totalPages <= 1) {
      pagination.style.display = 'none';
      return;
    }

    pagination.style.display = 'flex';
    
    let paginationHTML = `
      <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
              onclick="dictionaryApp.goToPage(${this.currentPage - 1})" 
              ${this.currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>
    `;

    // 显示页码
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        paginationHTML += `
          <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                  onclick="dictionaryApp.goToPage(${i})">
            ${i}
          </button>
        `;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      }
    }

    paginationHTML += `
      <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
              onclick="dictionaryApp.goToPage(${this.currentPage + 1})" 
              ${this.currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>
    `;

    pagination.innerHTML = paginationHTML;
  }

  goToPage(page) {
    const filtered = this.getFilteredWords();
    const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    this.currentPage = page;
    this.renderWords();
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadLearningProgress() {
    try {
      const saved = localStorage.getItem('dictionaryLearningProgress');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('加载学习进度失败:', e);
    }
    
    return {
      learned: [],
      mastered: []
    };
  }

  saveLearningProgress() {
    try {
      localStorage.setItem('dictionaryLearningProgress', JSON.stringify(this.learningProgress));
    } catch (e) {
      console.warn('保存学习进度失败:', e);
    }
  }

  // 标记为已掌握
  markAsMastered(wordId) {
    const word = this.signWords.find(w => w.id === wordId);
    if (!word) return;

    if (!this.learningProgress.learned.includes(wordId)) {
      this.learningProgress.learned.push(wordId);
    }

    if (!this.learningProgress.mastered.includes(wordId)) {
      this.learningProgress.mastered.push(wordId);
      showMessage(`恭喜！您已掌握"${word.chinese}"`, 'success');
    } else {
      // 取消掌握
      const index = this.learningProgress.mastered.indexOf(wordId);
      this.learningProgress.mastered.splice(index, 1);
      showMessage(`已取消掌握"${word.chinese}"`, 'info');
    }

    this.saveLearningProgress();
    this.renderWords();
    this.updateLearningProgress();
    this.renderPracticeWords();
  }

  // 更新分类统计
  updateCategoryStats() {
    const categoryStats = {};
    
    this.signWords.forEach(word => {
      if (!categoryStats[word.category]) {
        categoryStats[word.category] = 0;
      }
      categoryStats[word.category]++;
    });

    // 更新分类卡片中的数量
    document.querySelectorAll('.category-card').forEach(card => {
      const category = card.dataset.category;
      const countElement = card.querySelector('.category-count');
      if (countElement && categoryStats[category]) {
        countElement.textContent = `${categoryStats[category]}个词汇`;
      }
    });
  }

  // 重置学习进度
  resetLearningProgress() {
    if (confirm('确定要重置所有学习进度吗？此操作不可恢复。')) {
      this.learningProgress = {
        learned: [],
        mastered: []
      };
      this.saveLearningProgress();
      this.renderWords();
      this.updateLearningProgress();
      this.renderPracticeWords();
      showMessage('学习进度已重置', 'info');
    }
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  const app = new DictionaryApp();
  window.dictionaryApp = app; // 全局访问，用于onclick事件
  
  // 更新分类统计
  app.updateCategoryStats();
});