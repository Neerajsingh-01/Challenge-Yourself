const form = document.getElementById('task-form');
const listEl = document.getElementById('task-list');
const testBtn = document.getElementById('test-sound');
const themeToggle = document.getElementById('theme-toggle');

let tasks = JSON.parse(localStorage.getItem('cy_tasks') || '[]');
let theme = localStorage.getItem('cy_theme') || 'light';

function save() {
  localStorage.setItem('cy_tasks', JSON.stringify(tasks));
}

function setTheme(t){
  theme = t; localStorage.setItem('cy_theme', t);
  document.body.classList.toggle('dark', t==='dark');
  themeToggle.checked = (t==='dark');
  const label = document.getElementById('theme-label');
  if(label) label.textContent = (t==='dark') ? 'Night' : 'Day';
}

setTheme(theme);

// WebAudio alarm + MP3 audio element fallback
let audioCtx = null;
const alarmEl = document.getElementById('alarm-audio');
function playAlarmSound(duration = 3000){
  // prefer provided MP3
  if(alarmEl){
    // try to play the audio element
    alarmEl.currentTime = 0;
    const p = alarmEl.play();
    if(p && p.catch) p.catch(()=>{
      // fallback to WebAudio
      playAlarmTone(duration);
    });
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
    // rising chirp
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
  // resume audio context on user gesture
  if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  if(alarmEl){ alarmEl.currentTime = 0; alarmEl.play().catch(()=>playAlarmTone(1500)); }
  else playAlarmTone(1500);
});

themeToggle?.addEventListener('change', ()=> setTheme(themeToggle.checked ? 'dark' : 'light'));

function plural(n, s){ return n + ' ' + s + (n===1? '': 's'); }

function formatRemaining(endMs){
  const now = Date.now();
  if(endMs <= now) return '00:00';
  // compute months by incrementing
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
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task enter';
    const remaining = Math.max(0, t.end - now);
    const meta = document.createElement('div'); meta.className='meta';
    const title = document.createElement('div'); title.className='title'; title.textContent = t.title;
    const desc = document.createElement('div'); desc.className='small'; desc.textContent = t.desc || '';
    meta.appendChild(title); meta.appendChild(desc);

    const right = document.createElement('div'); right.className='controls';
    const time = document.createElement('div'); time.className='time'; time.textContent = formatRemaining(t.end);
    right.appendChild(time);

    const del = document.createElement('button'); del.className='btn'; del.textContent='Delete';
    del.onclick = ()=>{ tasks = tasks.filter(x=>x.id!==t.id); save(); render(); };
    right.appendChild(del);

    // pulse when near completion
    if(t.end - now <= 10000 && t.end - now > 0) li.classList.add('pulse');
    li.appendChild(meta);
    li.appendChild(right);
    listEl.appendChild(li);
    // remove enter class after animation so future renders can re-add it
    setTimeout(()=> li.classList.remove('enter'), 420);
  });
}

form.addEventListener('submit', e=>{
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const desc = document.getElementById('desc').value.trim();
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
  const task = { id: now.getTime() + '-' + Math.random().toString(36).slice(2,8), title, desc, created: now.getTime(), end: endDate.getTime() };
  tasks.push(task);
  save();
  form.reset();
  document.getElementById('minutes').value = 10;
  render();
});

// Tick every second, update timers and handle completions
setInterval(()=>{
  const now = Date.now();
  let changed = false;
  tasks.forEach(t=>{
    if(!t.notified && t.end <= now){
      t.notified = true; changed = true; 
      try{ if(window.Notification && Notification.permission==='granted') new Notification('Time is up!', {body: t.title}); }
      catch(e){}
      // try play mp3, fallback to WebAudio tone
      playAlarmSound(3500);
    }
  });
  if(changed) save();
  render();
},1000);

// Request permission for notifications
if(window.Notification && Notification.permission!=='granted'){
  Notification.requestPermission().catch(()=>{});
}

// initial render
render();
