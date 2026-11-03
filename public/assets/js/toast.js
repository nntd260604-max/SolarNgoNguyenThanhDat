/**
 * Toast Notification Module
 * Hoàng Giang Solar - Customer Support System
 * Author: Ngô Nguyễn Thành Đạt
 */

const Toast = {
  container: null,

  init() {
    if (!this.container) {
      let el = document.getElementById('toast-container');
      if (!el) {
        el = document.createElement('div');
        el.id = 'toast-container';
        el.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        el.style.zIndex = '9999';
        document.body.appendChild(el);
      }
      this.container = el;
    }
  },

  show(title, message, type = 'info', duration = 4000) {
    this.init();

    const toastId = 'toast_' + Date.now();
    const config = {
      success: { bg: 'bg-success', icon: 'fa-circle-check', text: 'text-white' },
      error: { bg: 'bg-danger', icon: 'fa-circle-xmark', text: 'text-white' },
      warning: { bg: 'bg-warning', icon: 'fa-triangle-exclamation', text: 'text-dark' },
      info: { bg: 'bg-primary', icon: 'fa-circle-info', text: 'text-white' }
    }[type] || { bg: 'bg-secondary', icon: 'fa-bell', text: 'text-white' };

    const html = `
      <div id="${toastId}" class="toast align-items-center ${config.bg} ${config.text} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2 py-3 px-3">
            <i class="fa-solid ${config.icon} fs-5"></i>
            <div>
              <div class="fw-bold fs-6">${title}</div>
              <div class="small opacity-90">${message}</div>
            </div>
          </div>
          <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    this.container.insertAdjacentHTML('beforeend', html);
    const toastEl = document.getElementById(toastId);
    if (window.bootstrap && window.bootstrap.Toast) {
      const bsToast = new window.bootstrap.Toast(toastEl, { delay: duration });
      bsToast.show();
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    } else {
      setTimeout(() => toastEl.remove(), duration);
    }
  },

  success(title, message) {
    this.show(title, message, 'success');
  },

  error(title, message) {
    this.show(title, message, 'error');
  },

  warning(title, message) {
    this.show(title, message, 'warning');
  },

  info(title, message) {
    this.show(title, message, 'info');
  }
};

window.Toast = Toast;

