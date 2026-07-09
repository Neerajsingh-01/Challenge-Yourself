// Task Notes Module
const notesModule = {
  store: JSON.parse(localStorage.getItem('cy_task_notes') || '{}'),

  init() {
    // Notes are edited in the edit modal
  },

  save(taskId, notes) {
    this.store[taskId] = notes;
    localStorage.setItem('cy_task_notes', JSON.stringify(this.store));
  },

  get(taskId) {
    return this.store[taskId] || '';
  },

  addToTask(task) {
    task.notes = this.get(task.id);
    return task;
  },

  displayNote(taskId) {
    const note = this.get(taskId);
    if (note) {
      const noteEl = document.createElement('div');
      noteEl.className = 'task-note';
      noteEl.textContent = '📝 ' + note;
      return noteEl;
    }
    return null;
  }
};
