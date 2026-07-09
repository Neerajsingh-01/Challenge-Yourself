// Enhanced Notifications Module
const notificationsModule = {
  notificationLog: JSON.parse(localStorage.getItem('cy_notifications') || '[]'),

  init() {
    // Request permissions on init
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  },

  notify(title, options = {}) {
    const fullOptions = {
      icon: '🎯',
      badge: '🎯',
      ...options
    };

    try {
      if (window.Notification && Notification.permission === 'granted') {
        new Notification(title, fullOptions);
        this.logNotification(title, options.body);
      }
    } catch (e) {
      console.warn('Notification failed:', e);
    }
  },

  logNotification(title, body) {
    this.notificationLog.push({ title, body, time: Date.now() });
    if (this.notificationLog.length > 100) this.notificationLog.shift();
    localStorage.setItem('cy_notifications', JSON.stringify(this.notificationLog));
  },

  getLog() {
    return this.notificationLog;
  }
};
