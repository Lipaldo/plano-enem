const PLAN = [
  { day:'Segunda-feira', short:'Seg', color:'c-mat', sessions:[
    {subject:'Matemática',color:'c-mat',topic:'Matemática básica',tags:['37,3% do ENEM','prioridade máxima'],time:'1ª hora',mins:60},
    {subject:'Português',color:'c-por',topic:'Gêneros textuais',tags:['44,1% da disciplina'],time:'2ª hora',mins:60},
  ]},
  { day:'Terça-feira', short:'Ter', color:'c-bio', sessions:[
    {subject:'Biologia',color:'c-bio',topic:'Ecologia',tags:['26% da disciplina','prioridade alta'],time:'1ª hora',mins:60},
    {subject:'História',color:'c-his',topic:'Brasil Colônia',tags:['11,8% da disciplina'],time:'2ª hora',mins:60},
  ]},
  { day:'Quarta-feira', short:'Qua', color:'c-fis', sessions:[
    {subject:'Física',color:'c-fis',topic:'Eletrodinâmica',tags:['21,1% da disciplina','prioridade alta'],time:'1ª hora',mins:60},
    {subject:'Matemática',color:'c-mat',topic:'Estatística + Geometria espacial',tags:['11,2% cada'],time:'2ª hora',mins:60},
  ]},
  { day:'Quinta-feira', short:'Qui', color:'c-qui', sessions:[
    {subject:'Química',color:'c-qui',topic:'Moléculas e propriedades',tags:['8,6% da disciplina'],time:'1ª hora',mins:60},
    {subject:'Geografia',color:'c-geo',topic:'Espaço agrário',tags:['12,4% da disciplina'],time:'2ª hora',mins:60},
  ]},
  { day:'Sexta-feira', short:'Sex', color:'c-fil', sessions:[
    {subject:'Filosofia',color:'c-fil',topic:'Filosofia antiga',tags:['28,1% da disciplina'],time:'1ª hora',mins:60},
    {subject:'Sociologia',color:'c-soc',topic:'Cultura e sociedade',tags:['19% da disciplina'],time:'2ª hora',mins:60},
  ]},
  { day:'Sábado', short:'Sáb', color:'c-fis', sessions:[
    {subject:'Física',color:'c-fis',topic:'Termologia + Ondulatória',tags:['revisão','16% + 13,7%'],time:'1ª hora',mins:60},
    {subject:'Português',color:'c-por',topic:'Introdução à Língua Portuguesa',tags:['22,1% da disciplina'],time:'2ª hora',mins:60},
  ]},
  { day:'Domingo', short:'Dom', color:'c-mat', sessions:[
    {subject:'Matemática',color:'c-mat',topic:'Revisão da semana + exercícios',tags:['revisão geral'],time:'1ª hora',mins:60},
    {subject:'Biologia',color:'c-bio',topic:'Zoologia + Fisiologia humana',tags:['8,3% + 7,7%'],time:'2ª hora',mins:60},
  ]},
];

const TOTAL_SESSIONS = PLAN.reduce((a,d)=>a+d.sessions.length,0);
let currentWeek = 1;
let selectedDay = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
if(selectedDay > 6) selectedDay = 0;
let checked = {};
let timers = {};

function key(d,s){ return `w${currentWeek}_d${d}_s${s}`; }

function changeWeek(dir){
  currentWeek = Math.max(1, currentWeek + dir);
  document.getElementById('week-label').textContent = `Semana ${currentWeek}`;
  renderAll();
  buildChips();
}

function toggleCheck(di, si){
  const k = key(di,si);
  checked[k] = !checked[k];
  renderAll();
}

function selectDay(idx){
  selectedDay = idx;
  renderAll();
  buildChips();
}

