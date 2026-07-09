// Main app script (replaces script.js functionality)
const form = document.getElementById('task-form');
const listEl = document.getElementById('task-list');
const historyEl = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const testBtn = document.getElementById('test-sound');
const themeToggle = document.getElementById('theme-toggle');
const authPage = document.getElementById('auth-page');
const appShell = document.getElementById('app-shell');
const signinTab = document.getElementById('signin-tab');
const registerTab = document.getElementById('register-tab');
const signinForm = document.getElementById('signin-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');
const userGreeting = document.getElementById('user-greeting');
const logoutBtn = document.getElementById('logout-btn');

// New elements for features
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const searchInput = document.getElementById('search-tasks');
const filterCategory = document.getElementById('filter-category');
const filterPriority = document.getElementById('filter-priority');
const alarmSelect = document.getElementById('alarm-select');
const reminder5min = document.getElementById('reminder-5min');
const reminder1min = document.getElementById('reminder-1min');
const reminder30sec = document.getElementById('reminder-30sec');

let tasks = JSON.parse(localStorage.getItem('cy_tasks') || '[]');
let history = JSON.parse(localStorage.getItem('cy_history') || '[]');
let theme = localStorage.getItem('cy_theme');
let users = JSON.parse(localStorage.getItem('cy_users') || '[]');
let currentUser = null;
try {
  const stored = localStorage.getItem('cy_current_user');
  currentUser = stored ? JSON.parse(stored) : null;
} catch(e) {
  currentUser = null;
}
let achievements = JSON.parse(localStorage.getItem('cy_achievements') || '{"completed":0,"streak":0,"totalDifficulty":0,"lastCompleted":null}');

// New state
let editingTaskId = null;
let selectedSound = localStorage.getItem('cy_sound') || 'default';
let reminders = {
  '5min': reminder5min?.checked ?? true,
  '1min': reminder1min?.checked ?? true,
  '30sec': reminder30sec?.checked ?? true
};
let notified = {}; // Track which reminders have been shown for each task

function saveUsers(){
  localStorage.setItem('cy_users', JSON.stringify(users));
}

function setAuthMessage(message, type = ''){
  if(!authMessage) return;
  authMessage.textContent = message;
  authMessage.className = 'auth-message';
  if(type) authMessage.classList.add(type);
}

function showAuthForm(mode){
  const isRegister = mode === 'register';
  signinForm?.classList.toggle('hidden', isRegister);
  registerForm?.classList.toggle('hidden', !isRegister);
  signinTab?.classList.toggle('active', !isRegister);
  registerTab?.classList.toggle('active', isRegister);
  setAuthMessage('');
}

function showApp(){
  authPage?.classList.add('hidden');
  appShell?.classList.remove('hidden');
  if(userGreeting && currentUser) userGreeting.textContent = `Hi, ${currentUser.name}`;
}

function showLogin(){
  appShell?.classList.add('hidden');
  authPage?.classList.remove('hidden');
  showAuthForm('signin');
}

function loginUser(user){
  currentUser = { name: user.name, email: user.email };
  localStorage.setItem('cy_current_user', JSON.stringify(currentUser));
  showApp();
}

signinTab?.addEventListener('click', ()=>showAuthForm('signin'));
registerTab?.addEventListener('click', ()=>showAuthForm('register'));

registerForm?.addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const password = document.getElementById('register-password').value;

  if(users.some(user => user.email === email)){
    setAuthMessage('This email is already registered. Sign in instead.', 'error');
    return;
  }

  const user = { name, email, password };
  users.push(user);
  saveUsers();
  registerForm.reset();
  setAuthMessage('Account created. You are signed in.', 'success');
  setTimeout(()=>loginUser(user), 450);
});

signinForm?.addEventListener('submit', e=>{
  e.preventDefault();
  const email = document.getElementById('signin-email').value.trim().toLowerCase();
  const password = document.getElementById('signin-password').value;
  const user = users.find(item => item.email === email && item.password === password);

  if(!user){
    setAuthMessage('Email or password is incorrect.', 'error');
    return;
  }

  signinForm.reset();
  loginUser(user);
});

logoutBtn?.addEventListener('click', ()=>{
  currentUser = null;
  localStorage.removeItem('cy_current_user');
  showLogin();
});

if(currentUser) showApp();
else showLogin();

// ===== NEW FEATURES =====

