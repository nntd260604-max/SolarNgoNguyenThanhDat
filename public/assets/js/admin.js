/**
 * Admin Dashboard & CRM Module
 * Hoàng Giang Solar - Support Request Intake & Management
 * Author: Ngô Nguyễn Thành Đạt - D22KTPM03
 */

let chartRequestsInstance = null;
let chartCategoryInstance = null;
let currentActiveRequestId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Kiểm tra quyền Admin/Support (TC06 HTTP 403)
  if (!Auth.checkAdminGuard()) return;

  const currentUser = Auth.getCurrentUser();
  renderAdminHeader(currentUser);

  // Nạp dữ liệu ban đầu
  refreshAdminDashboard();

  // Khởi tạo các sự kiện lọc và tìm kiếm
  initAdminFilters();

  // Nạp mẫu câu trả lời nhanh vào modal
  initCannedResponses();
});

function renderAdminHeader(user) {
  const nameEl = document.getElementById('adminUserName');
  const roleEl = document.getElementById('adminUserRole');
  const subtitleEl = document.getElementById('adminSidebarSubtitle');
  const menuReqLabelEl = document.getElementById('menuRequestsLabel');
  const headingEl = document.getElementById('adminPageHeading');
  const bannerEl = document.getElementById('rbacRoleBanner');

  const isStrictAdmin = user && user.role === 'ADMIN';

  if (nameEl) nameEl.textContent = user.full_name;
  if (roleEl) roleEl.textContent = isStrictAdmin ? 'Quản trị & Điều phối (Admin)' : 'Chuyên viên Tư vấn (Support)';
  if (subtitleEl) subtitleEl.textContent = isStrictAdmin ? 'Admin Điều Phối v2.0' : 'Bàn Làm Việc Tư Vấn v2.0';
  if (menuReqLabelEl) menuReqLabelEl.textContent = isStrictAdmin ? 'Điều Phối Yêu Cầu' : 'Phiếu Được Phân Công';
  if (headingEl) {
    headingEl.innerHTML = isStrictAdmin
      ? '<i class="fa-solid fa-gauge me-2 text-warning"></i>Bảng Điều Khiển Quản Trị & Điều Phối Hệ Thống'
      : '<i class="fa-solid fa-headset me-2 text-warning"></i>Bàn Làm Việc Nhân Viên Tư Vấn & Hỗ Trợ Kỹ Thuật';
  }

  // Ẩn/hiện các menu & nút chỉ dành riêng cho Admin
  document.querySelectorAll('.admin-only-menu, .admin-only-btn').forEach(el => {
    if (isStrictAdmin) {
      el.classList.remove('d-none');
    } else {
      el.classList.add('d-none');
    }
  });

  // Hiển thị Banner phân quyền RBAC rõ ràng giữa Admin và Nhân viên Tư vấn
  if (bannerEl) {
    if (isStrictAdmin) {
      bannerEl.innerHTML = `
        <div class="alert alert-primary border-primary shadow-sm mb-0 py-2 px-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <span class="badge bg-danger me-2"><i class="fa-solid fa-user-shield me-1"></i>VAI TRÒ: QUẢN TRỊ VIÊN & ĐIỀU PHỐI (ADMIN)</span>
            <span class="small text-dark">
              <strong>Nghiệp vụ được phép:</strong> Điều phối & phân công nhân viên, thiết lập SLA, ghi chú chỉ đạo nội bộ, xóa phiếu rác, quản trị danh mục/tài khoản/nhật ký.
            </span>
          </div>
          <div class="small text-danger fw-semibold">
            <i class="fa-solid fa-ban me-1"></i>Giới hạn RBAC: Không trực tiếp trả lời tư vấn khách hàng & không cập nhật tiến độ xử lý của tư vấn viên.
          </div>
        </div>
      `;
    } else {
      bannerEl.innerHTML = `
        <div class="alert alert-info border-info shadow-sm mb-0 py-2 px-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <span class="badge bg-primary me-2"><i class="fa-solid fa-headset me-1"></i>VAI TRÒ: NHÂN VIÊN TƯ VẤN & HỖ TRỢ (SUPPORT)</span>
            <span class="small text-dark">
              <strong>Nghiệp vụ được phép:</strong> Xử lý phiếu được Admin phân công cho <strong>${user.full_name}</strong> (hoặc phiếu chờ nhận), trực tiếp tư vấn khách hàng & cập nhật trạng thái xử lý.
            </span>
          </div>
          <div class="small text-secondary fw-semibold">
            <i class="fa-solid fa-lock me-1"></i>Giới hạn RBAC: Không điều phối lại nhân sự, không xóa phiếu & không truy cập cấu hình Quản trị hệ thống.
          </div>
        </div>
      `;
    }
  }
}

function refreshAdminDashboard() {
  renderKPIs();
  renderCharts();
  renderRequestsTable();
  renderEquipmentTable();
  renderKbTable();
  renderCategoriesTable();
  renderUsersTable();
  renderSystemLogsTable();
}

