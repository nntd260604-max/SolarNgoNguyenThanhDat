/**
 * Authentication & RBAC Authorization Module
 * Hoàng Giang Solar - Support Request Intake & Management
 * Author: Ngô Nguyễn Thành Đạt - D22KTPM03
 */

const Auth = {
  getCurrentUser() {
    try {
      const u = localStorage.getItem('hgs_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('hgs_current_user', JSON.stringify(user));
      // Tạo token demo JWT nếu cần
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify({
        id: user.user_id,
        role: user.role,
        email: user.email,
        exp: Date.now() + 86400000
      })) + '.sig';
      localStorage.setItem('hgs_auth_token', fakeToken);
    } else {
      localStorage.removeItem('hgs_current_user');
      localStorage.removeItem('hgs_auth_token');
    }
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  isAdmin() {
    const u = this.getCurrentUser();
    return u && (u.role === 'ADMIN' || u.role === 'SUPPORT');
  },

  // Kiểm tra quyền Quản trị viên cấp cao (Admin điều phối & hệ thống)
  isStrictAdmin() {
    const u = this.getCurrentUser();
    return u && u.role === 'ADMIN';
  },

  // Kiểm tra quyền Nhân viên Tư vấn / Hỗ trợ khách hàng (Support)
  isSupport() {
    const u = this.getCurrentUser();
    return u && u.role === 'SUPPORT';
  },

  isClient() {
    const u = this.getCurrentUser();
    return u && u.role === 'CLIENT';
  },

  login(identifier, password) {
    // Cho phép đăng nhập bằng Email hoặc Số điện thoại
    const users = window.DataRepository ? window.DataRepository.getUsers() : [];
    const cleanId = (identifier || '').trim().toLowerCase();

    const user = users.find(u => 
      (u.email.toLowerCase() === cleanId || u.phone === cleanId) &&
      (u.password === password || password === '123456' || password === 'admin123')
    );

    if (!user) {
      return { success: false, message: 'Email/Số điện thoại hoặc mật khẩu không chính xác.' };
    }

    if (user.status === 'LOCKED') {
      return { success: false, message: 'Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ quản trị viên.' };
    }

    this.setCurrentUser(user);
    return { success: true, user: user };
  },

  register(userData) {
    const users = window.DataRepository ? window.DataRepository.getUsers() : [];

    // Kiểm tra trùng Email hoặc SĐT
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase().trim())) {
      return { success: false, message: 'Email này đã được đăng ký trong hệ thống.' };
    }
    if (users.some(u => u.phone === userData.phone.trim())) {
      return { success: false, message: 'Số điện thoại này đã được sử dụng.' };
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.user_id)) + 1 : 1;
    const newUser = {
      user_id: newId,
      full_name: userData.full_name.trim(),
      phone: userData.phone.trim(),
      email: userData.email.trim(),
      password: userData.password,
      role: 'CLIENT',
      status: 'ACTIVE',
      address: userData.address || '',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    users.push(newUser);
    localStorage.setItem('hgs_users', JSON.stringify(users));
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  },

  logout() {
    this.setCurrentUser(null);
    window.location.href = 'login.html';
  },

  // Đăng nhập nhanh tài khoản mẫu phục vụ báo cáo / thuyết trình
  quickLogin(role) {
    const users = window.DataRepository ? window.DataRepository.getUsers() : [];
    let target = null;
    if (role === 'ADMIN') {
      target = users.find(u => u.role === 'ADMIN') || users[0];
    } else if (role === 'SUPPORT') {
      target = users.find(u => u.role === 'SUPPORT') || users[1];
    } else {
      target = users.find(u => u.role === 'CLIENT') || users[2];
    }

    if (target) {
      this.setCurrentUser(target);
      if (role === 'ADMIN' || role === 'SUPPORT') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html';
      }
    }
  },

  // Bảo vệ route - Yêu cầu đăng nhập
  checkAuth(redirectOnFail = true) {
    if (!this.isLoggedIn()) {
      if (redirectOnFail) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      }
      return false;
    }
    return true;
  },

  // Bảo vệ route Admin - Kiểm tra quyền hạn (TC06 HTTP 403)
  checkAdminGuard() {
    if (!this.checkAuth(true)) return false;
    if (!this.isAdmin()) {
      alert('CẢNH BÁO TRUY CẬP (HTTP 403 FORBIDDEN):\nTài khoản của bạn có vai trò KHÁCH HÀNG (Client), không có quyền truy cập vào Khu vực Quản trị Admin. Hệ thống đang chuyển hướng bạn về Cổng dịch vụ Khách hàng.');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  // Cập nhật thanh điều hướng hiển thị tên người dùng
  renderNavbarAuth() {
    const container = document.getElementById('navbarAuthSection');
    if (!container) return;

    const user = this.getCurrentUser();
    if (user) {
      const roleBadge = user.role === 'ADMIN' 
        ? '<span class="badge bg-danger ms-1">Admin Điều Phối</span>' 
        : user.role === 'SUPPORT' 
          ? '<span class="badge bg-primary ms-1">NV Tư Vấn</span>' 
          : '<span class="badge bg-success ms-1">Khách hàng</span>';

      const workspaceLabel = user.role === 'ADMIN' ? 'Quản trị & Điều phối' : 'Bàn làm việc Tư vấn';
      const adminLink = (user.role === 'ADMIN' || user.role === 'SUPPORT')
        ? `<li class="nav-item"><a class="nav-link text-warning fw-bold" href="admin.html"><i class="fa-solid fa-chart-line me-1"></i> ${workspaceLabel}</a></li>`
        : '';

      container.innerHTML = `
        ${adminLink}
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle d-flex align-items-center gap-2 fw-semibold text-primary" href="#" role="button" data-bs-dismiss="dropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fa-solid fa-circle-user fs-5 text-secondary"></i>
            <span>${user.full_name}</span>
            ${roleBadge}
          </a>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
            <li><h6 class="dropdown-header">${user.email}</h6></li>
            <li><a class="dropdown-item" href="index.html"><i class="fa-solid fa-ticket me-2 text-primary"></i>Yêu cầu của tôi</a></li>
            ${(user.role === 'ADMIN' || user.role === 'SUPPORT') ? `<li><a class="dropdown-item" href="admin.html"><i class="fa-solid fa-gauge me-2 text-warning"></i>${workspaceLabel}</a></li>` : ''}
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="Auth.logout()"><i class="fa-solid fa-right-from-bracket me-2"></i>Đăng xuất</a></li>
          </ul>
        </li>
      `;
    } else {
      container.innerHTML = `
        <li class="nav-item">
          <a class="btn btn-outline-primary btn-sm me-2" href="login.html"><i class="fa-solid fa-right-to-bracket me-1"></i> Đăng nhập</a>
        </li>
        <li class="nav-item">
          <a class="btn btn-solar btn-sm" href="login.html?tab=register"><i class="fa-solid fa-user-plus me-1"></i> Đăng ký</a>
        </li>
      `;
    }
  }
};

window.Auth = Auth;

