// script.js - 主脚本文件
import { createHeader, initHeader } from './components/header.js';
import { createFooter, initFooter } from './components/footer.js';

// 全局初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化页面结构
  initPageStructure();

  // 初始化组件
  initHeader();
  initFooter();

  // 添加背景装饰元素
  addBackgroundDecoration();

  // 初始化工具提示
  initTooltips();

  // 初始化动画效果
  initAnimations();

  // 初始化通用事件监听器
  initEventListeners();
});

// 初始化页面结构
function initPageStructure() {
  // 添加头部
  const headerElement = document.querySelector('header');
  if (!headerElement) {
    const header = document.createElement('header');
    header.innerHTML = createHeader();
    document.body.insertBefore(header, document.body.firstChild);
  }

  // 添加主体容器
  const mainElement = document.querySelector('main');
  if (!mainElement) {
    const main = document.createElement('main');
    main.className = 'main-content';

    // 获取页面内容
    const content = document.querySelector('.container') || document.querySelector('.main-content');
    if (content) {
      const oldContent = content.innerHTML;
      main.innerHTML = oldContent;
      content.parentNode.replaceChild(main, content);
    } else {
      document.body.appendChild(main);
    }
  }

  // 添加页脚
  const footerElement = document.querySelector('footer');
  if (!footerElement) {
    const footer = document.createElement('footer');
    footer.innerHTML = createFooter();
    document.body.appendChild(footer);
  }

  // 添加页面类
  const pageName = window.location.pathname.split('/').pop().split('.')[0];
  if (pageName) {
    document.body.classList.add(`${pageName}-page`);
  }

  // 添加背景装饰容器
  if (!document.querySelector('.background-deco')) {
    const decoContainer = document.createElement('div');
    decoContainer.className = 'background-deco';
    document.body.insertBefore(decoContainer, document.body.firstChild);
  }
}

// 添加背景装饰
function addBackgroundDecoration() {
  const decoContainer = document.querySelector('.background-deco');
  if (!decoContainer) return;

  const circles = [
    { class: 'circle-1', size: 400 },
    { class: 'circle-2', size: 300 },
    { class: 'circle-3', size: 200 },
    { class: 'circle-4', size: 150 }
  ];

  circles.forEach(circle => {
    const div = document.createElement('div');
    div.className = `deco-circle ${circle.class}`;
    decoContainer.appendChild(div);
  });
}

// 初始化工具提示
function initTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');

  tooltipElements.forEach(element => {
    element.addEventListener('mouseenter', function(e) {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = this.getAttribute('data-tooltip');

      // 定位工具提示
      const rect = this.getBoundingClientRect();
      tooltip.style.position = 'fixed';
      tooltip.style.top = rect.top - 40 + 'px';
      tooltip.style.left = rect.left + (rect.width / 2) + 'px';
      tooltip.style.transform = 'translateX(-50%)';

      // 添加样式
      tooltip.style.background = 'rgba(30, 41, 59, 0.95)';
      tooltip.style.color = 'white';
      tooltip.style.padding = '8px 12px';
      tooltip.style.borderRadius = '6px';
      tooltip.style.fontSize = '12px';
      tooltip.style.fontWeight = '500';
      tooltip.style.zIndex = '10000';
      tooltip.style.whiteSpace = 'nowrap';
      tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      tooltip.style.backdropFilter = 'blur(10px)';

      document.body.appendChild(tooltip);

      // 移除工具提示
      element.addEventListener('mouseleave', () => {
        tooltip.remove();
      }, { once: true });
    });
  });
}

// 初始化动画效果
function initAnimations() {
  // 添加滚动动画
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // 观察需要动画的元素
  document.querySelectorAll('.feature-card, .stat-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// 初始化通用事件监听器
function initEventListeners() {
  // 按钮涟漪效果
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
      // 创建涟漪元素
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.7);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                top: ${y}px;
                left: ${x}px;
            `;

      this.appendChild(ripple);

      // 动画结束后移除涟漪元素
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // 添加CSS动画
  if (!document.querySelector('#ripple-animation')) {
    const style = document.createElement('style');
    style.id = 'ripple-animation';
    style.textContent = `
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
    document.head.appendChild(style);
  }

  // 表单输入效果
  document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.classList.remove('focused');
      }
    });
  });

  // 页面加载完成动画
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 100);
}

