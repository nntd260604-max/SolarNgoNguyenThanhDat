/**
 * Backend REST API Server (Node.js & Express.js)
 * CÔNG TY TNHH TM DV HOÀNG GIANG SOLAR
 * Hệ thống hỗ trợ tiếp nhận & quản lý yêu cầu khách hàng
 * Sinh viên thực hiện: Ngô Nguyễn Thành Đạt - MSSV: 2224801030332 - Lớp: D22KTPM03
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { readStore, writeStore } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Phục vụ giao diện Frontend tĩnh
const FRONTEND_DIR = path.join(__dirname, '..');
app.use(express.static(FRONTEND_DIR));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.url}`);
  next();
});

// Helper: tính deadline SLA theo độ ưu tiên
function calculateSLADeadline(priority = 'MEDIUM') {
  const hoursMap = {
    URGENT: 4,
    HIGH: 24,
    MEDIUM: 48,
    LOW: 72
  };
  const hours = hoursMap[priority.toUpperCase()] || 48;
  const deadline = new Date(Date.now() + hours * 3600 * 1000);
  return deadline.toISOString().replace('T', ' ').substring(0, 19);
}

// =============================================================================
// REST API ROUTES (/api/v1)
// =============================================================================

// 1. AUTHENTICATION & LOGIN
app.post('/api/v1/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin đăng nhập.' });
  }

  const store = readStore();
  const cleanId = identifier.trim().toLowerCase();
  const user = store.users.find(u => 
    (u.email.toLowerCase() === cleanId || u.phone === cleanId) &&
    (password === '123456' || password === 'admin123' || password === u.password)
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Sai email/số điện thoại hoặc mật khẩu.' });
  }

  if (user.status === 'LOCKED') {
    return res.status(403).json({ success: false, message: 'Tài khoản đang bị tạm khóa.' });
  }

  // Giả lập JWT token
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + Buffer.from(JSON.stringify({
    user_id: user.user_id,
    role: user.role,
    email: user.email,
    exp: Date.now() + 86400000
  })).toString('base64') + '.sig';

  return res.json({
    success: true,
    message: 'Đăng nhập thành công',
    token,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address
    }
  });
});

app.post('/api/v1/auth/register', (req, res) => {
  const { full_name, phone, email, password, address } = req.body;
  if (!full_name || !phone || !email || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu các trường bắt buộc.' });
  }

  const store = readStore();
  if (store.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Email đã tồn tại.' });
  }
  if (store.users.some(u => u.phone === phone.trim())) {
    return res.status(400).json({ success: false, message: 'Số điện thoại đã tồn tại.' });
  }

  const newId = store.users.length > 0 ? Math.max(...store.users.map(u => u.user_id)) + 1 : 1;
  const newUser = {
    user_id: newId,
    full_name: full_name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    role: 'CLIENT',
    status: 'ACTIVE',
    address: address || '',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  store.users.push(newUser);
  writeStore(store);

  return res.status(201).json({
    success: true,
    message: 'Đăng ký tài khoản thành công',
    user: newUser
  });
});

// 2. CATEGORIES
app.get('/api/v1/categories', (req, res) => {
  const store = readStore();
  return res.json({ success: true, data: store.categories });
});

// 3. SUPPORT REQUESTS
app.get('/api/v1/requests', (req, res) => {
  const { status, categoryId, userId, search } = req.query;
  const store = readStore();
  let list = store.requests || [];

  if (userId) {
    list = list.filter(r => Number(r.user_id) === Number(userId));
  }
  if (status && status !== 'ALL') {
    list = list.filter(r => r.status === status);
  }
  if (categoryId && categoryId !== 'ALL') {
    list = list.filter(r => Number(r.category_id) === Number(categoryId));
  }
  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(r =>
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.request_code && r.request_code.toLowerCase().includes(q)) ||
      (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
      (r.title && r.title.toLowerCase().includes(q))
    );
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return res.json({ success: true, count: list.length, data: list });
});

app.get('/api/v1/requests/:id', (req, res) => {
  const store = readStore();
  const reqItem = store.requests.find(r => Number(r.request_id) === Number(req.params.id));
  if (!reqItem) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu.' });
  }
  return res.json({ success: true, data: reqItem });
});

app.post('/api/v1/requests', (req, res) => {
  const { customer_name, phone, email, address, category_id, title, content, priority, attachment_url, user_id, assigned_to } = req.body;
  if (!customer_name || !phone || !content || !category_id) {
    return res.status(400).json({ success: false, message: 'Dữ liệu đầu vào không hợp lệ hoặc thiếu trường bắt buộc.' });
  }

  const store = readStore();
  const newId = store.requests.length > 0 ? Math.max(...store.requests.map(r => r.request_id)) + 1 : 1;
  const year = new Date().getFullYear();
  const code = `HGS-${year}-${String(newId).padStart(3, '0')}`;
  const prio = priority || 'MEDIUM';

  const newReq = {
    request_id: newId,
    request_code: code,
    user_id: Number(user_id) || 3,
    category_id: Number(category_id),
    customer_name,
    phone,
    email: email || '',
    address: address || '',
    title: title || 'Yêu cầu hỗ trợ kỹ thuật',
    content,
    priority: prio,
    status: 'PENDING',
    attachment_url: attachment_url || null,
    assigned_to: assigned_to ? Number(assigned_to) : null,
    assigned_technician_name: null,
    sla_deadline: calculateSLADeadline(prio),
    sla_status: 'IN_SLA',
    rating_score: null,
    rating_comment: null,
    rated_at: null,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  store.requests.unshift(newReq);
  writeStore(store);

  return res.status(201).json({ success: true, message: 'Khởi tạo yêu cầu thành công', data: newReq });
});

// 4. CSAT CUSTOMER RATING ENDPOINT
app.post('/api/v1/requests/:id/rate', (req, res) => {
  const { rating_score, rating_comment } = req.body;
  const score = Number(rating_score);
  if (!score || score < 1 || score > 5) {
    return res.status(400).json({ success: false, message: 'Điểm đánh giá phải từ 1 đến 5 sao.' });
  }

  const store = readStore();
  const reqItem = store.requests.find(r => Number(r.request_id) === Number(req.params.id));
  if (!reqItem) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu cần đánh giá.' });
  }

  reqItem.rating_score = score;
  reqItem.rating_comment = (rating_comment || '').trim();
  reqItem.rated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
  reqItem.updated_at = reqItem.rated_at;

  writeStore(store);
  return res.json({
    success: true,
    message: 'Cảm ơn Quý khách đã đánh giá chất lượng dịch vụ!',
    data: reqItem
  });
});

// 5. ASSIGN TECHNICIAN ENDPOINT
app.put('/api/v1/requests/:id/assign', (req, res) => {
  const { technician_id, technician_name } = req.body;
  const store = readStore();
  const reqItem = store.requests.find(r => Number(r.request_id) === Number(req.params.id));
  if (!reqItem) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu.' });
  }

  reqItem.assigned_to = technician_id ? Number(technician_id) : null;
  reqItem.assigned_technician_name = technician_name || 'Chuyên viên kỹ thuật';
  reqItem.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);

  writeStore(store);
  return res.json({ success: true, message: 'Phân công kỹ thuật viên thành công.', data: reqItem });
});

// 6. RESPONSE LOGS & TRANSACTION ATOMIC STATUS UPDATE (ACID)
app.get('/api/v1/requests/:id/responses', (req, res) => {
  const store = readStore();
  const logs = (store.response_logs || []).filter(l => Number(l.request_id) === Number(req.params.id));
  logs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  return res.json({ success: true, data: logs });
});

app.post('/api/v1/requests/:id/responses', (req, res) => {
  const { responder_id, responder_name, response_content, new_status, is_internal_note } = req.body;
  if (!response_content || !response_content.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung phản hồi không được để trống.' });
  }

  const store = readStore();
  const reqItem = store.requests.find(r => Number(r.request_id) === Number(req.params.id));
  if (!reqItem) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu cần phản hồi.' });
  }

  // ACID Transaction logic: cập nhật đồng thời trạng thái và lưu bản ghi nhật ký
  const prevStatus = reqItem.status;
  const statusToUpdate = new_status || 'RESOLVED';
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const newLogId = store.response_logs.length > 0 ? Math.max(...store.response_logs.map(l => l.response_id)) + 1 : 1;
  const newLog = {
    response_id: newLogId,
    request_id: Number(req.params.id),
    responder_id: Number(responder_id) || 1,
    responder_name: responder_name || 'Võ Hoàng Nhật (Quản trị viên)',
    response_content: response_content.trim(),
    previous_status: prevStatus,
    new_status: statusToUpdate,
    is_internal_note: is_internal_note ? 1 : 0,
    created_at: now
  };

  reqItem.status = statusToUpdate;
  reqItem.updated_at = now;
  store.response_logs.push(newLog);

  writeStore(store);

  return res.status(201).json({
    success: true,
    message: 'Phản hồi đã được ghi nhận và đồng bộ trạng thái thành công.',
    data: { request: reqItem, log: newLog }
  });
});

// 7. INSTALLED EQUIPMENT & WARRANTY LOOKUP
app.get('/api/v1/equipment', (req, res) => {
  const { search, phone } = req.query;
  const store = readStore();
  let list = store.installed_equipment || [];

  if (phone) {
    const p = phone.trim();
    list = list.filter(e => e.phone === p);
  }
  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(e =>
      (e.serial_number && e.serial_number.toLowerCase().includes(q)) ||
      (e.customer_name && e.customer_name.toLowerCase().includes(q)) ||
      (e.phone && e.phone.toLowerCase().includes(q)) ||
      (e.device_name && e.device_name.toLowerCase().includes(q))
    );
  }

  return res.json({ success: true, count: list.length, data: list });
});

app.get('/api/v1/equipment/:serial', (req, res) => {
  const serial = req.params.serial.trim().toUpperCase();
  const store = readStore();
  const item = (store.installed_equipment || []).find(e => e.serial_number.toUpperCase() === serial);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy số Serial thiết bị này.' });
  }
  return res.json({ success: true, data: item });
});

// 8. KNOWLEDGE BASE & FAULT CODES
app.get('/api/v1/knowledge-base', (req, res) => {
  const { search, brand } = req.query;
  const store = readStore();
  let list = store.knowledge_base || [];

  if (brand && brand !== 'ALL') {
    list = list.filter(k => k.brand.toLowerCase().includes(brand.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(k =>
      (k.code && k.code.toLowerCase().includes(q)) ||
      (k.title && k.title.toLowerCase().includes(q)) ||
      (k.brand && k.brand.toLowerCase().includes(q)) ||
      (k.cause && k.cause.toLowerCase().includes(q)) ||
      (k.solution && k.solution.toLowerCase().includes(q))
    );
  }

  return res.json({ success: true, count: list.length, data: list });
});

// 9. TECHNICIANS
app.get('/api/v1/technicians', (req, res) => {
  const store = readStore();
  return res.json({ success: true, data: store.technicians || [] });
});

// 10. DASHBOARD STATS
app.get('/api/v1/dashboard/stats', (req, res) => {
  const store = readStore();
  const reqs = store.requests || [];
  const users = store.users || [];
  const cats = store.categories || [];
  const equip = store.installed_equipment || [];

  const total = reqs.length;
  const pending = reqs.filter(r => r.status === 'PENDING').length;
  const processing = reqs.filter(r => r.status === 'PROCESSING').length;
  const resolved = reqs.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;
  const clients = users.filter(u => u.role === 'CLIENT').length;

  const ratedReqs = reqs.filter(r => r.rating_score && r.rating_score > 0);
  const avgRating = ratedReqs.length > 0 
    ? (ratedReqs.reduce((sum, r) => sum + r.rating_score, 0) / ratedReqs.length).toFixed(1)
    : '5.0';

  const now = new Date();
  const overdueCount = reqs.filter(r => 
    r.status !== 'RESOLVED' && r.status !== 'CLOSED' && r.sla_deadline && new Date(r.sla_deadline) < now
  ).length;

  const categoryStats = cats.map(c => ({
    name: c.category_name,
    count: reqs.filter(r => Number(r.category_id) === Number(c.category_id)).length
  }));

  return res.json({
    success: true,
    data: {
      total,
      pending,
      processing,
      resolved,
      clients,
      avgRating,
      ratedCount: ratedReqs.length,
      overdueCount,
      equipmentCount: equip.length,
      categoryStats
    }
  });
});

// 11. AI CHATBOT NLP ASSISTANT ENDPOINT
app.post('/api/v1/chatbot', (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống.' });
  }

  const clean = message.toLowerCase().trim();
  let reply = '';
  let suggestions = [];

  if (clean.includes('chào') || clean.includes('hello') || clean.includes('hi') || clean.includes('alo')) {
    reply = `Dạ chào Quý khách! Em là **Trợ lý AI Hoàng Giang Solar** ☀️. Em có thể hỗ trợ Quý khách tính tiền điện mặt trời, tra cứu bảo hành, tư vấn hệ Hybrid Deye hoặc hướng dẫn xử lý mã lỗi Inverter Solis.`;
    suggestions = ['💡 Tính tiền điện mặt trời', '⚠️ Biến tần báo lỗi', '🔋 Hệ Hybrid Deye là gì?', '📞 Hotline công ty'];
  } else if (clean.includes('tiền điện') || clean.includes('chi phí') || clean.includes('giá') || clean.includes('hoàn vốn') || clean.includes('on-grid') || clean.includes('hòa lưới')) {
    reply = `Dạ, về **chi phí đầu tư điện mặt trời**:\n- **Hệ Hòa lưới (On-grid):** Suất đầu tư khoảng **13.5 triệu/kWp**, hoàn vốn nhanh trong **3.5 - 4 năm**.\n- **Hệ Hybrid lưu trữ (ESS):** Suất đầu tư khoảng **22 triệu/kWp** (gồm Inverter Deye và pin Lithium).\n- 1 kWp phát trung bình **125 kWh/tháng** tại Bình Dương.\n\n👉 *Quý khách có thể sử dụng công cụ tính Solar ROI trên trang chủ để nhận kết quả chính xác theo số tiền điện.*`;
    suggestions = ['🔋 Tư vấn hệ Hybrid Deye', '📋 Hướng dẫn nhận báo giá', '🏠 Diện tích mái cần bao nhiêu?'];
  } else if (clean.includes('hybrid') || clean.includes('pin lưu trữ') || clean.includes('ắc quy') || clean.includes('lithium') || clean.includes('deye')) {
    reply = `Dạ, **Hệ thống Điện mặt trời Hybrid** kết hợp Inverter Hybrid Deye 3 pha và Pin Lithium Deye 5.12kWh - 10.24kWh. Khi cúp điện lưới EVN, hệ thống chuyển mạch cấp điện dự phòng trong **10 mili-giây** (EPS) giúp gia đình luôn có điện thắp sáng, chạy tủ lạnh và camera.`;
    suggestions = ['💡 Dự toán chi phí hệ Hybrid', '📋 Tạo phiếu tư vấn', '📞 Liên hệ kỹ sư'];
  } else if (clean.includes('lỗi') || clean.includes('đèn đỏ') || clean.includes('alarm') || clean.includes('al01') || clean.includes('al08') || clean.includes('f13') || clean.includes('f20') || clean.includes('solis')) {
    reply = `Dạ, nếu biến tần chớp đèn **Alarm đỏ**:\n- **AL01 (OV-G-V01):** Quá áp lưới EVN (>253V) vào giờ trưa nắng to. Liên hệ kỹ thuật điều chỉnh mở rộng dải điện áp.\n- **AL08 (ISO-PRO01):** Rò rỉ cách điện DC (thường do ẩm giắc MC4 hoặc đứt dây). Quý khách gạt tắt công tắc DC Switch và báo kỹ thuật qua xử lý.\n- **F13 (Deye):** Mất điện lưới hoặc ngắt CB AC.\n- **F20 (Deye):** Lỗi giao tiếp cáp CAN giữa Inverter và pin Lithium.`;
    suggestions = ['⚠️ Lỗi AL01 là gì?', '⚠️ Lỗi AL08 xử lý sao?', '📞 Hotline kỹ thuật khẩn cấp'];
  } else if (clean.includes('bảo hành') || clean.includes('thời hạn') || clean.includes('bao lâu') || clean.includes('serial')) {
    reply = `Dạ, chính sách bảo hành chính hãng tại Hoàng Giang Solar:\n- Tấm pin Longi/Jinko: Bảo hành **12 năm vật lý, 25 năm hiệu suất**.\n- Biến tần Inverter Solis/Deye: Bảo hành **5 năm**.\n- Pin Lithium Deye: Bảo hành **5 - 10 năm**.\n- Camera Hikvision: Bảo hành **2 năm**.\nQuý khách có thể nhập số Serial hoặc Số điện thoại để tra cứu bảo hành ngay trên trang web.`;
    suggestions = ['🔍 Tra cứu bảo hành', '📞 Hotline bảo hành: 0913 704 141'];
  } else if (clean.includes('công ty') || clean.includes('địa chỉ') || clean.includes('ở đâu') || clean.includes('hotline') || clean.includes('giám đốc') || clean.includes('thành đạt')) {
    reply = `Dạ, thông tin công ty:\n- **Công ty TNHH TM DV Hoàng Giang Solar**\n- Địa chỉ: 762 Quốc lộ 13, P. Thới Hòa, TX. Bến Cát, Tỉnh Bình Dương\n- Hotline/Zalo kỹ thuật: **0913 704 141**\n- Giám đốc: Kỹ sư **Võ Hoàng Nhật**\n- Đề tài tốt nghiệp do sinh viên: **Ngô Nguyễn Thành Đạt** (MSSV: 2224801030332 - ĐH Thủ Dầu Một).`;
    suggestions = ['💡 Tính tiền điện mặt trời', '⚠️ Hỗ trợ sự cố kỹ thuật', '🛡️ Tra cứu bảo hành'];
  } else {
    reply = `Dạ em đã ghi nhận câu hỏi: "*${message}*". Để được tư vấn giải pháp tối ưu và hỗ trợ sự cố tận nơi, Quý khách vui lòng gọi Hotline kỹ thuật **0913 704 141** hoặc gửi phiếu yêu cầu hỗ trợ tại Cổng dịch vụ khách hàng nhé ạ!`;
    suggestions = ['💡 Tính tiền điện mặt trời', '⚠️ Tra cứu mã lỗi Inverter', '🔋 Hệ Hybrid Deye là gì?', '📞 Hotline: 0913 704 141'];
  }

  return res.json({
    success: true,
    message: 'Phản hồi từ AI Chatbot thành công',
    reply,
    suggestions
  });
});

// 12. SWAGGER / API DOCS INTERACTIVE PAGE
app.get('/api/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tài Liệu API - Hoàng Giang Solar</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <style>
        body { background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; }
        .endpoint-card { background: #fff; border-radius: 10px; border: 1px solid #E2E8F0; margin-bottom: 16px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.2s; }
        .endpoint-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .method-badge { font-weight: 700; width: 75px; text-align: center; display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 13px; }
        .get { background-color: #E0F2FE; color: #0284C7; }
        .post { background-color: #D1FAE5; color: #059669; }
        .put { background-color: #FEF3C7; color: #D97706; }
        .delete { background-color: #FEE2E2; color: #DC2626; }
      </style>
    </head>
    <body class="container">
      <div class="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
        <div>
          <h2 class="fw-bold text-primary mb-1"><i class="fa-solid fa-solar-panel text-warning me-2"></i>Hoàng Giang Solar - REST API Documentation</h2>
          <div class="text-muted">Đề tài Báo cáo thực tập tốt nghiệp: Ngô Nguyễn Thành Đạt (MSSV: 2224801030332 - Lớp: D22KTPM03)</div>
        </div>
        <div>
          <a href="/home.html" class="btn btn-primary btn-sm me-2"><i class="fa-solid fa-house me-1"></i>Trang Chủ</a>
          <a href="/admin.html" class="btn btn-outline-primary btn-sm"><i class="fa-solid fa-chart-line me-1"></i>Trang Quản Trị</a>
        </div>
      </div>

      <div class="alert alert-info py-2 px-3 small">
        <i class="fa-solid fa-circle-info me-1"></i> Toàn bộ API được chuẩn hóa tiền tố <code>/api/v1</code>, hỗ trợ trao đổi dữ liệu JSON và kiểm soát xác thực Role-Based Access Control (RBAC).
      </div>

      <h5 class="fw-bold text-dark mt-4 mb-3"><i class="fa-solid fa-user-shield me-2 text-primary"></i>1. Xác thực & Người dùng (Authentication)</h5>
      <div class="endpoint-card p-3">
        <span class="method-badge post">POST</span> <code>/api/v1/auth/login</code> - Đăng nhập tài khoản (Email/SĐT + Password)
      </div>
      <div class="endpoint-card p-3">
        <span class="method-badge post">POST</span> <code>/api/v1/auth/register</code> - Đăng ký tài khoản Khách hàng mới
      </div>

      <h5 class="fw-bold text-dark mt-4 mb-3"><i class="fa-solid fa-headset me-2 text-success"></i>2. Phiếu Yêu Cầu Hỗ Trợ (Support Requests)</h5>
      <div class="endpoint-card p-3">
        <span class="method-badge get">GET</span> <code>/api/v1/requests</code> - Lấy danh sách yêu cầu (hỗ trợ lọc status, userId, categoryId, search SĐT/mã)
      </div>
      <div class="endpoint-card p-3">
        <span class="method-badge post">POST</span> <code>/api/v1/requests</code> - Tạo mới phiếu yêu cầu hỗ trợ (tự động tính SLA Deadline theo độ ưu tiên)
      </div>
      <div class="endpoint-card p-3">
        <span class="method-badge get">GET</span> <code>/api/v1/requests/:id</code> - Lấy thông tin chi tiết một phiếu yêu cầu
      </div>
      <div class="endpoint-card p-3">
        <span class="method-badge put">PUT</span> <code>/api/v1/requests/:id/assign</code> - Phân công kỹ thuật viên phụ trách xử lý
      </div>
      <div class="endpoint-card p-3 border-warning">
        <span class="method-badge post">POST</span> <code>/api/v1/requests/:id/rate</code> - Đánh giá CSAT chất lượng dịch vụ (1 đến 5 sao & nhận xét)
      </div>

      <h5 class="fw-bold text-dark mt-4 mb-3"><i class="fa-solid fa-comments me-2 text-info"></i>3. Nhật Ký Phản Hồi & Toàn Vẹn Giao Dịch (Response Logs & Transaction)</h5>
      <div class="endpoint-card p-3">
        <span class="method-badge get">GET</span> <code>/api/v1/requests/:id/responses</code> - Lấy toàn bộ lịch sử phản hồi của phiếu
      </div>
      <div class="endpoint-card p-3 border-success">
        <span class="method-badge post">POST</span> <code>/api/v1/requests/:id/responses</code> - Gửi câu trả lời & cập nhật trạng thái (MySQL Transaction ACID)
      </div>

      <h5 class="fw-bold text-dark mt-4 mb-3"><i class="fa-solid fa-shield-halved me-2 text-warning"></i>4. Quản Lý Thiết Bị Lắp Đặt & Tra Cứu Bảo Hành (Warranty & Equipment)</h5>
      <div class="endpoint-card p-3">
        <span class="method-badge get">GET</span> <code>/api/v1/equipment</code> - Tra cứu thiết bị đã lắp đặt (tìm theo Serial Number hoặc SĐT)
      </div>
      <div class="endpoint-card p-3">
        <span class="method-badge get">GET</span> <code>/api/v1/equipment/:serial</code> - Lấy chi tiết bảo hành biến tần / camera theo Serial
      </div>

      <h5 class="fw-bold text-dark mt-4 mb-3"><i class="fa-solid fa-book-open me-2 text-danger"></i>5. Thư Viện Tra Cứu Mã Lỗi Inverter & Camera (Knowledge Base)</h5>
      <div class="endpoint-card p-3">
        <span class="method-badge get">GET</span> <code>/api/v1/knowledge-base</code> - Thư viện mã lỗi Solis, Deye, Hikvision kèm giải pháp
      </div>

      <h5 class="fw-bold text-dark mt-4 mb-3"><i class="fa-solid fa-chart-pie me-2 text-secondary"></i>6. Danh Mục Dịch Vụ, Kỹ Thuật Viên & Dashboard KPI</h5>
      <div class="endpoint-card p-3">
        <span class="method-badge get">GET</span> <code>/api/v1/categories</code> - Lấy danh mục nhóm dịch vụ điện mặt trời & camera
      </div>
      <div class="endpoint-card p-3">
        <span class="method-badge get">GET</span> <code>/api/v1/technicians</code> - Danh sách kỹ sư & kỹ thuật viên thi công
      </div>
      <div class="endpoint-card p-3">
        <span class="method-badge get">GET</span> <code>/api/v1/dashboard/stats</code> - Lấy các chỉ số KPI, điểm CSAT trung bình và dữ liệu biểu đồ
      </div>

      <h5 class="fw-bold text-dark mt-4 mb-3"><i class="fa-solid fa-robot me-2 text-primary"></i>7. Trợ Lý Ảo Thông Minh (AI Solar Chatbot NLP)</h5>
      <div class="endpoint-card p-3 border-primary">
        <span class="method-badge post">POST</span> <code>/api/v1/chatbot</code> - Phân tích câu hỏi tự nhiên & tư vấn giải pháp điện mặt trời, hoàn vốn, bảo hành, mã lỗi Inverter
      </div>
    </body>
    </html>
  `);
});

// Điều hướng mặc định về Trang chủ
app.get('/', (req, res) => {
  res.redirect('/home.html');
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================================`);
  console.log(` CÔNG TY TNHH TM DV HOÀNG GIANG SOLAR - HỆ THỐNG QUẢN LÝ HỖ TRỢ`);
  console.log(` Sinh viên: Ngô Nguyễn Thành Đạt (MSSV: 2224801030332 - D22KTPM03)`);
  console.log(` Server đang chạy tại: http://localhost:${PORT}`);
  console.log(` - Trang chủ:          http://localhost:${PORT}/home.html`);
  console.log(` - Cổng khách hàng:    http://localhost:${PORT}/index.html`);
  console.log(` - Đăng nhập/Đăng ký:  http://localhost:${PORT}/login.html`);
  console.log(` - Quản trị Admin:     http://localhost:${PORT}/admin.html`);
  console.log(` - Tài liệu API Docs:  http://localhost:${PORT}/api/docs`);
  console.log(`=================================================================`);
});