// 1. Tính toán & Hiển thị thẻ KPI
function renderKPIs() {
  const stats = DataRepository.getDashboardStats();

  const totalEl = document.getElementById('kpiTotalRequests');
  const pendingEl = document.getElementById('kpiPendingRequests');
  const processingEl = document.getElementById('kpiProcessingRequests');
  const resolvedEl = document.getElementById('kpiResolvedRequests');
  const clientsEl = document.getElementById('kpiTotalClients');
  const csatEl = document.getElementById('kpiCsatScore');
  const csatCountEl = document.getElementById('kpiCsatCount');
  const equipmentEl = document.getElementById('kpiEquipmentCount');

  if (totalEl) totalEl.textContent = stats.total;
  if (pendingEl) pendingEl.textContent = stats.pending;
  if (processingEl) processingEl.textContent = stats.processing;
  if (resolvedEl) resolvedEl.textContent = stats.resolved;
  if (clientsEl) clientsEl.textContent = stats.clients;
  if (csatEl) csatEl.textContent = `${stats.avgRating} / 5.0 ⭐`;
  if (csatCountEl) csatCountEl.textContent = `Dựa trên ${stats.ratedCount} lượt đánh giá thực tế`;
  if (equipmentEl) equipmentEl.textContent = `${stats.equipmentCount} Thiết bị`;
}

// 2. Vẽ biểu đồ Chart.js
function renderCharts() {
  if (typeof Chart === 'undefined') return;

  const stats = DataRepository.getDashboardStats();

  // Biểu đồ cột: Tình trạng yêu cầu theo tháng (mô phỏng)
  const ctxReq = document.getElementById('chartRequestsOverview');
  if (ctxReq) {
    if (chartRequestsInstance) chartRequestsInstance.destroy();

    chartRequestsInstance = new Chart(ctxReq, {
      type: 'bar',
      data: {
        labels: ['Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10 (Hiện tại)'],
        datasets: [
          {
            label: 'Đã giải quyết',
            data: [12, 18, 25, 32, stats.resolved],
            backgroundColor: '#10B981',
            borderRadius: 6
          },
          {
            label: 'Chưa xử lý / Đang xử lý',
            data: [2, 3, 4, 3, stats.pending + stats.processing],
            backgroundColor: '#F59E0B',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { family: 'Be Vietnam Pro', size: 12 } } },
          tooltip: { padding: 10, cornerRadius: 8 }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: '#F1F5F9' } }
        }
      }
    });
  }

  // Biểu đồ tròn: Phân bổ theo danh mục dịch vụ
  const ctxCat = document.getElementById('chartCategoryDistribution');
  if (ctxCat) {
    if (chartCategoryInstance) chartCategoryInstance.destroy();

    const catLabels = stats.categoryStats.map(c => c.name);
    const catData = stats.categoryStats.map(c => c.count);

    chartCategoryInstance = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: catLabels,
        datasets: [{
          data: catData,
          backgroundColor: [
            '#0F3E6D',
            '#E8890C',
            '#10B981',
            '#EF4444',
            '#0284C7',
            '#8B5CF6'
          ],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: { family: 'Be Vietnam Pro', size: 11 },
              boxWidth: 12,
              padding: 12
            }
          }
        },
        cutout: '65%'
      }
    });
  }
}

// 3. Khởi tạo bộ lọc & ô tìm kiếm
function initAdminFilters() {
  const searchInput = document.getElementById('adminSearchInput');
  const statusFilter = document.getElementById('adminStatusFilter');
  const categoryFilter = document.getElementById('adminCategoryFilter');

  if (categoryFilter) {
    const cats = DataRepository.getCategories();
    categoryFilter.innerHTML = '<option value="ALL">Tất cả danh mục dịch vụ</option>';
    cats.forEach(c => {
      categoryFilter.innerHTML += `<option value="${c.category_id}">${c.category_name}</option>`;
    });
  }

  const handleFilter = () => {
    const searchVal = searchInput ? searchInput.value : '';
    const statusVal = statusFilter ? statusFilter.value : 'ALL';
    const catVal = categoryFilter ? categoryFilter.value : 'ALL';

    renderRequestsTable({
      search: searchVal,
      status: statusVal,
      categoryId: catVal
    });
  };

  if (searchInput) searchInput.addEventListener('input', handleFilter);
  if (statusFilter) statusFilter.addEventListener('change', handleFilter);
  if (categoryFilter) categoryFilter.addEventListener('change', handleFilter);
}

