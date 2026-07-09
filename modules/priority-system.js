// Priority System Module
const priorityModule = {
  icons: { high: '🔴', medium: '🟡', low: '🟢' },
  colors: { high: '#ef4444', medium: '#f59e0b', low: '#10b981' },

  getPriority() {
    return document.getElementById('priority')?.value || 'medium';
  },

  renderPriorityBadge(priority) {
    const badge = document.createElement('span');
    badge.className = `priority-badge priority-${priority}`;
    badge.textContent = priority.charAt(0).toUpperCase() + priority.slice(1) + ' ' + this.icons[priority];
    return badge;
  },

  sortByPriority(tasks) {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return tasks.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));
  },

  filterByPriority(tasks, priority) {
    if (!priority) return tasks;
    return tasks.filter(t => t.priority === priority);
  }
};
