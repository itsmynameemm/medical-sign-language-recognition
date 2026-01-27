// components/header.js
export function createHeader() {
  return `
    <header class="navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-logo">
                <div class="logo-icon">
                    <i class="fas fa-hands"></i>
                </div>
                <span>手语医疗助手</span>
            </a>

            <div class="nav-menu">
                <a href="index.html" class="nav-link active">
                    <i class="fas fa-home"></i>
                    <span>首页</span>
                </a>
                <a href="diagnosis.html" class="nav-link">
                    <i class="fas fa-stethoscope"></i>
                    <span>手语诊断</span>
                </a>
                <a href="dictionary.html" class="nav-link">
                    <i class="fas fa-book"></i>
                    <span>手语词库</span>
                </a>
                <a href="history.html" class="nav-link">
                    <i class="fas fa-history"></i>
                    <span>历史记录</span>
                </a>
            </div>

            <div class="nav-actions">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="搜索手语词库..." id="navSearch">
                </div>

                <div class="nav-user">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-info">
                        <div class="user-name">医生</div>
                        <div class="user-status">在线</div>
                    </div>
                </div>

                <button class="mobile-menu-btn" id="mobileMenuBtn">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>
    </header>
    `;
}

export function initHeader() {
  // 移动端菜单切换
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // 页面激活状态
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage ||
      (currentPage === '' && linkHref === 'index.html') ||
      (currentPage === 'index.html' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 搜索功能
  const searchInput = document.getElementById('navSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (e.target.value.trim()) {
        // 这里可以添加搜索逻辑
        console.log('搜索:', e.target.value);
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        // 搜索跳转到词典页面
        window.location.href = `dictionary.html?search=${encodeURIComponent(e.target.value)}`;
      }
    });
  }
}
