// Export & Backup Module
const exportModule = {
  init() {
    const exportBtn = document.getElementById('export-btn');
    exportBtn?.addEventListener('click', () => this.export());
  },

  export() {
    const tasks = JSON.parse(localStorage.getItem('cy_tasks') || '[]');
    const history = JSON.parse(localStorage.getItem('cy_history') || '[]');
    const achievements = JSON.parse(localStorage.getItem('cy_achievements') || '{}');
    
    const data = {
      exported: new Date().toISOString(),
      tasks,
      history,
      achievements
    };

    // CSV format
    let csv = 'Task Data Export\n\n';
    csv += 'ACTIVE TASKS\n';
    csv += 'Title,Category,Difficulty,Priority,Status,Time Left\n';
    tasks.forEach(t => {
      const timeLeft = Math.max(0, t.end - Date.now());
      csv += `"${t.title}","${t.category}","${t.difficulty}","${t.priority}","Active","${timeLeft}ms"\n`;
    });

    csv += '\n\nCOMPLETED TASKS\n';
    csv += 'Task,Completion Time,Date\n';
    history.forEach(h => {
      csv += `"${h.message}","${new Date(h.time).toLocaleString()}"\n`;
    });

    csv += '\n\nACHIEVEMENTS\n';
    csv += `Completed Tasks,${achievements.completed}\n`;
    csv += `Current Streak,${achievements.streak}\n`;
    csv += `Total Difficulty Points,${achievements.totalDifficulty}\n`;

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `challenge-backup-${Date.now()}.csv`;
    link.click();

    // Also JSON backup
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const jsonLink = document.createElement('a');
    jsonLink.href = URL.createObjectURL(jsonBlob);
    jsonLink.download = `challenge-backup-${Date.now()}.json`;
    jsonLink.click();

    alert('✅ Backup exported! Both CSV and JSON files downloaded.');
  }
};
