// Recurring Tasks Module
const recurringModule = {
  enabled: false,
  pattern: 'daily',

  init() {
    const recurringCheckbox = document.getElementById('recurring-enabled');
    const patternSelect = document.getElementById('recurring-pattern');
    
    recurringCheckbox?.addEventListener('change', (e) => {
      this.enabled = e.target.checked;
      patternSelect?.classList.toggle('hidden', !this.enabled);
    });
  },

  create(task) {
    if (!this.enabled || !this.pattern) return null;
    
    const recurringTask = { ...task, recurring: { pattern: this.pattern, createdAt: Date.now() } };
    return recurringTask;
  },

  processRecurring(tasks) {
    const now = Date.now();
    tasks.forEach(t => {
      if (t.recurring) {
        const created = t.recurring.createdAt;
        const elapsed = now - created;
        const taskDuration = t.totalDuration || 1000;
        
        if (elapsed > taskDuration) {
          const newTask = { ...t, id: Date.now() + '-' + Math.random().toString(36).slice(2, 8), recurring: { ...t.recurring, createdAt: now }, _new: true, notified: false };
          tasks.push(newTask);
        }
      }
    });
  },

  getPattern() {
    return document.getElementById('recurring-pattern')?.value || 'daily';
  }
};