// Edit Modal Functions
function openEditModal(taskId){
  const task = tasks.find(t => t.id === taskId);
  if(!task) return;
  editingTaskId = taskId;
  document.getElementById('edit-title').value = task.title;
  document.getElementById('edit-desc').value = task.desc || '';
  document.getElementById('edit-notes').value = task.notes || '';
  document.getElementById('edit-category').value = task.category || 'work';
  document.getElementById('edit-difficulty').value = task.difficulty || 'easy';
  document.getElementById('edit-priority').value = task.priority || 'medium';
  editModal.classList.remove('hidden');
}

function closeEditModal(){
  editModal.classList.add('hidden');
  editingTaskId = null;
}

editForm?.addEventListener('submit', e => {
  e.preventDefault();
  const task = tasks.find(t => t.id === editingTaskId);
  if(task){
    task.title = document.getElementById('edit-title').value.trim();
    task.desc = document.getElementById('edit-desc').value.trim();
    task.notes = document.getElementById('edit-notes').value.trim();
    task.category = document.getElementById('edit-category').value;
    task.difficulty = document.getElementById('edit-difficulty').value;
    task.priority = document.getElementById('edit-priority').value;
    notesModule.save(taskId, task.notes);
    save();
    render();
    closeEditModal();
  }
});

modalClose?.addEventListener('click', closeEditModal);
modalCancel?.addEventListener('click', closeEditModal);

// Search & Filter
function filterTasks(){
  const search = (searchInput?.value || '').toLowerCase();
  const category = filterCategory?.value || '';
  const priority = filterPriority?.value || '';
  let filtered = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search) || (t.desc || '').toLowerCase().includes(search);
    const matchesCategory = !category || t.category === category;
    const matchesPriority = !priority || t.priority === priority;
    return matchesSearch && matchesCategory && matchesPriority;
  });
  return priorityModule.sortByPriority(filtered);
}

searchInput?.addEventListener('input', render);
filterCategory?.addEventListener('change', render);
filterPriority?.addEventListener('change', render);

// Pause/Resume
function togglePause(taskId){
  const task = tasks.find(t => t.id === taskId);
  if(!task) return;
  if(!task.paused){
    task.paused = true;
    task.pausedTime = Date.now();
  } else {
    const pausedDuration = Date.now() - task.pausedTime;
    task.end += pausedDuration;
    task.paused = false;
    delete task.pausedTime;
  }
  save();
  render();
}

// Sound Selection
alarmSelect?.addEventListener('change', e => {
  selectedSound = e.target.value;
  localStorage.setItem('cy_sound', selectedSound);
});

// Reminders
if(reminder5min?.checked !== undefined) reminders['5min'] = reminder5min.checked;
if(reminder1min?.checked !== undefined) reminders['1min'] = reminder1min.checked;
if(reminder30sec?.checked !== undefined) reminders['30sec'] = reminder30sec.checked;

reminder5min?.addEventListener('change', e => { reminders['5min'] = e.target.checked; });
reminder1min?.addEventListener('change', e => { reminders['1min'] = e.target.checked; });
reminder30sec?.addEventListener('change', e => { reminders['30sec'] = e.target.checked; });

function checkReminders(){
  const now = Date.now();
  tasks.forEach(t => {
    if(t.paused || t.notified) return;
    const remaining = t.end - now;
    const notifyKey = t.id;
    if(!notified[notifyKey]) notified[notifyKey] = {};
    
    if(reminders['5min'] && remaining <= 5*60*1000 && remaining > 4*60*1000 && !notified[notifyKey]['5min']){
      notified[notifyKey]['5min'] = true;
      try{ if(window.Notification && Notification.permission==='granted') new Notification('Reminder', {body: `${t.title} - 5 minutes left`}); }catch(e){}
    }
    if(reminders['1min'] && remaining <= 60*1000 && remaining > 30*1000 && !notified[notifyKey]['1min']){
      notified[notifyKey]['1min'] = true;
      try{ if(window.Notification && Notification.permission==='granted') new Notification('Reminder', {body: `${t.title} - 1 minute left`}); }catch(e){}
    }
    if(reminders['30sec'] && remaining <= 30*1000 && remaining > 0 && !notified[notifyKey]['30sec']){
      notified[notifyKey]['30sec'] = true;
      try{ if(window.Notification && Notification.permission==='granted') new Notification('Reminder', {body: `${t.title} - 30 seconds left`}); }catch(e){}
    }
  });
}

