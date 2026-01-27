# 手语识别系统运行说明

## 系统架构

- **后端**: Python Flask API服务器（在PyCharm中运行）
- **前端**: Web前端应用（在IDEA中运行）

## 一、后端运行步骤（PyCharm）

### 1. 环境准备

1. 打开PyCharm，打开项目目录：`C:\pyproject\PythonProject1`

2. 安装Python依赖：
   ```bash
   pip install -r requirements.txt
   ```
   
   主要依赖包括：
   - flask
   - flask-cors
   - torch
   - torchvision
   - opencv-python
   - mediapipe
   - numpy
   - Pillow

### 2. 检查模型文件

确保模型文件存在：
- `data/weights/sign_18_mobilenet_final.pth`

### 3. 运行后端服务器

**方法一：使用启动脚本（推荐）**
1. 在PyCharm中打开 `run_api_server.py` 文件
2. 右键点击文件，选择 "Run 'run_api_server'"
   或者直接运行：
   ```bash
   python run_api_server.py
   ```

**方法二：直接运行API服务**
1. 在PyCharm中打开 `app/api_server.py` 文件
2. 右键点击文件，选择 "Run 'api_server'"
   或者直接运行：
   ```bash
   python app/api_server.py
   ```

3. 看到以下输出表示启动成功：
   ```
   ============================================================
   手语识别API服务启动中...
   模型路径: data/weights/sign_18_mobilenet_final.pth
   使用设备: cpu (或 cuda)
   ============================================================
   
   API端点:
     - GET  /api/health    - 健康检查
     - POST /api/recognize - 手语识别
     - GET  /api/history   - 历史记录
   
   服务将在 http://localhost:5000 启动
   ============================================================
   ```

4. 后端API将在 `http://localhost:5000` 上运行

### 4. 验证后端服务

在浏览器中访问：`http://localhost:5000/api/health`

应该看到JSON响应：
```json
{
  "status": "ok",
  "service": "手语识别API",
  "model_loaded": true,
  "device": "cpu"
}
```

## 二、前端运行步骤（IDEA）

### 1. 环境准备

1. 打开IDEA，打开项目目录：`C:\Users\陈子涵\IdeaProjects\med_sigh_rec`

2. 确保已安装Node.js（建议版本 14+）

3. 安装前端依赖：
   ```bash
   npm install
   ```

### 2. 配置后端地址（如需要）

如果后端运行在不同的地址或端口，修改 `js/api_service.js` 文件：

```javascript
constructor(baseURL = 'http://localhost:5000') {
  this.baseURL = baseURL;
}
```

### 3. 运行前端开发服务器

在IDEA的终端中运行：
```bash
npm start
```

或者使用webpack命令：
```bash
npx webpack serve --open --config webpack.config.dev.js
```

### 4. 访问前端应用

前端应用将在浏览器中自动打开，通常是：`http://localhost:8080`

如果没有自动打开，手动访问：
- `http://localhost:8080/index.html` - 首页
- `http://localhost:8080/diagnosis.html` - 手语识别诊断页面

## 三、使用流程

### 1. 启动顺序

**重要**: 必须先启动后端，再启动前端！

1. ✅ 首先在PyCharm中启动后端（`run_api_server.py` 或 `app/api_server.py`）
2. ✅ 然后在IDEA中启动前端（`npm start`）

### 2. 使用手语识别功能

1. 打开前端应用，进入"手语诊断"页面（`diagnosis.html`）
2. 允许浏览器访问摄像头权限
3. 点击"开始识别"按钮
4. 将手部放在摄像头前，做出手语动作
5. 系统会每2秒自动识别一次，结果显示在右侧

### 3. 识别结果说明

- **识别结果**: 显示识别出的手语类别（如：ABDOMEN, ARM, COLD, COUGH, EIGHT, FEVER, FIVE, FOUR, HEAD, HEART, NAUSEA, NINE, ONE, SEVEN, SIX, TEN, THREE, TWO）
- **置信度**: 显示识别的置信度（0-100%）
- **历史记录**: 自动保存识别历史

## 四、常见问题

### 1. 后端无法启动

