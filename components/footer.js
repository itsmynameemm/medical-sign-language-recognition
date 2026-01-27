// components/footer.js
export function createFooter() {
  return `
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <div class="footer-logo">
                    <i class="fas fa-hands"></i>
                    <span>手语医疗助手</span>
                </div>
                <p class="footer-description">
                    致力于为听障人士提供便捷的医疗服务，通过先进的手语识别技术，
                    消除医患沟通障碍，实现平等的医疗服务体验。
                </p>
                <div class="footer-social">
                    <a href="#" class="social-link">
                        <i class="fab fa-weibo"></i>
                    </a>
                    <a href="#" class="social-link">
                        <i class="fab fa-weixin"></i>
                    </a>
                    <a href="#" class="social-link">
                        <i class="fab fa-github"></i>
                    </a>
                    <a href="#" class="social-link">
                        <i class="fab fa-linkedin"></i>
                    </a>
                </div>
            </div>

            <div class="footer-section">
                <h3 class="footer-title">快速链接</h3>
                <ul class="footer-links">
                    <li><a href="index.html"><i class="fas fa-chevron-right"></i> 首页</a></li>
                    <li><a href="diagnosis.html"><i class="fas fa-chevron-right"></i> 手语诊断</a></li>
                    <li><a href="dictionary.html"><i class="fas fa-chevron-right"></i> 手语词库</a></li>
                    <li><a href="history.html"><i class="fas fa-chevron-right"></i> 历史记录</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3 class="footer-title">资源</h3>
                <ul class="footer-links">
                    <li><a href="#"><i class="fas fa-chevron-right"></i> 使用文档</a></li>
                    <li><a href="#"><i class="fas fa-chevron-right"></i> API接口</a></li>
                    <li><a href="#"><i class="fas fa-chevron-right"></i> 开发者中心</a></li>
                    <li><a href="#"><i class="fas fa-chevron-right"></i> 常见问题</a></li>
                </ul>
            </div>

            <div class="footer-section">
                <h3 class="footer-title">联系我们</h3>
                <div class="contact-info">
                    <p><i class="fas fa-map-marker-alt"></i>浙江理工大学 </p>
                    <p><i class="fas fa-phone"></i> +86 137 3690 6982</p>
                    <p><i class="fas fa-envelope"></i> 2185594696@qq.com</p>
                    <p><i class="fas fa-clock"></i> 周一至周五 9:00-18:00</p>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <div class="copyright">
                © 2025 手语医疗助手. 保留所有权利 开发人员：蓝司阳 董灿华 陈子涵 黄乐馨 刘语欣
            </div>
            <div class="footer-legal">
                <a href="#">隐私政策</a>
                <a href="#">服务条款</a>
                <a href="#">Cookie政策</a>
                <a href="#">免责声明</a>
            </div>
        </div>
    </footer>
    `;
}

export function initFooter() {
  // 这里可以添加页脚相关的交互逻辑
  console.log('Footer initialized');
}