// ── TIMERS ──
function startTimer(di, si){
  const tk = `t_${di}_${si}`;
  if(timers[tk]?.running) {
    clearInterval(timers[tk].id);
    timers[tk].running = false;
    document.querySelector(`[data-timer-btn="${di}_${si}"]`).textContent = 'Continuar';
    return;
  }
  if(!timers[tk]) timers[tk] = { secs: 60*60, running: false };
  timers[tk].running = true;
  timers[tk].id = setInterval(()=>{
    if(timers[tk].secs <= 0){ clearInterval(timers[tk].id); timers[tk].running=false; return; }
    timers[tk].secs--;
    const el = document.querySelector(`[data-timer="${di}_${si}"]`);
    if(el) el.textContent = fmtTime(timers[tk].secs);
  },1000);
  document.querySelector(`[data-timer-btn="${di}_${si}"]`).textContent = 'Pausar';
}

function resetTimer(di,si){
  const tk = `t_${di}_${si}`;
  if(timers[tk]?.id) clearInterval(timers[tk].id);
  timers[tk] = { secs:60*60, running:false };
  const el = document.querySelector(`[data-timer="${di}_${si}"]`);
  if(el) el.textContent = '60:00';
  const btn = document.querySelector(`[data-timer-btn="${di}_${si}"]`);
  if(btn) btn.textContent = 'Iniciar';
}

