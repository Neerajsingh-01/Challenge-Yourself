// Analytics Module
const analyticsModule = {
  charts: {},

  init() {
    this.renderAnalytics();
  },

  calculateTimeByCategory(tasks, history) {
    const timeData = {};
    const categories = ['work', 'personal', 'fitness', 'learning', 'other'];
    
    categories.forEach(cat => timeData[cat] = 0);
    
    history.forEach(h => {
      const task = tasks.find(t => t.id === h.id);
      if (task && task.category) {
        const time = (task.end - task.created) / (1000 * 60); // minutes
        timeData[task.category] = (timeData[task.category] || 0) + time;
      }
    });

    return timeData;
  },

  renderAnalytics() {
    const tasks = JSON.parse(localStorage.getItem('cy_tasks') || '[]');
    const history = JSON.parse(localStorage.getItem('cy_history') || '[]');
    
    const timeData = this.calculateTimeByCategory(tasks, history);
    
    // Time by Category Chart
    const timeCatCtx = document.getElementById('time-by-category');
    if (timeCatCtx && timeCatCtx.getContext) {
      const ctx = timeCatCtx.getContext('2d');
      this.createChart(ctx, 'Time by Category', Object.keys(timeData), Object.values(timeData), 'doughnut');
    }

    // Completion Chart
    const completionCtx = document.getElementById('completion-chart');
    if (completionCtx && completionCtx.getContext) {
      const ctx = completionCtx.getContext('2d');
      const completed = history.filter(h => h.message.includes('completed')).length;
      const failed = history.filter(h => h.message.includes('failed')).length;
      this.createChart(ctx, 'Task Completion Status', ['Completed', 'Failed'], [completed, failed], 'bar');
    }
  },

  createChart(ctx, label, labels, data, type) {
    const colors = ['#7c3aed', '#ff2d95', '#10b981', '#f59e0b', '#ef4444'];
    
    new Chart(ctx, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { color: 'var(--text)' } } },
        scales: {
          y: {
            ticks: { color: 'var(--muted)' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          }
        }
      }
    });
  }
};
