// js/api-service.js - 后端API服务
class SignLanguageAPI {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
  }

  // 健康检查
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('健康检查失败:', error);
      return { status: 'error', message: '无法连接到后端服务' };
    }
  }

  // 手语识别
  async recognize(imageData) {
    try {
      const timestamp = new Date().toISOString();
      const response = await fetch(`${this.baseURL}/api/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          timestamp: timestamp
        })
      });

      return await response.json();
    } catch (error) {
      console.error('识别请求失败:', error);
      return {
        success: false,
        error: '网络连接失败，请检查后端服务'
      };
    }
  }

  // 获取历史记录
  async getHistory() {
    try {
      const response = await fetch(`${this.baseURL}/api/history`);
      return await response.json();
    } catch (error) {
      console.error('获取历史记录失败:', error);
      return { success: false, data: [], count: 0 };
    }
  }
}

// 创建全局API实例
const signLanguageAPI = new SignLanguageAPI();

// 导出
export { SignLanguageAPI, signLanguageAPI };