// Statistics
function calculateStats(){
  let completed = 0, failed = 0, totalTime = 0;
  const categoryStats = {};
  history.forEach(h => {
    if(h.message.includes('completed')) completed++;
    else if(h.message.includes('failed')) failed++;
  });
  tasks.forEach(t => {
    const elapsed = (t.created && t.end) ? (t.end - t.created) : 0;
    if(elapsed > 0) totalTime += elapsed;
  });
  const successRate = (completed + failed) > 0 ? Math.round((completed / (completed + failed)) * 100) : 0;
  const avgTime = completed > 0 ? Math.round(totalTime / completed / 60000) : 0;
  
  tasks.forEach(t => {
    if(!categoryStats[t.category]) categoryStats[t.category] = 0;
    categoryStats[t.category]++;
  });
  
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-failed').textContent = failed;
  document.getElementById('stat-success-rate').textContent = successRate + '%';
  document.getElementById('stat-avg-time').textContent = avgTime + 'm';
  
  const catStatsEl = document.getElementById('category-stats');
  if(catStatsEl){
    catStatsEl.innerHTML = Object.entries(categoryStats).map(([cat, count]) => 
      `<div class="category-stat"><strong>${cat}</strong><br>${count} tasks</div>`
    ).join('');
  }
}

// Keyboard Shortcuts
document.addEventListener('keydown', e => {
  if(e.ctrlKey || e.metaKey){
    if(e.key === 'n'){
      e.preventDefault();
      document.getElementById('title')?.focus();
    }
  }
});

function save() {
  localStorage.setItem('cy_tasks', JSON.stringify(tasks));
}
function saveAchievements() {
  localStorage.setItem('cy_achievements', JSON.stringify(achievements));
}
function saveHistory(){
  localStorage.setItem('cy_history', JSON.stringify(history));
}

function setTheme(t){
  theme = t; localStorage.setItem('cy_theme', t);
  document.body.classList.toggle('dark', t==='dark');
  const themeBtn = document.getElementById('theme-toggle');
  if(themeBtn) themeBtn.classList.toggle('dark', t==='dark');
}

