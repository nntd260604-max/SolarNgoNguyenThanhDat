/**
 * Client Portal Logic Module
 * Hoàng Giang Solar - Support Request Intake & Management
 * Author: Ngô Nguyễn Thành Đạt - D22KTPM03
 */

document.addEventListener('DOMContentLoaded', () => {
  // Kiểm tra đăng nhập
  if (!Auth.checkAuth(true)) return;

  const currentUser = Auth.getCurrentUser();
  Auth.renderNavbarAuth();

  // Điền sẵn thông tin người dùng vào biểu mẫu
  initCustomerForm(currentUser);

  // Nạp danh mục dịch vụ vào select
  loadCategories();

  // Nạp danh sách yêu cầu của khách hàng
  loadMyRequests();

  // Bắt sự kiện form gửi yêu cầu
  const form = document.getElementById('supportRequestForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Bắt sự kiện filter trạng thái
  const filterBtns = document.querySelectorAll('.client-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const status = e.currentTarget.dataset.status;
      loadMyRequests(status);
    });
  });

  // Bắt sự kiện preview ảnh đính kèm
  const attachmentInput = document.getElementById('attachmentInput');
  if (attachmentInput) {
    attachmentInput.addEventListener('change', handleFilePreview);
  }
});

let currentAttachmentBase64 = null;

function initCustomerForm(user) {
  if (!user) return;
  const nameInput = document.getElementById('customerName');
  const phoneInput = document.getElementById('customerPhone');
  const emailInput = document.getElementById('customerEmail');
  const addressInput = document.getElementById('customerAddress');

  if (nameInput) nameInput.value = user.full_name || '';
  if (phoneInput) phoneInput.value = user.phone || '';
  if (emailInput) emailInput.value = user.email || '';
  if (addressInput && user.address) addressInput.value = user.address;
}

function loadCategories() {
  const select = document.getElementById('serviceCategory');
  if (!select) return;

  const categories = DataRepository.getCategories();
  select.innerHTML = '<option value="">-- Chọn nhóm dịch vụ cần hỗ trợ --</option>';

  categories.filter(c => c.is_active).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.category_id;
    opt.textContent = `${cat.category_name}`;
    select.appendChild(opt);
  });
}

function handleFilePreview(e) {
  const file = e.target.files[0];
  const previewBox = document.getElementById('filePreviewBox');
  const previewImg = document.getElementById('filePreviewImg');

  if (!file) {
    currentAttachmentBase64 = null;
    if (previewBox) previewBox.classList.add('d-none');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    Toast.error('Tệp quá lớn', 'Vui lòng chọn hình ảnh có dung lượng dưới 5MB.');
    e.target.value = '';
    currentAttachmentBase64 = null;
    if (previewBox) previewBox.classList.add('d-none');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    currentAttachmentBase64 = evt.target.result;
    if (previewImg) previewImg.src = currentAttachmentBase64;
    if (previewBox) previewBox.classList.remove('d-none');
  };
  reader.readAsDataURL(file);
}

function removeAttachment() {
  const input = document.getElementById('attachmentInput');
  const previewBox = document.getElementById('filePreviewBox');
  if (input) input.value = '';
  currentAttachmentBase64 = null;
  if (previewBox) previewBox.classList.add('d-none');
}
window.removeAttachment = removeAttachment;

