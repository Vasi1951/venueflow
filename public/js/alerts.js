/* ============================================
   VenueFlow — Smart Alerts System
   ============================================ */

const Alerts = (() => {
  let toasts = [];
  let autoAlertInterval = null;
  let alertCount = 0;

  function addToast({ type = 'info', title, message }) {
    const id = 'toast-' + Date.now() + Math.random().toString(36).slice(2,6);
    const toast = { id, type, title, message, time: new Date() };
    toasts.unshift(toast);
    alertCount++;

    // Keep max 5 visible
    if (toasts.length > 5) {
      toasts = toasts.slice(0, 5);
    }

    renderToasts();
    updateBadge();

    // Auto-dismiss after 8 seconds
    setTimeout(() => dismissToast(id), 8000);
  }

  function dismissToast(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('dismissing');
      setTimeout(() => {
        toasts = toasts.filter(t => t.id !== id);
        renderToasts();
      }, 300);
    }
  }

  function renderToasts() {
    const panel = document.getElementById('alerts-panel');
    if (!panel) return;

    panel.innerHTML = toasts.map(toast => `
      <div class="alert-toast alert-toast--${toast.type}" id="${toast.id}">
        <div class="alert-toast__header">
          <div class="alert-toast__title">${toast.title}</div>
          <span class="alert-toast__close" onclick="Alerts.dismissToast('${toast.id}')">&times;</span>
        </div>
        <div class="alert-toast__message">${toast.message}</div>
        <div class="alert-toast__time">${toast.time.toLocaleTimeString()}</div>
      </div>
    `).join('');
  }

  function updateBadge() {
    const badge = document.getElementById('alert-count');
    if (badge) badge.textContent = alertCount;
  }

  // Start auto-alerts (simulate smart notifications)
  function startAutoAlerts() {
    const templates = VenueData.getAlertTemplates();
    let templateIdx = 0;

    // Send first alert after 5 seconds
    setTimeout(() => {
      addToast(templates[templateIdx]);
      templateIdx = (templateIdx + 1) % templates.length;
    }, 5000);

    // Then every 15-30 seconds
    autoAlertInterval = setInterval(() => {
      addToast(templates[templateIdx]);
      templateIdx = (templateIdx + 1) % templates.length;
    }, 15000 + Math.random() * 15000);
  }

  function stopAutoAlerts() {
    if (autoAlertInterval) {
      clearInterval(autoAlertInterval);
      autoAlertInterval = null;
    }
  }

  function init() {
    // Start smart auto-alerts
    startAutoAlerts();

    // Alert toggle button
    const toggleBtn = document.getElementById('alerts-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const panel = document.getElementById('alerts-panel');
        if (panel) {
          panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        }
      });
    }
  }

  return { init, addToast, dismissToast, startAutoAlerts, stopAutoAlerts };
})();