// 4. Bảng danh sách yêu cầu hỗ trợ (Hiển thị SLA, Nhân sự phụ trách, CSAT & Phân quyền RBAC)
function renderRequestsTable(filters = {}) {
  const tbody = document.getElementById('adminRequestsTbody');
  const countEl = document.getElementById('filteredRequestsCount');
  if (!tbody) return;

  const currentUser = Auth.getCurrentUser();
  const isStrictAdmin = Auth.isStrictAdmin();

  // Nếu là Nhân viên Tư vấn (SUPPORT): chỉ hiển thị các phiếu được phân công cho mình hoặc phiếu chờ nhận
  const effectiveFilters = { ...filters };
  if (currentUser && currentUser.role === 'SUPPORT') {
    effectiveFilters.forSupportUser = currentUser;
  }

  const requests = DataRepository.getRequests(effectiveFilters);

  if (countEl) {
    countEl.textContent = isStrictAdmin
      ? `Toàn hệ thống: ${requests.length} phiếu`
      : `Hàng đợi của bạn: ${requests.length} phiếu`;
  }

  if (requests.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-5 text-muted">
          <i class="fa-solid fa-inbox fs-2 mb-2 text-secondary opacity-75"></i>
          <div>Không tìm thấy phiếu yêu cầu nào phù hợp với bộ lọc.</div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  requests.forEach(req => {
    const category = DataRepository.getCategoryById(req.category_id);
    const catName = category ? category.category_name : 'Dịch vụ năng lượng';

    let statusBadge = '';
    if (req.status === 'RESOLVED') {
      statusBadge = `<span class="status-badge status-resolved"><i class="fa-solid fa-circle-check"></i> Đã xử lý</span>`;
    } else if (req.status === 'PROCESSING') {
      statusBadge = `<span class="status-badge status-processing"><i class="fa-solid fa-clock-rotate-left"></i> Đang xử lý</span>`;
    } else {
      statusBadge = `<span class="status-badge status-pending"><i class="fa-solid fa-hourglass-half"></i> Chưa xử lý</span>`;
    }

    let priorityBadge = '';
    if (req.priority === 'URGENT') {
      priorityBadge = `<span class="priority-badge priority-urgent">Khẩn (4h)</span>`;
    } else if (req.priority === 'HIGH') {
      priorityBadge = `<span class="priority-badge priority-high">Cao (24h)</span>`;
    } else {
      priorityBadge = `<span class="priority-badge priority-medium">Thường (48h)</span>`;
    }

    // Hiển thị nhân sự phụ trách rõ ràng (hoặc Chờ Admin điều phối)
    const assignedDisplay = req.assigned_technician_name
      ? `<div class="small fw-bold text-primary"><i class="fa-solid fa-user-check me-1 text-success"></i>${req.assigned_technician_name}</div>`
      : `<span class="badge bg-warning text-dark"><i class="fa-solid fa-hourglass-start me-1"></i>Chờ điều phối</span>`;

    // Đánh giá CSAT
    let ratingDisplay = '<span class="text-muted small">--</span>';
    if (req.rating_score) {
      ratingDisplay = `<span class="badge bg-warning text-dark"><i class="fa-solid fa-star text-danger me-1"></i>${req.rating_score}⭐</span>`;
    }

    // Nút thao tác phân tách rõ ràng theo vai trò (ADMIN vs SUPPORT)
    let actionButtonsHtml = '';
    if (isStrictAdmin) {
      // Nghiệp vụ của ADMIN: Điều phối nhân sự, In phiếu, Xóa phiếu rác (Không trực tiếp trả lời tư vấn hay đổi trạng thái xử lý)
      actionButtonsHtml = `
        <div class="d-flex align-items-center gap-1">
          <button class="btn btn-sm btn-warning text-dark fw-semibold" onclick="openAdminResponseModal(${req.request_id})" title="Điều phối & Phân công nhân sự">
            <i class="fa-solid fa-sitemap me-1"></i>Điều phối
          </button>
          <div class="dropdown">
            <button class="btn btn-sm btn-light border dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
              <li><a class="dropdown-item fw-semibold text-primary" href="javascript:void(0)" onclick="openAdminResponseModal(${req.request_id})"><i class="fa-solid fa-user-check me-2"></i>Điều phối & Giao việc</a></li>
              <li><a class="dropdown-item" href="javascript:void(0)" onclick="printSupportTicket(${req.request_id})"><i class="fa-solid fa-print me-2 text-secondary"></i>In phiếu yêu cầu</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="confirmDeleteRequest(${req.request_id})"><i class="fa-solid fa-trash me-2"></i>Xóa phiếu yêu cầu</a></li>
            </ul>
          </div>
        </div>
      `;
    } else {
      // Nghiệp vụ của NHÂN VIÊN TƯ VẤN (SUPPORT): Tư vấn & Phản hồi khách hàng, Cập nhật tiến độ xử lý (Không phân công lại hay xóa phiếu)
      actionButtonsHtml = `
        <div class="d-flex align-items-center gap-1">
          <button class="btn btn-sm btn-primary fw-semibold" onclick="openAdminResponseModal(${req.request_id})" title="Tư vấn & Phản hồi khách hàng">
            <i class="fa-solid fa-reply me-1"></i>Tư vấn
          </button>
          <div class="dropdown">
            <button class="btn btn-sm btn-light border dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
              <li><a class="dropdown-item fw-semibold text-primary" href="javascript:void(0)" onclick="openAdminResponseModal(${req.request_id})"><i class="fa-solid fa-headset me-2"></i>Tư vấn & Phản hồi KH</a></li>
              <li><a class="dropdown-item" href="javascript:void(0)" onclick="quickChangeStatus(${req.request_id}, 'RESOLVED')"><i class="fa-solid fa-check me-2 text-success"></i>Đánh dấu Đã xử lý</a></li>
              <li><a class="dropdown-item" href="javascript:void(0)" onclick="quickChangeStatus(${req.request_id}, 'PROCESSING')"><i class="fa-solid fa-gear me-2 text-info"></i>Chuyển Đang xử lý</a></li>
              <li><a class="dropdown-item" href="javascript:void(0)" onclick="printSupportTicket(${req.request_id})"><i class="fa-solid fa-print me-2 text-secondary"></i>In phiếu yêu cầu</a></li>
            </ul>
          </div>
        </div>
      `;
    }

    html += `
      <tr>
        <td>
          <span class="fw-bold font-monospace text-primary">${req.request_code}</span>
        </td>
        <td>
          <div class="fw-bold">${req.customer_name}</div>
          <div class="small text-muted"><i class="fa-solid fa-phone me-1 text-secondary"></i><a href="tel:${req.phone}" class="text-decoration-none text-muted">${req.phone}</a></div>
        </td>
        <td>
          <span class="small fw-semibold text-truncate d-inline-block" style="max-width: 160px;" title="${catName}">
            ${catName}
          </span>
        </td>
        <td>
          <div class="fw-semibold text-dark text-truncate" style="max-width: 180px;" title="${req.title}">
            ${req.title}
          </div>
          <div class="text-muted small text-truncate" style="max-width: 180px;">
            ${req.content}
          </div>
        </td>
        <td>
          ${assignedDisplay}
        </td>
        <td>
          ${priorityBadge}
          <div class="text-muted" style="font-size: 0.7rem;"><i class="fa-regular fa-clock me-1"></i>${req.sla_deadline ? req.sla_deadline.substring(5, 16) : '24h'}</div>
        </td>
        <td>${statusBadge}</td>
        <td class="text-center">${ratingDisplay}</td>
        <td>
          ${actionButtonsHtml}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// 5. Modal Điều phối (Admin) hoặc Tư vấn & Phản hồi (Support)
function openAdminResponseModal(requestId) {
  currentActiveRequestId = requestId;
  const req = DataRepository.getRequestById(requestId);
  if (!req) {
    Toast.error('Lỗi', 'Không tìm thấy yêu cầu này.');
    return;
  }

  const currentUser = Auth.getCurrentUser();
  const isStrictAdmin = Auth.isStrictAdmin();

  const category = DataRepository.getCategoryById(req.category_id);
  const catName = category ? category.category_name : 'Dịch vụ năng lượng';

  const headerTitleEl = document.getElementById('adminModalHeaderTitle');
  if (headerTitleEl) {
    headerTitleEl.textContent = isStrictAdmin
      ? 'Điều Phối Nhân Sự & Chỉ Đạo Nội Bộ (Nghiệp Vụ Admin)'
      : 'Tư Vấn Khách Hàng & Cập Nhật Tiến Độ (Nghiệp Vụ Tư Vấn Viên)';
  }

  document.getElementById('adminModalRequestCode').textContent = req.request_code;
  document.getElementById('adminModalCustomerName').textContent = req.customer_name;
  document.getElementById('adminModalPhone').textContent = req.phone;
  document.getElementById('adminModalPhone').href = 'tel:' + req.phone;
  document.getElementById('adminModalEmail').textContent = req.email || 'Không có';
  document.getElementById('adminModalAddress').textContent = req.address || 'Không ghi rõ';
  document.getElementById('adminModalCategory').textContent = catName;
  document.getElementById('adminModalTitle').textContent = req.title;
  document.getElementById('adminModalContent').textContent = req.content;
  document.getElementById('adminModalSla').textContent = req.sla_deadline ? `Cam kết trước: ${req.sla_deadline}` : 'Trong hạn';

  // Hiển thị đánh giá khách hàng
  const ratingBadgeEl = document.getElementById('adminModalRatingBadge');
  if (ratingBadgeEl) {
    if (req.rating_score) {
      ratingBadgeEl.innerHTML = `<span class="badge bg-warning text-dark"><i class="fa-solid fa-star text-danger me-1"></i>${req.rating_score}/5 sao</span> <span class="small fst-italic ms-1 text-muted">"${req.rating_comment || ''}"</span>`;
    } else {
      ratingBadgeEl.innerHTML = `<span class="badge bg-light text-muted border">Chưa có đánh giá</span>`;
    }
  }

  // Hiển thị trạng thái hiện tại
  const statusContainer = document.getElementById('adminModalStatusBadge');
  if (req.status === 'RESOLVED') {
    statusContainer.innerHTML = `<span class="status-badge status-resolved"><i class="fa-solid fa-circle-check"></i> Đã xử lý</span>`;
  } else if (req.status === 'PROCESSING') {
    statusContainer.innerHTML = `<span class="status-badge status-processing"><i class="fa-solid fa-clock-rotate-left"></i> Đang xử lý</span>`;
  } else {
    statusContainer.innerHTML = `<span class="status-badge status-pending"><i class="fa-solid fa-hourglass-half"></i> Chưa xử lý</span>`;
  }

  // Phân tách Panel hiển thị theo đúng Role (ADMIN vs SUPPORT)
  const adminDispatchPanel = document.getElementById('adminDispatchPanel');
  const supportReplyPanel = document.getElementById('supportReplyPanel');

  if (isStrictAdmin) {
    if (adminDispatchPanel) adminDispatchPanel.classList.remove('d-none');
    if (supportReplyPanel) supportReplyPanel.classList.add('d-none');

    const techSelect = document.getElementById('adminAssignTechSelect');
    if (techSelect) {
      techSelect.value = req.assigned_technician_name || 'Ngô Nguyễn Thành Đạt';
    }
    const prioSelect = document.getElementById('adminDispatchPrioritySelect');
    if (prioSelect) {
      prioSelect.value = req.priority || 'MEDIUM';
    }
    const directiveNoteEl = document.getElementById('adminDirectiveNote');
    if (directiveNoteEl) {
      directiveNoteEl.value = '';
    }
  } else {
    if (adminDispatchPanel) adminDispatchPanel.classList.add('d-none');
    if (supportReplyPanel) supportReplyPanel.classList.remove('d-none');

    const statusSelect = document.getElementById('adminResponseStatusSelect');
    if (statusSelect) {
      statusSelect.value = req.status === 'PENDING' ? 'RESOLVED' : req.status;
    }
    const handlerReadonly = document.getElementById('supportHandlerReadonly');
    if (handlerReadonly) {
      handlerReadonly.textContent = req.assigned_technician_name || (currentUser ? currentUser.full_name : 'Ngô Nguyễn Thành Đạt');
    }
    const internalCheck = document.getElementById('adminInternalNoteCheck');
    if (internalCheck) {
      internalCheck.checked = false;
    }
    const responseContentEl = document.getElementById('adminResponseContent');
    if (responseContentEl) {
      responseContentEl.value = '';
    }
  }

  // Tệp đính kèm
  const attachBox = document.getElementById('adminModalAttachmentBox');
  const attachImg = document.getElementById('adminModalAttachmentImg');
  if (req.attachment_url) {
    attachImg.src = req.attachment_url;
    attachBox.classList.remove('d-none');
  } else {
    attachBox.classList.add('d-none');
  }

  renderAdminTimeline(req.request_id);

  const modalEl = document.getElementById('adminResponseModal');
  if (window.bootstrap && window.bootstrap.Modal) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}
window.openAdminResponseModal = openAdminResponseModal;

function renderAdminTimeline(requestId) {
  const container = document.getElementById('adminModalTimeline');
  if (!container) return;

  const logs = DataRepository.getResponseLogs(requestId);

  if (logs.length === 0) {
    container.innerHTML = `
      <div class="text-center py-3 text-muted small bg-light rounded-3 border">
        <i class="fa-regular fa-comment-dots fs-4 mb-1 text-secondary opacity-75"></i>
        <div>Phiếu này chưa có lịch sử phản hồi nào từ kỹ thuật.</div>
      </div>
    `;
    return;
  }

  let html = '<div class="timeline">';
  logs.forEach(log => {
    const isInternal = log.is_internal_note === 1;
    const isCompany = !log.responder_name.includes('Khách hàng');
    const dotClass = isInternal ? 'timeline-dot bg-dark' : isCompany ? 'resolved-dot' : 'client-dot';
    const noteBadge = isInternal ? '<span class="badge bg-secondary ms-2">Chỉ đạo / Ghi chú nội bộ</span>' : '';

    html += `
      <div class="timeline-item">
        <div class="timeline-dot ${dotClass}">
          <i class="fa-solid ${isInternal ? 'fa-lock' : isCompany ? 'fa-headset' : 'fa-user'}"></i>
        </div>
        <div class="timeline-card ${isInternal ? 'border-warning bg-warning-subtle' : ''}">
          <div class="timeline-meta">
            <span class="timeline-responder">
              ${log.responder_name} ${noteBadge}
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

// Nạp các mẫu phản hồi nhanh (Canned Responses)
function initCannedResponses() {
  const menu = document.getElementById('cannedResponsesMenu');
  if (!menu) return;

  const canned = DataRepository.getCannedResponses();
  let html = '';
  canned.forEach((item, idx) => {
    html += `
      <li>
        <a class="dropdown-item small py-2" href="javascript:void(0)" onclick="applyCannedResponse(${idx})">
          <div class="fw-semibold text-primary"><i class="fa-solid fa-bolt me-1 text-warning"></i>${item.title}</div>
          <div class="text-muted text-truncate" style="max-width: 320px;">${item.content}</div>
        </a>
      </li>
    `;
  });
  menu.innerHTML = html;
}

function applyCannedResponse(index) {
  const canned = DataRepository.getCannedResponses();
  if (canned[index]) {
    const textarea = document.getElementById('adminResponseContent');
    if (textarea) {
      textarea.value = canned[index].content;
      textarea.focus();
    }
  }
}
window.applyCannedResponse = applyCannedResponse;

// NGHIỆP VỤ DÀNH RIÊNG CHO ADMIN: Điều phối, phân công nhân sự & ghi chú chỉ đạo nội bộ
function submitAdminDispatch() {
  if (!currentActiveRequestId) return;

  const currentUser = Auth.getCurrentUser();
  if (!Auth.isStrictAdmin()) {
    Toast.error('Sai phân quyền (RBAC)', 'Chỉ Quản trị viên (Admin) mới có quyền điều phối & phân công nhân sự.');
    return;
  }

  const assignedTech = document.getElementById('adminAssignTechSelect').value;
  const priority = document.getElementById('adminDispatchPrioritySelect').value;
  const directiveNote = document.getElementById('adminDirectiveNote').value.trim();

  try {
    const result = DataRepository.dispatchRequestByAdmin(
      currentActiveRequestId,
      currentUser,
      assignedTech,
      priority,
      directiveNote
    );

    Toast.success(
      'Điều phối & Phân công thành công!',
      `Phiếu <strong>${result.request.request_code}</strong> đã được giao cho <strong>${assignedTech}</strong> (Mức ưu tiên: <strong>${priority}</strong>).`
    );

    renderAdminTimeline(currentActiveRequestId);
    document.getElementById('adminDirectiveNote').value = '';

    renderKPIs();
    renderCharts();
    renderRequestsTable();
    renderSystemLogsTable();

    setTimeout(() => {
      const modalEl = document.getElementById('adminResponseModal');
      const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    }, 1000);
  } catch (err) {
    console.error(err);
    Toast.error('Lỗi phân quyền', err.message);
  }
}
window.submitAdminDispatch = submitAdminDispatch;

// NGHIỆP VỤ DÀNH RIÊNG CHO NHÂN VIÊN TƯ VẤN (SUPPORT): Gửi phản hồi tư vấn khách hàng & cập nhật tiến độ
function submitAdminResponse() {
  if (!currentActiveRequestId) return;

  const currentUser = Auth.getCurrentUser();
  if (Auth.isStrictAdmin()) {
    Toast.error('Giới hạn phân quyền (RBAC)', 'Quản trị viên (Admin) chỉ thực hiện điều phối nhân sự, không trực tiếp gửi phản hồi tư vấn khách hàng.');
    return;
  }

  const content = document.getElementById('adminResponseContent').value.trim();
  const newStatus = document.getElementById('adminResponseStatusSelect').value;
  const isInternal = document.getElementById('adminInternalNoteCheck').checked ? 1 : 0;

  if (!content) {
    Toast.warning('Nội dung trống', 'Vui lòng nhập nội dung phản hồi tư vấn giải đáp cho khách hàng.');
    document.getElementById('adminResponseContent').focus();
    return;
  }

  try {
    const result = DataRepository.addResponseWithStatusUpdate(
      currentActiveRequestId,
      currentUser,
      content,
      newStatus,
      isInternal,
      null
    );

    Toast.success(
      'Gửi tư vấn thành công!',
      `Đã gửi phản hồi cho phiếu <strong>${result.request.request_code}</strong> và cập nhật trạng thái sang <strong>${newStatus === 'RESOLVED' ? 'Đã xử lý' : 'Đang xử lý'}</strong>.`
    );

    renderAdminTimeline(currentActiveRequestId);
    document.getElementById('adminResponseContent').value = '';

    renderKPIs();
    renderCharts();
    renderRequestsTable();
    renderSystemLogsTable();

    setTimeout(() => {
      const modalEl = document.getElementById('adminResponseModal');
      const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    }, 1200);

  } catch (err) {
    console.error(err);
    Toast.error('Lỗi giao dịch', err.message);
  }
}
window.submitAdminResponse = submitAdminResponse;

// Chuyển nhanh trạng thái từ menu (Chỉ dành cho Nhân viên Tư vấn)
function quickChangeStatus(requestId, status) {
  const currentUser = Auth.getCurrentUser();
  if (Auth.isStrictAdmin()) {
    Toast.warning('Phân tách nghiệp vụ (RBAC)', 'Việc cập nhật tiến độ xử lý phiếu thuộc thẩm quyền của Nhân viên Tư vấn phụ trách.');
    return;
  }

  const req = DataRepository.getRequestById(requestId);
  if (!req) return;

  if (req.status === 'RESOLVED' && status === 'RESOLVED') {
    Toast.warning('Yêu cầu đã hoàn tất', 'Phiếu này đã ở trạng thái Đã xử lý trước đó, hệ thống ngăn chặn ghi đè trùng lặp.');
    return;
  }

  try {
    DataRepository.updateStatus(requestId, status, currentUser);
    Toast.info('Cập nhật tiến độ', `Phiếu ${req.request_code} đã chuyển sang: ${status === 'RESOLVED' ? 'Đã xử lý' : 'Đang xử lý'}`);
    renderKPIs();
    renderCharts();
    renderRequestsTable();
  } catch (err) {
    Toast.error('Từ chối thao tác', err.message);
  }
}
window.quickChangeStatus = quickChangeStatus;

// Xóa phiếu (Chỉ dành cho Admin)
function confirmDeleteRequest(requestId) {
  const currentUser = Auth.getCurrentUser();
  if (!Auth.isStrictAdmin()) {
    Toast.error('Từ chối quyền xóa (HTTP 403)', 'Nhân viên Tư vấn không được phép xóa phiếu yêu cầu của khách hàng. Vui lòng liên hệ Admin.');
    return;
  }

  const req = DataRepository.getRequestById(requestId);
  if (!req) return;

  if (confirm(`Bạn có chắc chắn muốn xóa phiếu yêu cầu "${req.request_code} - ${req.title}" khỏi hệ thống không?`)) {
    try {
      DataRepository.deleteRequest(requestId, currentUser);
      Toast.success('Đã xóa phiếu', `Phiếu yêu cầu ${req.request_code} đã được loại bỏ.`);
      renderKPIs();
      renderCharts();
      renderRequestsTable();
    } catch (err) {
      Toast.error('Từ chối thao tác', err.message);
    }
  }
}
window.confirmDeleteRequest = confirmDeleteRequest;

// 6. Bảng Quản lý Thiết Bị Đã Lắp Đặt & Bảo Hành (Equipment & Warranty Assets)
function renderEquipmentTable() {
  const tbody = document.getElementById('adminEquipmentTbody');
  if (!tbody) return;

  const items = DataRepository.lookupEquipment();
  let html = '';
  items.forEach(item => {
    html += `
      <tr>
        <td class="font-monospace fw-bold text-primary">${item.serial_number}</td>
        <td>
          <div class="fw-bold">${item.device_name}</div>
          <div class="small text-muted">${item.capacity_kwp || ''} ${item.panels_info ? '• ' + item.panels_info : ''}</div>
        </td>
        <td>
          <div class="fw-semibold">${item.customer_name}</div>
          <div class="small text-muted"><i class="fa-solid fa-phone me-1 text-secondary"></i>${item.phone}</div>
        </td>
        <td class="small">${item.installed_date}</td>
        <td>
          <div class="fw-bold text-danger small">${item.warranty_expires}</div>
          <div class="small text-muted">(${item.warranty_years} năm chính hãng)</div>
        </td>
        <td><span class="badge bg-success-subtle text-success border border-success-subtle"><i class="fa-solid fa-shield-check me-1"></i>Còn hạn</span></td>
        <td>
          <button class="btn btn-outline-primary btn-sm" onclick="createQuickWarrantyTicket('${item.serial_number}', '${item.customer_name}', '${item.phone}', '${item.device_name}')">
            <i class="fa-solid fa-wrench me-1"></i> Tạo phiếu
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function createQuickWarrantyTicket(serial, customer, phone, device) {
  const newReq = DataRepository.createRequest({
    customer_name: customer,
    phone: phone,
    category_id: 4,
    title: `Bảo hành / Sửa chữa thiết bị ${serial}`,
    content: `Yêu cầu kiểm tra sự cố bảo hành cho thiết bị: ${device} (Số Serial: ${serial}).`,
    priority: 'HIGH'
  });

  Toast.success('Đã tạo phiếu bảo hành', `Mã phiếu: ${newReq.request_code} đã được thêm vào hàng đợi.`);
  refreshAdminDashboard();
  switchAdminTab('requests', document.querySelector('[href="#requestsSection"]'));
}
window.createQuickWarrantyTicket = createQuickWarrantyTicket;

// 7. Bảng Thư Viện Mã Lỗi (Knowledge Base)
function renderKbTable() {
  const tbody = document.getElementById('adminKbTbody');
  if (!tbody) return;

  const kb = DataRepository.lookupKnowledgeBase();
  let html = '';
  kb.forEach(item => {
    html += `
      <tr>
        <td><span class="badge bg-danger font-monospace fs-6">${item.code}</span></td>
        <td><span class="badge bg-light text-secondary border">${item.brand}</span></td>
        <td class="fw-bold text-primary">${item.title}</td>
        <td class="small text-secondary">${item.cause}</td>
        <td class="small text-muted" style="white-space: pre-line; max-width: 320px;">${item.solution}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" onclick="copySolutionToResponse('${item.code}')" title="Chép giải pháp">
            <i class="fa-solid fa-copy"></i>
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function copySolutionToResponse(code) {
  const kb = DataRepository.lookupKnowledgeBase(code);
  if (kb && kb.length > 0) {
    const text = `[Hướng dẫn kỹ thuật mã lỗi ${kb[0].code}]\nNguyên nhân: ${kb[0].cause}\nBiện pháp khắc phục:\n${kb[0].solution}`;
    navigator.clipboard.writeText(text).then(() => {
      Toast.success('Đã sao chép!', 'Nội dung hướng dẫn xử lý lỗi đã được lưu vào khay nhớ tạm (Clipboard).');
    });
  }
}
window.copySolutionToResponse = copySolutionToResponse;

// 8. Bảng danh mục dịch vụ
function renderCategoriesTable() {
  const tbody = document.getElementById('adminCategoriesTbody');
  if (!tbody) return;

  const cats = DataRepository.getCategories();
  let html = '';
  cats.forEach(c => {
    html += `
      <tr>
        <td class="fw-bold font-monospace">${c.category_code}</td>
        <td>
          <div class="fw-bold text-primary"><i class="fa-solid ${c.icon} me-2 text-secondary"></i>${c.category_name}</div>
          <div class="small text-muted">${c.description}</div>
        </td>
        <td>
          <span class="badge ${c.is_active ? 'bg-success' : 'bg-secondary'}">${c.is_active ? 'Hoạt động' : 'Tạm dừng'}</span>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// 9. Bảng tài khoản người dùng
function renderUsersTable() {
  const tbody = document.getElementById('adminUsersTbody');
  if (!tbody) return;

  const users = DataRepository.getUsers();
  let html = '';
  users.forEach(u => {
    let roleBadge = '';
    if (u.role === 'ADMIN') roleBadge = '<span class="badge bg-danger">Quản trị & Điều phối (ADMIN)</span>';
    else if (u.role === 'SUPPORT') roleBadge = '<span class="badge bg-primary">Nhân viên Tư vấn & Hỗ trợ (SUPPORT)</span>';
    else roleBadge = '<span class="badge bg-success">Khách hàng (CLIENT)</span>';

    html += `
      <tr>
        <td class="fw-bold">${u.full_name}</td>
        <td><i class="fa-solid fa-phone me-1 text-secondary"></i>${u.phone}</td>
        <td>${u.email}</td>
        <td>${roleBadge}</td>
        <td><span class="badge bg-success-subtle text-success border border-success-subtle">${u.status}</span></td>
        <td class="small text-muted">${u.created_at ? u.created_at.substring(0, 10) : '2026-08-15'}</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// 10. Bảng nhật ký tương tác RESPONSE_LOG
function renderSystemLogsTable() {
  const tbody = document.getElementById('adminLogsTbody');
  if (!tbody) return;

  const logs = DataRepository.getResponseLogs();
  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Chưa có bản ghi nhật ký.</td></tr>`;
    return;
  }

  let html = '';
  logs.slice().reverse().forEach(l => {
    html += `
      <tr>
        <td class="font-monospace fw-bold">#LOG-${l.response_id}</td>
        <td><span class="badge bg-primary font-monospace">REQ-${l.request_id}</span></td>
        <td class="fw-semibold text-primary">${l.responder_name}</td>
        <td class="small" style="max-width: 320px;">${l.response_content}</td>
        <td class="small text-muted">${l.created_at}</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// 11. Xuất dữ liệu sang Excel / CSV
function exportRequestsToCSV() {
  const requests = DataRepository.getRequests();
  let csv = '\uFEFFMã phiếu,Khách hàng,Số điện thoại,Email,Danh mục,Tiêu đề,Kỹ sư phụ trách,Ưu tiên/SLA,Trạng thái,Đánh giá CSAT,Ngày tạo\n';

  requests.forEach(r => {
    const cat = DataRepository.getCategoryById(r.category_id);
    const catName = cat ? cat.category_name : '';
    const row = [
      `"${r.request_code}"`,
      `"${r.customer_name}"`,
      `"${r.phone}"`,
      `"${r.email}"`,
      `"${catName}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.assigned_technician_name || 'Chờ điều phối'}"`,
      `"${r.priority}"`,
      `"${r.status}"`,
      `"${r.rating_score ? r.rating_score + ' sao' : 'Chưa đánh giá'}"`,
      `"${r.created_at}"`
    ];
    csv += row.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HoangGiangSolar_YeuCau_${new Date().toISOString().substring(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  Toast.success('Xuất file thành công', 'Danh sách yêu cầu đã được tải về dưới dạng tệp CSV/Excel.');
}
window.exportRequestsToCSV = exportRequestsToCSV;

// 12. In phiếu hỗ trợ (Print Ticket)
function printSupportTicket(requestId) {
  const req = DataRepository.getRequestById(requestId);
  if (!req) return;

  const cat = DataRepository.getCategoryById(req.category_id);
  const logs = DataRepository.getResponseLogs(requestId);

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Phiếu Hỗ Trợ - ${req.request_code}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; }
        .header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
      </style>
    </head>
    <body>
      <div class="header d-flex justify-content-between align-items-center">
        <div>
          <h4 class="fw-bold mb-1">CÔNG TY TNHH TM DV HOÀNG GIANG SOLAR</h4>
          <div>Địa chỉ: 762 Quốc lộ 13, P. Thới Hòa, TP. Bến Cát, Tỉnh Bình Dương</div>
          <div>Hotline: 0913 704 141 - Website: hoanggiangsolar.vn</div>
        </div>
        <div class="text-end">
          <div class="fs-4 fw-bold font-monospace">${req.request_code}</div>
          <div class="small">Ngày: ${req.created_at}</div>
        </div>
      </div>

      <h3 class="text-center fw-bold mb-4">PHIẾU TIẾP NHẬN & XỬ LÝ YÊU CẦU HỖ TRỢ KỸ THUẬT</h3>

      <table class="table table-bordered mb-4">
        <tr>
          <th style="width: 25%">Họ tên khách hàng:</th>
          <td><strong>${req.customer_name}</strong></td>
          <th style="width: 20%">Số điện thoại:</th>
          <td>${req.phone}</td>
        </tr>
        <tr>
          <th>Địa chỉ công trình:</th>
          <td colspan="3">${req.address || 'Tại công trình'}</td>
        </tr>
        <tr>
          <th>Nhóm dịch vụ:</th>
          <td>${cat ? cat.category_name : ''}</td>
          <th>Nhân sự phụ trách:</th>
          <td><strong>${req.assigned_technician_name || 'Chờ Admin điều phối'}</strong></td>
        </tr>
        <tr>
          <th>Mức ưu tiên / SLA:</th>
          <td><strong>${req.priority}</strong> (Hạn: ${req.sla_deadline || '24h'})</td>
          <th>Trạng thái:</th>
          <td><strong>${req.status}</strong> ${req.rating_score ? `(Đánh giá: ${req.rating_score}⭐)` : ''}</td>
        </tr>
        <tr>
          <th>Tiêu đề yêu cầu:</th>
          <td colspan="3"><strong>${req.title}</strong></td>
        </tr>
        <tr>
          <th>Nội dung chi tiết:</th>
          <td colspan="3" style="min-height: 80px;">${req.content}</td>
        </tr>
      </table>

      <h5 class="fw-bold mb-2">LỊCH SỬ PHẢN HỒI & BIỆN PHÁP XỬ LÝ CỦA KỸ THUẬT:</h5>
      <table class="table table-bordered">
        <thead>
          <tr class="table-light">
            <th style="width: 15%">Thời gian</th>
            <th style="width: 25%">Người xử lý</th>
            <th>Nội dung giải đáp / kết quả xử lý</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(l => `
            <tr>
              <td>${l.created_at}</td>
              <td><strong>${l.responder_name}</strong></td>
              <td>${l.response_content}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="row mt-5 pt-4 text-center">
        <div class="col-6">
          <div class="fw-bold">KHÁCH HÀNG XÁC NHẬN</div>
          <div class="small text-muted">(Ký và ghi rõ họ tên)</div>
          <div style="height: 80px;"></div>
          <div>${req.customer_name}</div>
        </div>
        <div class="col-6">
          <div class="fw-bold">ĐẠI DIỆN HOÀNG GIANG SOLAR</div>
          <div class="small text-muted">(Nhân viên Tư vấn / Kỹ thuật phụ trách)</div>
          <div style="height: 80px;"></div>
          <div>${req.assigned_technician_name || 'Ngô Nguyễn Thành Đạt'}</div>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
window.printSupportTicket = printSupportTicket;

// 13. Khôi phục dữ liệu gốc (Chỉ dành cho Admin)
function triggerFactoryReset() {
  if (!Auth.isStrictAdmin()) {
    Toast.error('Từ chối quyền hạn (HTTP 403)', 'Chỉ Quản trị viên (Admin) mới được phép khôi phục dữ liệu gốc của hệ thống.');
    return;
  }

  if (confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu của Hoàng Giang Solar?\nThao tác này sẽ đặt lại các phiếu yêu cầu, hồ sơ thiết bị và nhật ký theo đúng file báo cáo tốt nghiệp.')) {
    DataRepository.resetData();
    Toast.success('Đã khôi phục', 'Dữ liệu hệ thống đã được thiết lập lại về mặc định.');
    refreshAdminDashboard();
  }
}
window.triggerFactoryReset = triggerFactoryReset;