function fmtTime(s){ return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

// ── RENDER ──
function renderSidebar(){
  const list = document.getElementById('day-list');
  list.innerHTML = '';
  PLAN.forEach((d,di)=>{
    const doneCnt = d.sessions.filter((_,si)=>checked[key(di,si)]).length;
    const total = d.sessions.length;
    const btn = document.createElement('button');
    btn.className = 'day-btn' + (di===selectedDay?' active':'');
    const dotClass = 'day-dot' + (doneCnt===total&&total>0?' done':'');
    btn.innerHTML = `<span class="${dotClass}"></span>${d.day}<span class="day-progress">${doneCnt}/${total}</span>`;
    btn.onclick = ()=>selectDay(di);
    list.appendChild(btn);
  });
}

function renderStats(){
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round(done/TOTAL_SESSIONS*100);
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-pct').textContent = pct+'%';
  document.getElementById('stat-hours').textContent = done+'h';
  document.getElementById('prog-fill').style.width = pct+'%';

  // streak: consecutive days with all sessions done for current week
  let streak = 0;
  for(let di=0;di<PLAN.length;di++){
    const allDone = PLAN[di].sessions.every((_,si)=>checked[key(di,si)]);
    if(allDone) streak++; else break;
  }
  document.getElementById('stat-streak').textContent = streak;
}

function renderMain(){
  const d = PLAN[selectedDay];
  let html = `<div class="day-header"><h2>${d.day}</h2><p>2 horas de estudo · semana ${currentWeek}</p></div>`;

  d.sessions.forEach((s,si)=>{
    const k = key(selectedDay,si);
    const isDone = checked[k];
    const tk = `t_${selectedDay}_${si}`;
    const secs = timers[tk]?.secs ?? 3600;
    const timerRunning = timers[tk]?.running;
    const btnLabel = isDone ? 'Refazer' : (timerRunning ? 'Pausar' : (secs < 3600 ? 'Continuar' : 'Iniciar'));
    const tags = s.tags.map(t=>`<span class="tag">${t}</span>`).join('');
    html += `
    <div class="session-card ${s.color} ${isDone?'completed':''}">
      <div class="session-header">
        <div class="session-color"></div>
        <div class="session-meta">
          <div class="session-subject">${s.subject}</div>
          <div class="session-topic">${s.topic}</div>
        </div>
        <span class="session-time">${s.time}</span>
        <button class="session-check ${isDone?'checked':''}" onclick="toggleCheck(${selectedDay},${si})" title="Marcar como feito"></button>
      </div>
      <div class="session-body">
        <div class="session-tags">${tags}</div>
        <div class="timer-row">
          <div class="timer-display" data-timer="${selectedDay}_${si}">${fmtTime(secs)}</div>
          <button class="timer-btn start" data-timer-btn="${selectedDay}_${si}" onclick="startTimer(${selectedDay},${si})">${btnLabel}</button>
          <button class="timer-btn reset" onclick="resetTimer(${selectedDay},${si})">Zerar</button>
        </div>
      </div>
    </div>`;

    if(si === 0){
      html += `<div class="break-card">☕ &nbsp;Pausa de 10 minutos — respire, hidrate-se, afaste-se da tela.</div>`;
    }
  });

  document.getElementById('main-content').innerHTML = html;
}

function renderAll(){ renderStats(); renderSidebar(); renderMain(); }

// ── AI CHAT ──
let chatHistory = [];

function buildChips(){
  const d = PLAN[selectedDay];
  const chips = [
    `Explique o assunto "${d.sessions[0].topic}" de ${d.sessions[0].subject}`,
    `Quais tópicos de ${d.sessions[0].subject} mais caem no ENEM?`,
    `Crie 3 questões sobre ${d.sessions[0].topic}`,
    `Dica de como estudar ${d.sessions[1].subject} hoje`,
  ];
  document.getElementById('chips').innerHTML = chips.map(c=>
    `<button class="chip" onclick="sendChip(this.textContent)">${c}</button>`
  ).join('');
}

function addBubble(text, role){
  const area = document.getElementById('chat-area');
  const div = document.createElement('div');
  div.className = `bubble ${role}`;
  div.textContent = text;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  return div;
}

function addLoading(){
  const area = document.getElementById('chat-area');
  const div = document.createElement('div');
  div.className = 'bubble ai';
  div.innerHTML = '<span class="loading"><span></span><span></span><span></span></span>';
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  return div;
}

async function callClaude(userMsg){
  const d = PLAN[selectedDay];
  const systemPrompt = `Você é um tutor especializado em ENEM. O aluno está no dia ${d.day} do plano de estudos. 
As disciplinas de hoje são: ${d.sessions.map(s=>s.subject+' ('+s.topic+')').join(' e ')}.
Responda de forma clara, didática e objetiva em português brasileiro. 
Quando explicar conteúdo, use exemplos práticos e conecte com questões reais do ENEM.
Mantenha respostas concisas (máximo 3 parágrafos) a menos que o aluno peça mais detalhes.`;

  chatHistory.push({ role:'user', content: userMsg });

  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: systemPrompt,
    messages: chatHistory,
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  const data = await res.json();
  const reply = data.content?.[0]?.text || 'Não consegui responder agora. Tente novamente.';
  chatHistory.push({ role:'assistant', content: reply });
  return reply;
}

async function sendMsg(){
  const input = document.getElementById('ai-input');
  const msg = input.value.trim();
  if(!msg) return;
  input.value = '';
  document.getElementById('ai-send').disabled = true;
  document.getElementById('chips').innerHTML = '';

  addBubble(msg, 'user');
  const loading = addLoading();

  try {
    const reply = await callClaude(msg);
    loading.remove();
    addBubble(reply, 'ai');
  } catch(e) {
    loading.remove();
    addBubble('Erro ao conectar. Verifique sua conexão e tente novamente.', 'ai');
  }
  document.getElementById('ai-send').disabled = false;
  buildChips();
}

function sendChip(text){
  document.getElementById('ai-input').value = text;
  sendMsg();
}

function handleKey(e){
  if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMsg(); }
}

// ── INIT ──
renderAll();
buildChips();

const welcomeMsg = `Olá! 👋 Estou aqui para te ajudar com os estudos de hoje.\n\nHoje é ${PLAN[selectedDay].day} — você vai estudar ${PLAN[selectedDay].sessions.map(s=>s.subject).join(' e ')}. Use os chips abaixo para começar ou me faça qualquer pergunta sobre o conteúdo!`;
addBubble(welcomeMsg, 'ai');
