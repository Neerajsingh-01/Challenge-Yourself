// Task Templates Module
const templatesModule = {
  templates: [
    { name: '💪 Gym Session', category: 'fitness', difficulty: 'medium', minutes: 60, desc: 'Complete your workout routine' },
    { name: '📚 Study Session', category: 'learning', difficulty: 'hard', minutes: 120, desc: 'Focus study time' },
    { name: '💼 Work Sprint', category: 'work', difficulty: 'medium', minutes: 90, desc: 'Focused work block' },
    { name: '🧘 Meditation', category: 'personal', difficulty: 'easy', minutes: 15, desc: 'Mindfulness and relaxation' },
    { name: '🏃 Morning Run', category: 'fitness', difficulty: 'medium', minutes: 45, desc: 'Cardio exercise' },
    { name: '📖 Reading', category: 'learning', difficulty: 'easy', minutes: 30, desc: 'Daily reading time' },
    { name: '🎯 Project Work', category: 'work', difficulty: 'hard', minutes: 180, desc: 'Deep work on project' },
    { name: '✍️ Journal Writing', category: 'personal', difficulty: 'easy', minutes: 20, desc: 'Reflective journaling' }
  ],

  init() {
    const templateBtn = document.getElementById('template-btn');
    const templatesModal = document.getElementById('templates-modal');
    const templateModalClose = document.getElementById('templates-modal-close');
    
    templateBtn?.addEventListener('click', () => {
      this.renderTemplates();
      templatesModal?.classList.remove('hidden');
    });
    
    templateModalClose?.addEventListener('click', () => {
      templatesModal?.classList.add('hidden');
    });
  },

  renderTemplates() {
    const templatesList = document.getElementById('templates-list');
    if (!templatesList) return;
    
    templatesList.innerHTML = this.templates.map(t => `
      <div class="template-card">
        <h3>${t.name}</h3>
        <p>${t.desc}</p>
        <div class="template-meta">
          <span>${t.category}</span>
          <span>${t.difficulty}</span>
          <span>${t.minutes}m</span>
        </div>
        <button class="btn primary template-use-btn" data-name="${t.name}" data-minutes="${t.minutes}" data-category="${t.category}" data-difficulty="${t.difficulty}">Use Template</button>
      </div>
    `).join('');

    document.querySelectorAll('.template-use-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = e.target.dataset.name;
        const minutes = e.target.dataset.minutes;
        const category = e.target.dataset.category;
        const difficulty = e.target.dataset.difficulty;
        
        document.getElementById('title').value = name;
        document.getElementById('minutes').value = minutes;
        document.getElementById('category').value = category;
        document.getElementById('difficulty').value = difficulty;
        document.getElementById('templates-modal').classList.add('hidden');
        document.getElementById('title').focus();
      });
    });
  }
};