// Xử lý gửi biểu mẫu yêu cầu
function handleFormSubmit(e) {
  e.preventDefault();

  const currentUser = Auth.getCurrentUser();
  if (!currentUser) {
    Toast.error('Lỗi phiên', 'Vui lòng đăng nhập lại để gửi yêu cầu.');
    return;
  }

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const address = document.getElementById('customerAddress').value.trim();
  const categoryId = document.getElementById('serviceCategory').value;
  const title = document.getElementById('requestTitle').value.trim();
  const priority = document.getElementById('requestPriority').value;
  const content = document.getElementById('requestContent').value.trim();

  // Validate các trường bắt buộc (FR05)
  if (!name) {
    Toast.warning('Thiếu thông tin', 'Vui lòng nhập họ và tên của bạn.');
    document.getElementById('customerName').focus();
    return;
  }

  const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  if (!phone || !phoneRegex.test(phone)) {
    Toast.warning('Số điện thoại không hợp lệ', 'Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 chữ số, ví dụ 0913704141).');
    document.getElementById('customerPhone').focus();
    return;
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.warning('Email không hợp lệ', 'Vui lòng nhập định dạng email hợp lệ (ví dụ: cskh@gmail.com).');
      document.getElementById('customerEmail').focus();
      return;
    }
  }

  if (!categoryId) {
    Toast.warning('Chưa chọn dịch vụ', 'Vui lòng lựa chọn nhóm dịch vụ liên quan đến yêu cầu của bạn.');
    document.getElementById('serviceCategory').focus();
    return;
  }

  if (!title) {
    Toast.warning('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề tóm tắt yêu cầu.');
    document.getElementById('requestTitle').focus();
    return;
  }

  if (!content || content.length < 10) {
    Toast.warning('Nội dung quá ngắn', 'Vui lòng mô tả chi tiết sự cố hoặc nhu cầu hỗ trợ (tối thiểu 10 ký tự).');
    document.getElementById('requestContent').focus();
    return;
  }

  // Xác thực Cloudflare Turnstile Captcha
  const turnstileInput = document.querySelector('#requestForm [name="cf-turnstile-response"]');
  if (window.turnstile && turnstileInput && !turnstileInput.value) {
    Toast.warning('Bảo vệ chống Spam', 'Vui lòng xác minh hộp kiểm bảo mật (Cloudflare Turnstile) trước khi gửi yêu cầu.');
    return;
  }

  const btnSubmit = document.getElementById('btnSubmitRequest');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Đang gửi yêu cầu...';
  }

  setTimeout(() => {
    try {
      const newRequest = DataRepository.createRequest({
        user_id: currentUser.user_id,
        customer_name: name,
        phone: phone,
        email: email,
        address: address,
        category_id: categoryId,
        title: title,
        priority: priority || 'MEDIUM',
        content: content,
        attachment_url: currentAttachmentBase64
      });

      Toast.success(
        'Gửi yêu cầu thành công!',
        `Mã phiếu: <strong>${newRequest.request_code}</strong>. Hạn cam kết xử lý: ${newRequest.sla_deadline}. Kỹ sư sẽ liên hệ sớm nhất!`
      );

      document.getElementById('requestTitle').value = '';
      document.getElementById('requestContent').value = '';
      document.getElementById('serviceCategory').value = '';
      removeAttachment();

      // Reset Cloudflare Turnstile sau khi gửi thành công
      if (window.turnstile) {
        try { turnstile.reset(); } catch (err) {}
      }

      loadMyRequests();

      const myRequestsSec = document.getElementById('myRequestsSection');
      if (myRequestsSec) {
        myRequestsSec.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      Toast.error('Có lỗi xảy ra', 'Không thể gửi yêu cầu hỗ trợ: ' + err.message);
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Gửi yêu cầu hỗ trợ';
      }
    }
  }, 400);
}