function applyInitialTheme(){
  if(theme) return setTheme(theme);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

// Listen for system theme changes
if(window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if(!localStorage.getItem('cy_theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

applyInitialTheme();

// WebAudio alarm + MP3 audio element fallback
let audioCtx = null;
const alarmEl = document.getElementById('alarm-audio');
function playAlarmSound(duration = 3000){
  if(alarmEl){
    alarmEl.currentTime = 0;
    const p = alarmEl.play();
    if(p && p.catch) p.catch(()=> playAlarmTone(duration));
    return;
  }
  playAlarmTone(duration);
}
function playAlarmTone(duration = 3000){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const g = audioCtx.createGain(); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.0001, now);
    const o = audioCtx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(440, now);
    o.frequency.exponentialRampToValueAtTime(1400, now + duration/1000);
    o.connect(g);
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration/1000);
    o.stop(now + duration/1000 + 0.05);
  }catch(e){console.warn('Audio not available', e)}
}

testBtn?.addEventListener('click', ()=>{
  if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  if(alarmEl){ alarmEl.currentTime = 0; alarmEl.play().catch(()=>playAlarmTone(1500)); }
  else playAlarmTone(1500);
});

const themeButton = document.getElementById('theme-toggle');
themeButton?.addEventListener('click', ()=>{
  setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});

function plural(n, s){ return n + ' ' + s + (n===1? '': 's'); }

function formatRemaining(endMs){
  const now = Date.now();
  if(endMs <= now) return '00:00';
  let temp = new Date(now);
  const end = new Date(endMs);
  let months = 0;
  while(true){
    const m = new Date(temp); m.setMonth(m.getMonth()+1);
    if(m.getTime() <= end.getTime()){ months++; temp = m; } else break;
  }
  let rem = end.getTime() - temp.getTime();
  const days = Math.floor(rem / (24*60*60*1000)); rem -= days*24*60*60*1000;
  const hours = Math.floor(rem / (60*60*1000)); rem -= hours*60*60*1000;
  const mins = Math.floor(rem / (60*1000)); rem -= mins*60*1000;
  const secs = Math.floor(rem/1000);
  let parts = [];
  if(months) parts.push(plural(months,'month'));
  if(days) parts.push(plural(days,'day'));
  if(hours) parts.push(plural(hours,'hour'));
  parts.push(String(hours).padStart(2,'0')+ ':' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0'));
  return parts.join(' ');
}

function render(){
  listEl.innerHTML = '';
  const now = Date.now();
  const filteredTasks = filterTasks();
  filteredTasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task';
    if(t.paused) li.classList.add('paused');
    const remaining = Math.max(0, t.end - now);
    const totalDuration = t.totalDuration || (t.end - t.created);
    const elapsed = now - t.created;
    const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    const meta = document.createElement('div'); meta.className='meta';
    const title = document.createElement('div'); title.className='title'; title.textContent = t.title + (t.paused ? ' ⏸' : '');
    const desc = document.createElement('div'); desc.className='small'; desc.textContent = t.desc || '';
    
    // Add priority, category and difficulty badges
    const tags = document.createElement('div'); tags.className='meta-tags';
    const priorityBadge = priorityModule.renderPriorityBadge(t.priority || 'medium');
    tags.appendChild(priorityBadge);
    const categoryBadge = document.createElement('span'); categoryBadge.className = `category-badge category-${t.category || 'other'}`;
    categoryBadge.textContent = (t.category || 'other').charAt(0).toUpperCase() + (t.category || 'other').slice(1);
    tags.appendChild(categoryBadge);
    const difficultyIcons = {easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐'};
    const difficultyBadge = document.createElement('span'); difficultyBadge.className = `difficulty-badge difficulty-${t.difficulty || 'easy'}`;
    difficultyBadge.textContent = (t.difficulty || 'easy').charAt(0).toUpperCase() + (t.difficulty || 'easy').slice(1) + ' ' + (difficultyIcons[t.difficulty] || '⭐');
    tags.appendChild(difficultyBadge);
    if(t.recurring) {
      const recurringBadge = document.createElement('span'); recurringBadge.className = 'recurring-badge';
      recurringBadge.textContent = '🔄 ' + t.recurring.pattern;
      tags.appendChild(recurringBadge);
    }
    meta.appendChild(title); meta.appendChild(desc); meta.appendChild(tags);
    
    // Add notes if present
    if(t.notes) {
      const noteEl = document.createElement('div'); noteEl.className='task-note';
      noteEl.textContent = '📝 ' + t.notes;
      meta.appendChild(noteEl);
    }
    
    // Add progress bar
    const progressContainer = document.createElement('div'); progressContainer.className='progress-container';
    const progressBar = document.createElement('div'); progressBar.className='progress-bar';
    progressBar.style.width = progressPercent + '%';
    progressContainer.appendChild(progressBar);
    meta.appendChild(progressContainer);

    const right = document.createElement('div'); right.className='controls';
    const time = document.createElement('div'); time.className='time'; time.textContent = formatRemaining(t.end);
    right.appendChild(time);

    // Edit button
    const editBtn = document.createElement('button'); editBtn.className='btn edit-btn'; editBtn.textContent='Edit';
    editBtn.onclick = ()=>openEditModal(t.id);
    right.appendChild(editBtn);

    // Pause/Resume button
    const pauseBtn = document.createElement('button'); 
    pauseBtn.className = `btn ${t.paused ? 'resume-btn' : 'pause-btn'}`; 
    pauseBtn.textContent = t.paused ? 'Resume' : 'Pause';
    pauseBtn.onclick = ()=>togglePause(t.id);
    right.appendChild(pauseBtn);

    const del = document.createElement('button'); del.className='btn'; del.textContent='Delete';
    del.onclick = ()=>{ tasks = tasks.filter(x=>x.id!==t.id); save(); render(); };
    right.appendChild(del);

    if(t._new){ li.classList.add('enter'); setTimeout(()=>{ li.classList.remove('enter'); delete t._new; save(); },420); }

    if(t.end - now <= 10000 && t.end - now > 0) li.classList.add('pulse');
    li.appendChild(meta);
    li.appendChild(right);
    listEl.appendChild(li);
  });
  
  // Update achievements display
  updateAchievementsDisplay();
  calculateStats();
}

function updateAchievementsDisplay(){
  const completedEl = document.getElementById('completed-count');
  const streakEl = document.getElementById('streak-count');
  const difficultyEl = document.getElementById('total-difficulty');
  if(completedEl) completedEl.textContent = achievements.completed;
  if(streakEl) streakEl.textContent = achievements.streak;
  if(difficultyEl) difficultyEl.textContent = achievements.totalDifficulty;
}

function renderHistory(){
  if(!historyEl) return;
  historyEl.innerHTML = '';
  history.forEach(h => {
    const li = document.createElement('li'); li.className='task';
    const meta = document.createElement('div'); meta.className='meta';
    const title = document.createElement('div'); title.className='title'; title.textContent = h.message;
    const time = document.createElement('div'); time.className='small'; time.textContent = new Date(h.time).toLocaleString();
    meta.appendChild(title); meta.appendChild(time);
    li.appendChild(meta);
    historyEl.appendChild(li);
  });
}

form.addEventListener('submit', e=>{
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const desc = document.getElementById('desc').value.trim();
  const category = document.getElementById('category').value;
  const difficulty = document.getElementById('difficulty').value;
  const priority = document.getElementById('priority')?.value || 'medium';
  const months = Math.max(0, Number(document.getElementById('months').value || 0));
  const days = Math.max(0, Number(document.getElementById('days').value || 0));
  const hours = Math.max(0, Number(document.getElementById('hours').value || 0));
  const minutes = Math.max(0, Number(document.getElementById('minutes').value || 0));
  const seconds = Math.max(0, Number(document.getElementById('seconds').value || 0));
  const now = new Date();
  const endDate = new Date(now);
  if(months) endDate.setMonth(endDate.getMonth() + months);
  if(days) endDate.setDate(endDate.getDate() + days);
  endDate.setHours(endDate.getHours() + hours);
  endDate.setMinutes(endDate.getMinutes() + minutes);
  endDate.setSeconds(endDate.getSeconds() + seconds);
  const totalDuration = endDate.getTime() - now.getTime();
  const task = { id: now.getTime() + '-' + Math.random().toString(36).slice(2,8), title, desc, category, difficulty, priority, created: now.getTime(), end: endDate.getTime(), totalDuration, _new: true, notes: '' };
  
  // Apply recurring if enabled
  if(recurringModule.enabled){
    task.recurring = { pattern: recurringModule.getPattern(), createdAt: now.getTime() };
  }
  
  tasks.push(task);
  save();
  form.reset();
  document.getElementById('minutes').value = 10;
  document.getElementById('category').value = 'work';
  document.getElementById('difficulty').value = 'easy';
  document.getElementById('priority').value = 'medium';
  render();
});

// Tick every second, update timers and handle completions
setInterval(()=>{
  const now = Date.now();
  let changed = false;
  const completed = [];
  tasks.forEach(t=>{
    // Skip paused tasks
    if(t.paused) return;
    if(!t.notified && t.end <= now){
      t.notified = true; changed = true;
      completed.push(t);
    }
  });
  if(completed.length){
    completed.forEach(t=>{
      // push to history with message
      history.unshift({ id: t.id, message: `Congrats you have completed the task 🎉✅ ${t.title}`, time: Date.now() });
      // Update achievements
      achievements.completed++;
      achievements.streak++;
      const difficultyPoints = {easy: 1, medium: 2, hard: 3};
      achievements.totalDifficulty += difficultyPoints[t.difficulty] || 1;
      achievements.lastCompleted = Date.now();
      saveAchievements();
      // play alarm
      try{ if(window.Notification && Notification.permission==='granted') new Notification('Time is up! 🎉', {body: t.title}); }
      catch(e){}
      playAlarmSound(3500);
    });
    // remove completed tasks
    const completedIds = new Set(completed.map(c=>c.id));
    tasks = tasks.filter(x=>!completedIds.has(x.id));
    save(); saveHistory();
  }
  // Check reminders
  checkReminders();
  render(); renderHistory();
},1000);

// Request permission for notifications
if(window.Notification && Notification.permission!=='granted'){
  Notification.requestPermission().catch(()=>{});
}

clearHistoryBtn?.addEventListener('click', ()=>{ history = []; saveHistory(); renderHistory(); });

// Landing overlay logic
const landing = document.getElementById('landing');
const landingYes = document.getElementById('landing-yes');
const landingNo = document.getElementById('landing-no');
const noPage = document.getElementById('no-page');
const readyBtn = document.getElementById('ready-btn');

landingYes?.addEventListener('click', ()=>{
  landingYes.textContent = "Let's go!!!";
  setTimeout(()=>{ landing.classList.add('hidden'); }, 700);
});
landingNo?.addEventListener('click', ()=>{
  landing.classList.add('hidden');
  noPage.classList.remove('hidden');
});
readyBtn?.addEventListener('click', ()=>{ noPage.classList.add('hidden'); });

// Initialize sound selector
if(alarmSelect) alarmSelect.value = selectedSound;

// Render Streak Calendar
function renderStreakCalendar(){
  const calendarEl = document.getElementById('streak-calendar');
  if(!calendarEl) return;
  const today = new Date();
  const days = 30;
  let html = '<div class="calendar-grid">';
  for(let i = 0; i < days; i++){
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const completed = history.filter(h => new Date(h.time).toISOString().split('T')[0] === dateStr).length;
    html += `<div class="calendar-day ${completed > 0 ? 'completed' : ''}" title="${dateStr}: ${completed} completed">${d.getDate()}</div>`;
  }
  html += '</div>';
  calendarEl.innerHTML = html;
}

// initial render
mountReactQuoteWidget();
render(); renderHistory();

// Initialize all modules
setTimeout(() => {
  recurringModule.init();
  templatesModule.init();
  exportModule.init();
  analyticsModule.init();
  notificationsModule.init();
}, 500);