**问题**: 提示找不到模型文件
- **解决**: 检查 `data/weights/sign_18_mobilenet_final.pth` 文件是否存在

**问题**: 端口5000被占用
- **解决**: 修改 `app/api_server.py` 或 `run_api_server.py` 最后一行的端口号：
  ```python
  app.run(host='0.0.0.0', port=5001, debug=False)  # 改为5001或其他端口
  ```
  同时修改前端的 `js/api_service.js` 中的端口号：
  ```javascript
  constructor(baseURL = 'http://localhost:5001') {
    this.baseURL = baseURL;
  }
  ```

### 2. 前端无法连接后端

**问题**: 前端显示"无法连接到后端服务"
- **解决**: 
  1. 确认后端已启动并运行在 `http://localhost:5000`
  2. 在浏览器中访问 `http://localhost:5000/api/health` 验证后端是否正常
  3. 检查防火墙是否阻止了连接
  4. 确认后端和前端在同一台机器上，或修改CORS配置

### 3. 摄像头无法访问

**问题**: 浏览器提示无法访问摄像头
- **解决**:
  1. 检查浏览器权限设置，允许访问摄像头
  2. 确保没有其他应用占用摄像头
  3. 尝试使用HTTPS（某些浏览器要求HTTPS才能访问摄像头）

### 4. 识别结果不准确

**问题**: 识别结果错误或无法识别
- **解决**:
  1. 确保手部在摄像头视野中央
  2. 确保光线充足
  3. 手部动作清晰，符合ASL手语标准
  4. 等待2秒让系统完成识别

## 五、API接口说明

### 1. 健康检查
- **URL**: `GET /api/health`
- **返回**: 服务状态信息

### 2. 手语识别
- **URL**: `POST /api/recognize`
- **请求体**:
  ```json
  {
    "image": "data:image/jpeg;base64,...",
    "timestamp": "2024-01-01T12:00:00"
  }
  ```
- **返回**:
  ```json
  {
    "success": true,
    "result": "HEAD",
    "confidence": 0.95
  }
  ```
  或失败时：
  ```json
  {
    "success": false,
    "error": "未检测到手部，请将手放在摄像头前"
  }
  ```

### 3. 历史记录
- **URL**: `GET /api/history`
- **返回**: 历史记录列表

## 六、项目结构

### 后端结构
```
PythonProject1/
├── run_api_server.py      # API服务启动脚本（推荐使用）
├── app/
│   ├── api_server.py      # Flask API服务器主文件
│   ├── frame.py           # Tkinter GUI应用（原桌面应用）
│   └── frame_utils.py     # 手部特征提取工具
├── model/
│   ├── cnn_models.py      # 深度学习模型
│   └── attention_layers.py # 注意力层
├── utils/
│   ├── label_mapper.py    # 标签映射工具
│   └── model_checkpoint.py # 模型加载工具
├── data/
│   └── weights/           # 模型权重文件
│       └── sign_18_mobilenet_final.pth
└── requirements.txt       # Python依赖
```

### 前端结构
```
med_sigh_rec/
├── index.html            # 首页
├── diagnosis.html        # 诊断页面
├── js/
│   ├── api_service.js   # API服务封装
│   └── app.js           # 主应用文件
├── diagnosis-script.js   # 诊断页面脚本
├── script.js            # 通用脚本
└── package.json         # Node.js依赖
```

## 七、开发建议

1. **后端开发**: 在PyCharm中修改 `app/api_server.py` 后，需要重启服务（建议使用debug模式：将 `debug=False` 改为 `debug=True`）
2. **前端开发**: 修改前端代码后，webpack会自动重新编译
3. **调试**: 使用浏览器开发者工具（F12）查看控制台日志
4. **测试**: 先测试后端API是否正常，再测试前端连接

## 八、注意事项

1. ⚠️ 确保后端和前端在同一台机器上，或正确配置CORS
2. ⚠️ 摄像头权限需要在浏览器中手动授权
3. ⚠️ 识别功能需要稳定的网络连接（如果前后端分离部署）
4. ⚠️ 模型文件较大，首次加载可能需要一些时间

---

**祝使用愉快！如有问题，请检查控制台日志和浏览器开发者工具。**