// Nạp danh sách yêu cầu của người dùng đang đăng nhập (FR11, BR06)
function loadMyRequests(statusFilter = 'ALL') {
  const container = document.getElementById('myRequestsList');
  const countBadge = document.getElementById('myRequestsCount');
  if (!container) return;

  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;

  const requests = DataRepository.getRequests({
    userId: currentUser.user_id,
    status: statusFilter
  });

  if (countBadge) {
    countBadge.textContent = requests.length;
  }

  if (requests.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="fa-regular fa-folder-open fs-1 mb-3 text-secondary opacity-75"></i>
        <h6 class="fw-semibold">Chưa có yêu cầu nào trong mục này</h6>
        <p class="small">Khi bạn gửi biểu mẫu hỗ trợ, thông tin phiếu và tiến độ xử lý sẽ hiển thị tại đây.</p>
      </div>
    `;
    return;
  }

  let html = '';
  requests.forEach(req => {
    const category = DataRepository.getCategoryById(req.category_id);
    const catName = category ? category.category_name : 'Dịch vụ năng lượng';
    const catIcon = category ? category.icon : 'fa-solar-panel';

    let statusHtml = '';
    if (req.status === 'RESOLVED') {
      statusHtml = `<span class="status-badge status-resolved"><i class="fa-solid fa-circle-check"></i> Đã xử lý (Có phản hồi)</span>`;
    } else if (req.status === 'PROCESSING') {
      statusHtml = `<span class="status-badge status-processing"><i class="fa-solid fa-clock-rotate-left"></i> Đang kiểm tra kỹ thuật</span>`;
    } else {
      statusHtml = `<span class="status-badge status-pending"><i class="fa-solid fa-hourglass-half"></i> Chưa xử lý (Đang chờ)</span>`;
    }

    let priorityHtml = '';
    if (req.priority === 'URGENT') {
      priorityHtml = `<span class="priority-badge priority-urgent"><i class="fa-solid fa-bolt"></i> Khẩn cấp</span>`;
    } else if (req.priority === 'HIGH') {
      priorityHtml = `<span class="priority-badge priority-high">Ưu tiên cao</span>`;
    } else {
      priorityHtml = `<span class="priority-badge priority-medium">Bình thường</span>`;
    }

    const logs = DataRepository.getResponseLogs(req.request_id).filter(l => !l.is_internal_note);
    const replyCountText = logs.length > 0 
      ? `<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="fa-solid fa-comment-dots me-1"></i>${logs.length} phản hồi từ cty</span>`
      : `<span class="badge bg-light text-muted border"><i class="fa-regular fa-comment me-1"></i>Chưa có phản hồi</span>`;

    // Hiển thị sao đánh giá nếu đã đánh giá
    let ratingBadge = '';
    if (req.rating_score) {
      ratingBadge = `<span class="badge bg-warning text-dark ms-2"><i class="fa-solid fa-star text-danger me-1"></i>${req.rating_score}/5 sao</span>`;
    }

    html += `
      <div class="card mb-3 border border-slate-200 shadow-sm hover-shadow transition" style="border-radius: 12px; overflow: hidden;">
        <div class="card-body p-3 p-md-4">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2 pb-2 border-bottom">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-primary px-2 py-1 fs-6 font-monospace">${req.request_code}</span>
              ${statusHtml}
              ${priorityHtml}
              ${ratingBadge}
            </div>
            <div class="text-muted small">
              <i class="fa-regular fa-calendar-days me-1"></i>${req.created_at}
            </div>
          </div>

          <h5 class="card-title fw-bold text-primary mb-1 mt-2">${req.title}</h5>
          <div class="text-muted small mb-2 d-flex flex-wrap align-items-center gap-2">
            <span><i class="fa-solid ${catIcon} text-secondary me-1"></i>${catName}</span>
            <span>•</span>
            <span><i class="fa-solid fa-user-gear me-1 text-primary"></i>Nhân sự xử lý: <strong>${req.assigned_technician_name || 'Chờ Admin điều phối'}</strong></span>
            <span>•</span>
            <span><i class="fa-solid fa-location-dot me-1"></i>${req.address || 'Tại công trình'}</span>
          </div>

          <p class="card-text text-secondary mb-3 small" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${req.content}
          </p>

          <div class="d-flex align-items-center justify-content-between pt-2 border-top">
            <div>
              ${replyCountText}
              ${req.status === 'RESOLVED' && !req.rating_score ? '<span class="badge bg-warning-subtle text-dark border ms-2"><i class="fa-regular fa-star me-1 text-warning"></i>Mời bạn đánh giá</span>' : ''}
            </div>
            <button class="btn btn-outline-primary btn-sm rounded-pill px-3" onclick="viewClientRequestDetail(${req.request_id})">
              <i class="fa-solid fa-eye me-1"></i> Xem chi tiết & Lịch sử
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Mở modal chi tiết yêu cầu dành cho khách hàng
function viewClientRequestDetail(requestId) {
  const req = DataRepository.getRequestById(requestId);
  if (!req) {
    Toast.error('Không tìm thấy', 'Không tìm thấy thông tin phiếu yêu cầu này.');
    return;
  }

  const category = DataRepository.getCategoryById(req.category_id);
  const catName = category ? category.category_name : 'Dịch vụ năng lượng';

  document.getElementById('modalRequestCode').textContent = req.request_code;
  document.getElementById('modalRequestTitle').textContent = req.title;
  document.getElementById('modalRequestCategory').textContent = catName;
  document.getElementById('modalRequestTime').textContent = req.created_at;
  document.getElementById('modalRequestContent').textContent = req.content;
  document.getElementById('modalCustomerAddress').textContent = req.address || 'Không ghi rõ';
  document.getElementById('modalTechnicianName').textContent = req.assigned_technician_name || 'Chờ Admin điều phối';
  document.getElementById('modalSlaDeadline').textContent = req.sla_deadline ? `Trước: ${req.sla_deadline}` : 'Trong 24h';

  // Trạng thái badge
  const statusContainer = document.getElementById('modalRequestStatusBadge');
  if (req.status === 'RESOLVED') {
    statusContainer.innerHTML = `<span class="status-badge status-resolved"><i class="fa-solid fa-circle-check"></i> Đã xử lý (Hoàn thành)</span>`;
  } else if (req.status === 'PROCESSING') {
    statusContainer.innerHTML = `<span class="status-badge status-processing"><i class="fa-solid fa-clock-rotate-left"></i> Đang kiểm tra xử lý</span>`;
  } else {
    statusContainer.innerHTML = `<span class="status-badge status-pending"><i class="fa-solid fa-hourglass-half"></i> Chưa xử lý (Chờ kỹ thuật)</span>`;
  }

  // Tệp đính kèm
  const attachBox = document.getElementById('modalAttachmentSection');
  const attachImg = document.getElementById('modalAttachmentImg');
  if (req.attachment_url) {
    attachImg.src = req.attachment_url;
    attachBox.classList.remove('d-none');
  } else {
    attachBox.classList.add('d-none');
  }

  // Lịch sử phản hồi từ RESPONSE_LOG
  renderTimelineLogs(req.request_id);

  // CSAT Rating Widget
  renderCsatWidget(req);

  // Form gửi thêm trao đổi
  const replyForm = document.getElementById('clientReplyForm');
  if (replyForm) {
    replyForm.onsubmit = function(e) {
      e.preventDefault();
      handleClientSendFollowup(req.request_id);
    };
  }

  const modalEl = document.getElementById('requestDetailModal');
  if (window.bootstrap && window.bootstrap.Modal) {
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  }
}
window.viewClientRequestDetail = viewClientRequestDetail;

// Hiển thị Widget Đánh giá CSAT
function renderCsatWidget(req) {
  const csatBox = document.getElementById('modalCsatSection');
  if (!csatBox) return;

  if (req.status !== 'RESOLVED') {
    csatBox.classList.add('d-none');
    return;
  }

  csatBox.classList.remove('d-none');

  if (req.rating_score) {
    // Đã đánh giá
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<i class="fa-solid fa-star ${i <= req.rating_score ? 'text-warning' : 'text-muted'} fs-5 me-1"></i>`;
    }
    csatBox.innerHTML = `
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <div class="fw-bold text-dark mb-1"><i class="fa-solid fa-circle-check text-success me-1"></i> Bạn đã đánh giá dịch vụ này:</div>
          <div>${starsHtml} <strong class="ms-1 text-primary">${req.rating_score}/5 sao</strong></div>
          ${req.rating_comment ? `<div class="small text-secondary mt-1 fst-italic">"${req.rating_comment}"</div>` : ''}
        </div>
        <div class="small text-muted">${req.rated_at ? req.rated_at.substring(0, 10) : ''}</div>
      </div>
    `;
  } else {
    // Chưa đánh giá, cho phép vote
    csatBox.innerHTML = `
      <div>
        <div class="fw-bold text-dark mb-1">
          <i class="fa-solid fa-star text-warning me-1"></i> 
          Đánh giá mức độ hài lòng về phục vụ của Kỹ thuật viên Hoàng Giang Solar:
        </div>
        <p class="small text-muted mb-2">Xin vui lòng dành 10 giây chấm điểm chất lượng hỗ trợ xử lý phiếu này.</p>
        
        <div class="d-flex align-items-center gap-2 mb-2" id="starRatingContainer">
          <button type="button" class="btn btn-sm btn-outline-warning text-dark" onclick="submitRating(${req.request_id}, 1)">1 ⭐ Kém</button>
          <button type="button" class="btn btn-sm btn-outline-warning text-dark" onclick="submitRating(${req.request_id}, 2)">2 ⭐ Tạm</button>
          <button type="button" class="btn btn-sm btn-outline-warning text-dark" onclick="submitRating(${req.request_id}, 3)">3 ⭐ Khá</button>
          <button type="button" class="btn btn-sm btn-outline-warning text-dark" onclick="submitRating(${req.request_id}, 4)">4 ⭐ Tốt</button>
          <button type="button" class="btn btn-sm btn-warning text-dark fw-bold" onclick="submitRating(${req.request_id}, 5)">5 ⭐ Rất Hài Lòng</button>
        </div>

        <div class="input-group input-group-sm">
          <input type="text" id="csatFeedbackInput_${req.request_id}" class="form-control" placeholder="Góp ý thêm về thái độ phục vụ hoặc tốc độ xử lý (tùy chọn)...">
        </div>
      </div>
    `;
  }
}

function submitRating(requestId, score) {
  const commentInput = document.getElementById(`csatFeedbackInput_${requestId}`);
  const comment = commentInput ? commentInput.value.trim() : '';

  try {
    DataRepository.rateRequest(requestId, score, comment);
    Toast.success('Cảm ơn bạn!', `Bạn đã gửi đánh giá ${score}/5 sao cho Kỹ thuật viên Hoàng Giang Solar.`);
    const req = DataRepository.getRequestById(requestId);
    renderCsatWidget(req);
    loadMyRequests();
  } catch (err) {
    Toast.error('Lỗi', err.message);
  }
}
window.submitRating = submitRating;

// Hiển thị dòng thời gian phản hồi (RESPONSE_LOG)
function renderTimelineLogs(requestId) {
  const container = document.getElementById('modalResponseTimeline');
  if (!container) return;

  const logs = DataRepository.getResponseLogs(requestId).filter(l => !l.is_internal_note);

  if (logs.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info py-3 px-3 d-flex align-items-center gap-3 mb-0 rounded-3">
        <i class="fa-solid fa-circle-info fs-4 text-primary"></i>
        <div class="small">
          <strong>Yêu cầu đang trong hàng đợi xử lý.</strong><br>
          Kỹ thuật viên của Hoàng Giang Solar sẽ kiểm tra và phản hồi trực tiếp vào bảng trao đổi này. Bạn có thể kiểm tra lại sau hoặc để lại câu hỏi bổ sung bên dưới.
        </div>
      </div>
    `;
    return;
  }

  let html = '<div class="timeline">';
  logs.forEach(log => {
    const isCompany = !log.responder_name.includes('Khách hàng');
    const dotClass = isCompany ? 'resolved-dot' : 'client-dot';
    const icon = isCompany ? 'fa-headset' : 'fa-user';

    html += `
      <div class="timeline-item">
        <div class="timeline-dot ${dotClass}">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div class="timeline-card">
          <div class="timeline-meta">
            <span class="timeline-responder">
              <i class="fa-solid ${icon} me-1 text-secondary"></i>
              ${log.responder_name}
            </span>
            <span><i class="fa-regular fa-clock me-1"></i>${log.created_at}</span>
          </div>
          <div class="timeline-content">${log.response_content}</div>
        </div>
      </div>
    `;
  });
  html += '</div>';

  container.innerHTML = html;
}

// Khách hàng gửi thêm phản hồi tiếp nối
function handleClientSendFollowup(requestId) {
  const input = document.getElementById('clientReplyInput');
  if (!input) return;

  const content = input.value.trim();
  if (!content) {
    Toast.warning('Nội dung trống', 'Vui lòng nhập nội dung muốn trao đổi tiếp với công ty.');
    return;
  }

  const currentUser = Auth.getCurrentUser();
  try {
    DataRepository.addResponseWithStatusUpdate(
      requestId,
      currentUser,
      content,
      'PENDING',
      0
    );

    Toast.success('Đã gửi phản hồi', 'Nội dung trao đổi của bạn đã được chuyển tới bộ phận kỹ thuật.');
    input.value = '';
    renderTimelineLogs(requestId);
    loadMyRequests();
  } catch (err) {
    Toast.error('Lỗi', err.message);
  }
}

// Modal Xem Thiết Bị & Bảo Hành Của Khách Hàng (My Equipment)
function openMyEquipmentModal() {
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) return;

  const items = DataRepository.lookupEquipment(currentUser.phone);
  const container = document.getElementById('myEquipmentContainer');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 text-muted">
        <i class="fa-solid fa-box-open fs-1 text-secondary mb-2 opacity-75"></i>
        <h6>Chưa có hồ sơ thiết bị nào gắn với số điện thoại ${currentUser.phone}</h6>
        <p class="small">Khi hợp đồng lắp đặt điện mặt trời hoặc camera được kích hoạt, danh mục thiết bị và hạn bảo hành sẽ hiển thị tại đây.</p>
      </div>
    `;
  } else {
    let html = '<div class="row g-3">';
    items.forEach(item => {
      html += `
        <div class="col-md-6">
          <div class="p-3 border rounded-3 bg-light h-100">
            <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
              <span class="badge bg-primary font-monospace">${item.serial_number}</span>
              <span class="badge bg-success-subtle text-success border border-success-subtle"><i class="fa-solid fa-check me-1"></i>Bảo hành chính hãng</span>
            </div>
            <h6 class="fw-bold text-primary mb-1">${item.device_name}</h6>
            <div class="small text-secondary mb-2">
              <div>• <strong>Ngày lắp đặt:</strong> ${item.installed_date}</div>
              <div>• <strong>Hạn bảo hành đến:</strong> <span class="text-danger fw-bold">${item.warranty_expires}</span> (${item.warranty_years} năm)</div>
              ${item.capacity_kwp ? `<div>• <strong>Công suất:</strong> ${item.capacity_kwp}</div>` : ''}
              ${item.panels_info ? `<div>• <strong>Chi tiết:</strong> ${item.panels_info}</div>` : ''}
              <div>• <strong>Địa điểm:</strong> ${item.address}</div>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  const modalEl = document.getElementById('myEquipmentModal');
  if (window.bootstrap && window.bootstrap.Modal) {
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  }
}
window.openMyEquipmentModal = openMyEquipmentModal;