// 显示消息提示
export function showMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;
  messageDiv.innerHTML = `
        <div class="message-content">
            <i class="fas fa-${getMessageIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="message-close"><i class="fas fa-times"></i></button>
    `;

  // 添加样式
  messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        padding: 16px;
        border-radius: 12px;
        background: ${getMessageColor(type)};
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        animation: slideIn 0.3s ease forwards;
    `;

  // 添加动画
  const style = document.createElement('style');
  style.textContent = `
        @keyframes slideIn {
            to { transform: translateX(0); }
        }
        @keyframes slideOut {
            from { transform: translateX(0); }
            to { transform: translateX(400px); }
        }
    `;
  document.head.appendChild(style);

  document.body.appendChild(messageDiv);

  // 关闭按钮
  const closeBtn = messageDiv.querySelector('.message-close');
  closeBtn.addEventListener('click', () => {
    messageDiv.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      messageDiv.remove();
      style.remove();
    }, 300);
  });

  // 自动关闭
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => {
        messageDiv.remove();
        style.remove();
      }, 300);
    }
  }, 5000);

  return messageDiv;
}

function getMessageIcon(type) {
  const icons = {
    'success': 'check-circle',
    'error': 'exclamation-circle',
    'warning': 'exclamation-triangle',
    'info': 'info-circle'
  };
  return icons[type] || 'info-circle';
}

function getMessageColor(type) {
  const colors = {
    'success': 'linear-gradient(135deg, var(--success-color), #0da67a)',
    'error': 'linear-gradient(135deg, var(--danger-color), #dc2626)',
    'warning': 'linear-gradient(135deg, var(--warning-color), #d97706)',
    'info': 'linear-gradient(135deg, var(--primary-blue-500), var(--primary-blue-600))'
  };
  return colors[type] || colors.info;
}

// 加载状态管理
export function showLoading(container, message = '加载中...') {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-overlay';
  loadingDiv.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <div class="loading-text">${message}</div>
        </div>
    `;

  loadingDiv.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        border-radius: inherit;
    `;

  container.style.position = 'relative';
  container.appendChild(loadingDiv);

  return loadingDiv;
}
// 添加连接检查函数
async function checkBackendConnection() {
  const statusElement = document.getElementById('connectionStatus');
  if (!statusElement) return;

  try {
    // 动态导入API服务
    const { signLanguageAPI } = await import('./js/api_service.js');
    const health = await signLanguageAPI.checkHealth();

    if (health.status === 'ok') {
      statusElement.innerHTML = '<i class="fas fa-circle" style="color: #4CAF50"></i> <span>后端服务已连接</span>';
      statusElement.className = 'connection-status connected';
    } else {
      statusElement.innerHTML = '<i class="fas fa-circle" style="color: #ff9800"></i> <span>后端服务异常</span>';
      statusElement.className = 'connection-status warning';
    }
  } catch (error) {
    statusElement.innerHTML = '<i class="fas fa-circle" style="color: #f44336"></i> <span>无法连接后端服务</span>';
    statusElement.className = 'connection-status disconnected';
    console.warn('后端服务未启动，将使用模拟数据');
  }
}

// 页面加载时检查连接
document.addEventListener('DOMContentLoaded', () => {
  checkBackendConnection();
  // 如果是首页，更新准确率显示
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    updateHomePageAccuracy();
  }
});

// 更新首页的准确率显示
function updateHomePageAccuracy() {
  try {
    // 从localStorage加载历史记录
    const stored = localStorage.getItem('diagnosisHistory');
    if (!stored) {
      return; // 没有历史记录，保持默认值
    }
    
    const history = JSON.parse(stored);
    if (history.length === 0) {
      return; // 历史记录为空，保持默认值
    }
    
    // 计算准确率：未标记为错误的记录占比
    const correctCount = history.filter(item => !item.isError).length;
    const accuracy = Math.round((correctCount / history.length) * 100);
    
    // 更新准确率显示
    const confidenceFill = document.querySelector('.confidence-fill');
    const confidenceText = document.querySelector('.result-confidence span:last-child');
    
    if (confidenceFill) {
      confidenceFill.style.width = `${accuracy}%`;
    }
    if (confidenceText) {
      confidenceText.textContent = `${accuracy}%`;
    }
  } catch (e) {
    console.warn('更新首页准确率失败:', e);
  }
}

export function hideLoading(container) {
  const loadingDiv = container.querySelector('.loading-overlay');
  if (loadingDiv) {
    loadingDiv.remove();
  }
}
