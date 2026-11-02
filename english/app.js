import { loadState, saveState, setPlanLessons, clearAllPlanContent, completeLesson, markPlanLessonDone, recordProgress, resumePosition, escapeHtml } from './state.js';
import { endDecision } from './player.js';

const app = document.querySelector('#app');
const catalogResponse = await fetch('/english/data/catalog.json');
if (!catalogResponse.ok) throw new Error('Application data unavailable');
const catalog = await catalogResponse.json();
const lessons = catalog.levels.flatMap(level => level.lessons.map(lesson => ({ ...lesson, level })));
const ids = new Set(lessons.map(lesson => lesson.id));
let state = loadState(ids);
let level = 'all', query = '', view = 'library';
let active = new URLSearchParams(location.search).get('lesson');
let selectedIds = new Set();
let selecting = false, page = 0, feedback = '';
let authenticated = localStorage.getItem('wow-family-session-hint') === '1';
let lessonPlanScope = null;
const pageSize = 24;
let disposePlayer = () => {};
if (active && !ids.has(active)) active = null;
const words = {
  zh: { access:'家庭访问码', login:'登录', logout:'退出登录', retry:'重试', logging:'正在登录…', loading:'正在加载视频…', invalid:'访问码不正确，请重试。', session:'请登录以观看视频；本设备登录后 30 天内无需重复输入。', forbidden:'请求被拒绝，请检查访问地址。', missing:'课程不存在。', network:'网络请求失败，请重试。', intro:'每天一点，陪孩子发现英语的乐趣。', library:'课程库', plan:'今日计划', week:'本周计划', language:'English', search:'搜索课程', all:'全部级别', add:'加入今日', addWeek:'加入本周', removeToday:'移出今日', removeWeek:'移出本周', play:'打开课程', done:'标记完成', completed:'已完成', back:'返回课程库', empty:'还没有课程，先从课程库加入。', total:'节课程', planned:'今日计划', weekPlanned:'本周计划', noVideo:'视频尚未配置，请联系站点管理员。', videoError:'视频暂时无法播放，请稍后再试。', subtitles:'字幕暂不可用', noMatches:'没有找到匹配的课程。', local:'计划和学习进度保存在此浏览器中。', status:'课程加载失败，请刷新后重试。', select:'选择课程', addSelected:'加入今日计划', addSelectedWeek:'加入本周计划', clearPlan:'清空所有已添加课程/计划', confirmClear:'确定清空今日和本周的所有已添加课程及计划吗？学习进度会保留。', playback:'播放方式', autoNext:'播完下一集', repeatOne:'重复当前', loopPlan:'循环当前计划', fullscreen:'全屏', exitFullscreen:'退出全屏', autoplayBlocked:'请点按播放继续。' },
  en: { access:'Family access code', login:'Sign in', logout:'Sign out', retry:'Retry', logging:'Signing in…', loading:'Loading video…', invalid:'Incorrect access code. Please try again.', session:'Sign in to watch; this device stays signed in for 30 days.', forbidden:'Request denied. Check the site address.', missing:'Lesson not found.', network:'Network request failed. Please retry.', intro:'A little English together, every day.', library:'Library', plan:'Today', week:'This week', language:'中文', search:'Search lessons', all:'All levels', add:'Add today', addWeek:'Add this week', removeToday:'Remove today', removeWeek:'Remove this week', play:'Open lesson', done:'Mark complete', completed:'Completed', back:'Back to library', empty:'No lessons yet. Add one from the library.', total:'lessons', planned:'Today’s plan', weekPlanned:'This week’s plan', noVideo:'Video is not configured yet. Please contact the site owner.', videoError:'This video cannot be played right now. Please try again later.', subtitles:'Subtitles are not available', noMatches:'No matching lessons.', local:'Your plan and progress are saved in this browser.', status:'Could not load lessons. Please refresh and try again.', select:'Select lesson', addSelected:'Add to today', addSelectedWeek:'Add to this week', clearPlan:'Clear all added lessons and plans', confirmClear:'Clear all added lessons from today’s and this week’s plans? Learning progress will be kept.', playback:'Playback mode', autoNext:'Play next', repeatOne:'Repeat this lesson', loopPlan:'Loop current plan', fullscreen:'Fullscreen', exitFullscreen:'Exit fullscreen', autoplayBlocked:'Tap play to continue.' }
};
const lang = () => state.settings.language === 'en' ? 'en' : 'zh';
const t = key => words[lang()][key];
const extra = (zh, en) => lang() === 'zh' ? zh : en;
const esc = value => escapeHtml(String(value ?? ''));
const title = item => item.title.replace(/^Wow!\s*\S+\s+Unit\s+\d+\s*/i, '').replace(/\s+video\s+(story|song\d*|video)$/i, ' · $1').replace(/\s+video$/i, '').replace(/^./, c => c.toUpperCase()) || item.title;
const planKey = scope => scope === 'week' ? currentWeekDate() : currentPlanDate();
const planIds = scope => state.plans[scope].key === planKey(scope) ? state.plans[scope].lessonIds : [];
const currentPlan = () => { const scope = lessonPlanScope || (planIds('today').includes(active) ? 'today' : planIds('week').includes(active) ? 'week' : 'today'); return { identity:`${scope}:${planKey(scope)}`, lessonIds:planIds(scope) }; };
function currentPlanDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function currentWeekDate() { const d = new Date(), monday = new Date(d.getFullYear(),d.getMonth(),d.getDate() - ((d.getDay()+6)%7)); return `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`; }
const save = () => saveState(state);
const setAuthenticated = value => { authenticated = value; if (value) localStorage.setItem('wow-family-session-hint','1'); else localStorage.removeItem('wow-family-session-hint'); syncSessionAction(); };
function syncSessionAction() {
  const container = document.querySelector('#session-action'); if (!container) return;
  container.innerHTML = authenticated ? `<button id="logout" type="button">${t('logout')}</button>` : '';
  const logout = container.querySelector('#logout'); if (!logout) return;
  logout.onclick = async () => {
    logout.disabled = true;
    try {
      const response = await fetch('/api/english/logout', { method:'POST', credentials:'same-origin', cache:'no-store', headers:{ 'Content-Type':'application/json' }, body:'{}' });
      if (!response.ok) throw new Error('logout failed');
      setAuthenticated(false); disposePlayer(); render();
    } catch { logout.disabled = false; logout.textContent = t('retry'); }
  };
}
const focusControl = (...selectors) => { const target = selectors.map(selector => document.querySelector(selector)).find(element => element && !element.disabled); target?.focus({ preventScroll: true }); };
function setActive(id, scope = null) {
  active = id; lessonPlanScope = id ? scope : null; const url = new URL(location.href); if (id) url.searchParams.set('lesson', id); else url.searchParams.delete('lesson'); history.pushState({}, '', url); render();
}
function card(item) {
  const scope = view === 'week' ? 'week' : 'today', inToday = planIds('today').includes(item.id), inWeek = planIds('week').includes(item.id);
  const body = `<div class="card-top"><span class="badge">${esc(item.level.name)}</span><span class="number">${esc(item.number || '')}</span></div><h3>${esc(title(item))}</h3><p>${item.unit ? `Unit ${esc(item.unit)} · ` : ''}${esc(item.type)}</p>`;
  const planActions = view === 'library' ? `<button class="secondary" data-plan="${esc(item.id)}" data-scope="today">${inToday ? t('removeToday') : t('add')}</button><button class="secondary" data-plan="${esc(item.id)}" data-scope="week">${inWeek ? t('removeWeek') : t('addWeek')}</button>` : `<button class="secondary" data-plan="${esc(item.id)}" data-scope="${scope}">${t(scope === 'week' ? 'removeWeek' : 'removeToday')}</button>`;
  return `<article class="card ${selecting && view === 'library' ? 'selecting' : ''} ${selectedIds.has(item.id) && selecting && view === 'library' ? 'is-selected' : ''}">${selecting && view === 'library' ? `<label class="card-select"><input type="checkbox" data-select="${esc(item.id)}" ${selectedIds.has(item.id) ? 'checked' : ''} aria-label="${t('select')}: ${esc(title(item))}">${body}</label>` : `${body}<div class="actions"><button class="primary" data-open="${esc(item.id)}" data-scope="${view === 'plan' ? 'today' : view === 'week' ? 'week' : ''}">${t('play')}</button>${planActions}</div>`}${state.completed[item.id] ? `<small class="completed">✓ ${t('completed')}</small>` : ''}</article>`;
}
function render() {
  disposePlayer(); disposePlayer = () => {};
  document.documentElement.lang = lang() === 'zh' ? 'zh-CN' : 'en';
  const selected = lessons.find(item => item.id === active);
  const filtered = lessons.filter(item => (level === 'all' || item.level.id === level) && [item.title, title(item), item.level.name, item.level.id, item.unit && `unit ${item.unit}`, item.type].filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  const todayIds = planIds('today'), weekIds = planIds('week'), planScope = view === 'week' ? 'week' : 'today';
  const planItems = planIds(planScope).map(id => lessons.find(item => item.id === id)).filter(Boolean);
  page = Math.min(page, Math.max(0, Math.ceil(filtered.length / pageSize) - 1));
  const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const planIdentity = `${planScope}:${planKey(planScope)}`;
  const doneCount = (state.planProgress[planIdentity] || []).filter(id => planIds(planScope).includes(id)).length;
  app.innerHTML = `<header class="header"><a class="brand" href="/english/">✦ <span>Wow Family</span></a><nav aria-label="${t('library')}"><button data-view="library" class="${view === 'library' && !selected ? 'selected' : ''}">${t('library')}</button><button data-view="plan" class="${view === 'plan' && !selected ? 'selected' : ''}">${t('plan')} <span class="count">${todayIds.length}</span></button><button data-view="week" class="${view === 'week' && !selected ? 'selected' : ''}">${t('week')} <span class="count">${weekIds.length}</span></button></nav><div class="header-actions"><button class="language" id="language">${t('language')}</button><div id="session-action"></div></div></header><div class="content ${selected ? 'lesson-content' : ''}">${selected ? `<section class="lesson-page"><div class="lesson-topbar"><button id="back" class="back">← ${t('back')}</button></div><header class="lesson-heading"><span class="eyebrow">${esc(selected.level.name)} · ${selected.unit ? `Unit ${esc(selected.unit)} · ` : ''}${esc(selected.type)}</span><h1>${esc(title(selected))}</h1></header><section class="player"><div id="video-area"></div><div id="learning-controls" class="learning-panel" hidden><div><strong>${extra('学习进度', 'Learning progress')}</strong><p class="notice">${t('subtitles')}</p></div><button class="primary" id="complete">${state.completed[selected.id] ? t('completed') : t('done')}</button></div></section></section>` : `<section class="hero"><div><span class="eyebrow">WOW FAMILY · ENGLISH</span><h1>${view === 'week' ? t('weekPlanned') : view === 'plan' ? t('planned') : t('library')}</h1><p>${view === 'week' ? extra(`本周已完成 ${doneCount} / ${planItems.length} 节`, `${doneCount} of ${planItems.length} completed this week`) : view === 'plan' ? extra(`今日已完成 ${doneCount} / ${planItems.length} 节`, `${doneCount} of ${planItems.length} completed today`) : t('intro')}</p></div><div class="hero-count"><strong>${view === 'library' ? catalog.totalLessons : planItems.length}</strong><span>${t('total')}</span></div></section>${view === 'library' ? `<div class="bulk"><button class="secondary" id="toggle-select">${selecting ? extra('取消选择', 'Cancel selection') : extra('批量选择', 'Select lessons')}</button></div><p class="feedback" role="status">${esc(feedback)}</p><div class="filters"><label><span>${t('search')}</span><input id="search" type="search" value="${esc(query)}" placeholder="${t('search')}"></label><label><span>${t('all')}</span><select id="level"><option value="all">${t('all')}</option>${catalog.levels.map(l => `<option value="${esc(l.id)}" ${level === l.id ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select></label></div><p class="results">${extra('课程', 'Lessons')} ${filtered.length ? page * pageSize + 1 : 0}–${Math.min((page + 1) * pageSize, filtered.length)} / ${filtered.length}</p><section class="grid">${visible.length ? visible.map(card).join('') : `<p>${t('noMatches')}</p>`}</section><div class="pagination"><button class="secondary" id="previous" ${page === 0 ? 'disabled' : ''}>${extra('上一页', 'Previous')}</button><button class="secondary" id="next" ${(page + 1) * pageSize >= filtered.length ? 'disabled' : ''}>${extra('下一页', 'Next')}</button></div>${selecting ? `<div class="selection-bar"><button class="secondary" id="select-visible">${extra('选择本页', 'Select visible')}</button><button class="secondary" id="clear-selection">${extra('清除选择', 'Clear selection')}</button><button class="primary" id="add-selected" ${selectedIds.size ? '' : 'disabled'}>${t('addSelected')} (${selectedIds.size})</button><button class="secondary" id="add-selected-week" ${selectedIds.size ? '' : 'disabled'}>${t('addSelectedWeek')} (${selectedIds.size})</button></div>` : ''}` : `${state.plans.today.lessonIds.length || state.plans.week.lessonIds.length ? `<div class="bulk"><button class="secondary" id="clear-plan">${t('clearPlan')}</button></div>` : ''}<section class="grid plan-grid">${planItems.length ? planItems.map(card).join('') : `<div class="empty"><p>${t('empty')}</p><button class="primary" data-view="library">${t('library')} →</button></div>`}</section>`}`}<footer>${t('local')}</footer></div>`;
  syncSessionAction();
  document.querySelector('#language').onclick = () => { state.settings.language = lang() === 'zh' ? 'en' : 'zh'; save(); render(); };
  document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => { view = button.dataset.view; active = null; lessonPlanScope = null; const url = new URL(location.href); url.searchParams.delete('lesson'); history.pushState({}, '', url); render(); });
  document.querySelectorAll('[data-open]').forEach(button => button.onclick = () => setActive(button.dataset.open, button.dataset.scope || null));
  document.querySelectorAll('[data-plan]').forEach(button => button.onclick = () => { const id = button.dataset.plan, scope = button.dataset.scope === 'week' ? 'week' : 'today', prior = planIds(scope); setPlanLessons(state, scope, prior.includes(id) ? prior.filter(x => x !== id) : [...prior, id], new Date(), ids); save(); render(); });
  document.querySelectorAll('[data-select]').forEach(box => box.onchange = () => { if (box.checked) selectedIds.add(box.dataset.select); else selectedIds.delete(box.dataset.select); box.closest('.card').classList.toggle('is-selected', box.checked); for (const [selector,key] of [['#add-selected','addSelected'],['#add-selected-week','addSelectedWeek']]) { const add = document.querySelector(selector); if (add) { add.disabled = !selectedIds.size; add.textContent = `${t(key)} (${selectedIds.size})`; } } });
  const toggle = document.querySelector('#toggle-select'); if (toggle) toggle.onclick = () => { selecting = !selecting; selectedIds.clear(); feedback = ''; render(); focusControl('#toggle-select'); };
  const selectVisible = document.querySelector('#select-visible'); if (selectVisible) selectVisible.onclick = () => { visible.forEach(item => selectedIds.add(item.id)); render(); focusControl('#select-visible'); };
  const clearSelection = document.querySelector('#clear-selection'); if (clearSelection) clearSelection.onclick = () => { selectedIds.clear(); render(); focusControl('#clear-selection'); };
  const addChosen = scope => { const chosen = lessons.map(item => item.id).filter(id => selectedIds.has(id)); setPlanLessons(state, scope, [...new Set([...planIds(scope), ...chosen])], new Date(), ids); feedback = scope === 'week' ? extra(`已将 ${chosen.length} 节课程加入本周计划。`, `Added ${chosen.length} lessons to this week's plan.`) : extra(`已将 ${chosen.length} 节课程加入今日计划。`, `Added ${chosen.length} lessons to today's plan.`); selectedIds.clear(); selecting = false; save(); render(); focusControl('#toggle-select'); };
  const addSelected = document.querySelector('#add-selected'); if (addSelected) addSelected.onclick = () => addChosen('today');
  const addSelectedWeek = document.querySelector('#add-selected-week'); if (addSelectedWeek) addSelectedWeek.onclick = () => addChosen('week');
  const previous = document.querySelector('#previous'); if (previous) previous.onclick = () => { page--; render(); focusControl('#previous', '#next', '#toggle-select'); };
  const next = document.querySelector('#next'); if (next) next.onclick = () => { page++; render(); focusControl('#next', '#previous', '#toggle-select'); };
  const clearPlan = document.querySelector('#clear-plan'); if (clearPlan) clearPlan.onclick = () => { if (!window.confirm(t('confirmClear'))) return; state = clearAllPlanContent(state); save(); render(); };
  const search = document.querySelector('#search'); if (search) search.oninput = e => { query = e.target.value; const start = e.target.selectionStart, end = e.target.selectionEnd, direction = e.target.selectionDirection; page = 0; render(); const next = document.querySelector('#search'); next.focus({ preventScroll: true }); if (start !== null && end !== null) next.setSelectionRange(start, end, direction); };
  const filter = document.querySelector('#level'); if (filter) filter.onchange = e => { level = e.target.value; page = 0; render(); };
  if (selected) {
    document.querySelector('#back').onclick = () => setActive(null);
    document.querySelector('#complete').onclick = () => { completeLesson(state, active); markPlanLessonDone(state, currentPlan(), active, ids); save(); render(); };
    const area = document.querySelector('#video-area');
    let disposed = false, serial = 0, timer, current = selected, expiresAt = 0, recovering = false, resumeAt = null, resumePlay = false, stopped = false, playingIntent = false, switching = false, pendingResume = null;
    const post = async (path, body) => {
      const response = await fetch(path, { method:'POST', credentials:'same-origin', cache:'no-store', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(body) });
      let data = {}; try { data = await response.json(); } catch {}
      if (!response.ok) throw Object.assign(new Error('request failed'), { status:response.status, code:data.error?.code });
      return data;
    };
    const message = err => err.status === 401 ? t('session') : err.status === 403 ? t('forbidden') : err.status === 404 ? t('missing') : err.status === 503 ? t('noVideo') : t('network');
    const loginForm = (note = t('session')) => {
      document.querySelector('#learning-controls').hidden = true;
      setAuthenticated(false);
      area.innerHTML = `<form id="login-form"><label for="access-code">${t('access')}</label><input id="access-code" type="password" autocomplete="current-password" required maxlength="256"><button class="primary" type="submit">${t('login')}</button><p role="status" aria-live="polite">${note}</p></form>`;
      const form = area.querySelector('form'), button = form.querySelector('button'), status = form.querySelector('[role=status]');
      form.onsubmit = async e => { e.preventDefault(); button.disabled = true; status.textContent = t('logging'); const code = form.querySelector('input').value;
        try { await post('/api/english/login', { code }); if (!disposed) { setAuthenticated(true); form.querySelector('input').value = ''; setupPlayer(); } }
        catch (err) { if (!disposed) { status.textContent = err.status === 401 ? t('invalid') : message(err); button.disabled = false; } }
      };
    };
    const setupPlayer = () => {
      area.innerHTML = `<div class="video-stage controls-visible" id="video-stage"><video playsinline preload="metadata" aria-label="${esc(current.title)}"></video><button class="center-toggle" id="center-toggle" type="button" aria-label="${extra('播放', 'Play')}">${extra('播放', 'Play')}</button><div class="player-controls visible" id="player-controls"><button id="play-toggle" type="button">${extra('播放', 'Play')}</button><label class="seek-label"><span class="sr-only">${extra('播放进度', 'Playback position')}</span><input id="seek" type="range" min="0" max="1000" value="0" aria-label="${extra('播放进度', 'Playback position')}" aria-valuetext="${extra('0:00，共 0:00', '0:00 of 0:00')}"></label><span id="time-display">0:00 / 0:00</span><button id="mute" type="button" aria-pressed="false">${extra('静音', 'Mute')}</button><button id="fullscreen" type="button" aria-pressed="false">${t('fullscreen')}</button></div></div><div class="player-tools"><label for="playback-mode"><span>${t('playback')}</span><select id="playback-mode"><option value="auto-next">${t('autoNext')}</option><option value="repeat-one">${t('repeatOne')}</option><option value="loop-list">${t('loopPlan')}</option></select></label></div><div class="player-feedback"><p role="status" aria-live="polite" id="video-status"></p><button id="retry-video" type="button" hidden>${t('retry')}</button></div>`;
      const video = area.querySelector('video'), stage = area.querySelector('#video-stage'), controls = area.querySelector('#player-controls'), mode = area.querySelector('#playback-mode'), fullscreen = area.querySelector('#fullscreen'), status = area.querySelector('#video-status'), retry = area.querySelector('#retry-video'), playToggle = area.querySelector('#play-toggle'), centerToggle = area.querySelector('#center-toggle'), seek = area.querySelector('#seek'), time = area.querySelector('#time-display');
      mode.value = state.settings.playbackMode; mode.onchange = () => { state.settings.playbackMode = mode.value; save(); };
      const showControls = () => { controls.classList.add('visible'); stage.classList.add('controls-visible'); clearTimeout(timer); timer = setTimeout(() => { if (!video.paused && !controls.contains(document.activeElement)) { controls.classList.remove('visible'); stage.classList.remove('controls-visible'); } }, 2500); };
      const hideControls = () => { clearTimeout(timer); if (!video.paused && !controls.contains(document.activeElement)) { controls.classList.remove('visible'); stage.classList.remove('controls-visible'); } };
      stage.addEventListener('pointermove', showControls); stage.addEventListener('pointerdown', showControls); stage.addEventListener('pointerleave', hideControls); stage.addEventListener('focusin', showControls); stage.addEventListener('focusout', () => setTimeout(hideControls, 0));
      const syncFullscreen = () => { const isFull = document.fullscreenElement === stage || document.webkitFullscreenElement === stage || Boolean(video.webkitDisplayingFullscreen); fullscreen.setAttribute('aria-pressed', String(isFull)); fullscreen.textContent = t(isFull ? 'exitFullscreen' : 'fullscreen'); };
      const removeFullscreenListeners = () => { document.removeEventListener('fullscreenchange', syncFullscreen); document.removeEventListener('webkitfullscreenchange', syncFullscreen); video.removeEventListener('webkitbeginfullscreen', syncFullscreen); video.removeEventListener('webkitendfullscreen', syncFullscreen); };
      document.addEventListener('fullscreenchange', syncFullscreen);
      document.addEventListener('webkitfullscreenchange', syncFullscreen);
      video.addEventListener('webkitbeginfullscreen', syncFullscreen);
      video.addEventListener('webkitendfullscreen', syncFullscreen);
      const play = () => { playingIntent = true; const result = video.play(); if (result && typeof result.catch === 'function') result.catch(() => { playingIntent = false; if (!disposed) status.textContent = t('autoplayBlocked'); }); };
      const formatTime = value => Number.isFinite(value) ? `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}` : '0:00';
      const updateTimeline = () => { seek.value = Number.isFinite(video.duration) && video.duration > 0 ? String(Math.round(video.currentTime / video.duration * 1000)) : '0'; const currentTime = formatTime(video.currentTime), duration = formatTime(video.duration); time.textContent = `${currentTime} / ${duration}`; seek.setAttribute('aria-valuetext', extra(`${currentTime}，共 ${duration}`, `${currentTime} of ${duration}`)); };
      const togglePlayback = () => { if (video.paused) play(); else video.pause(); };
      playToggle.onclick = togglePlayback;
      centerToggle.onclick = togglePlayback;
      video.onclick = () => { if (video.paused) play(); else video.pause(); };
      seek.oninput = () => { if (Number.isFinite(video.duration)) { video.currentTime = video.duration * Number(seek.value) / 1000; updateTimeline(); } };
      const mute = area.querySelector('#mute'); mute.onclick = () => { video.muted = !video.muted; mute.setAttribute('aria-pressed', String(video.muted)); mute.textContent = video.muted ? extra('取消静音', 'Unmute') : extra('静音', 'Mute'); };
      fullscreen.onclick = async () => {
        try {
          if (video.webkitDisplayingFullscreen && typeof video.webkitExitFullscreen === 'function') video.webkitExitFullscreen();
          else if ((document.fullscreenElement === stage || document.webkitFullscreenElement === stage) && (document.exitFullscreen || document.webkitExitFullscreen)) await (document.exitFullscreen || document.webkitExitFullscreen).call(document);
          else {
            const request = stage.requestFullscreen || stage.webkitRequestFullscreen;
            if (typeof request === 'function') await request.call(stage);
            else {
              const enterVideoFullscreen = video.webkitEnterFullscreen || video.webkitEnterFullScreen;
              if (typeof enterVideoFullscreen !== 'function') throw new Error('fullscreen unavailable');
              enterVideoFullscreen.call(video);
            }
            if (video.paused && video.src) play();
          }
        } catch { status.textContent = t('autoplayBlocked'); }
        syncFullscreen();
      };
      const load = async (resume = pendingResume) => {
        if (resume) pendingResume = resume;
        document.querySelector('#learning-controls').hidden = true;
        const request = ++serial; status.textContent = t('loading'); retry.hidden = true;
        try { const data = await post('/api/english/playback', { lessonId:current.id }); if (disposed || request !== serial) return;
          const url = new URL(data.url); if (url.protocol !== 'https:' || !url.search || !Number.isFinite(Date.parse(data.expiresAt))) throw new Error('invalid response');
          setAuthenticated(true); expiresAt = Date.parse(data.expiresAt); resumeAt = pendingResume?.position ?? null; resumePlay = pendingResume?.shouldPlay ?? false; switching = true; video.src = url.href; status.textContent = ''; document.querySelector('#learning-controls').hidden = false;
        } catch (err) { if (disposed || request !== serial) return; video.removeAttribute('src'); if (err.status === 401) { setAuthenticated(false); removeFullscreenListeners(); loginForm(); } else { status.textContent = message(err); retry.hidden = false; } }
      };
      retry.onclick = () => { recovering = false; const resume = pendingResume || { position: stopped ? 0 : (video.currentTime || 0), shouldPlay: playingIntent }; stopped = false; load(resume); };
      video.addEventListener('error', () => { if (disposed || !video.getAttribute('src')) return; if (!recovering && Date.now() >= expiresAt) { recovering = true; load({ position: video.currentTime || 0, shouldPlay: playingIntent }); } else { status.textContent = t('videoError'); retry.hidden = false; } });
      video.addEventListener('loadedmetadata', () => { video.currentTime = resumeAt === null ? resumePosition(state.watched[current.id], video.duration, !!state.completed[current.id]) : Math.min(resumeAt, Number.isFinite(video.duration) ? video.duration : resumeAt); updateTimeline(); switching = false; recovering = false; pendingResume = null; if (resumePlay) play(); resumeAt = null; resumePlay = false; });
      video.addEventListener('play', () => { playingIntent = true; playToggle.textContent = centerToggle.textContent = extra('暂停', 'Pause'); centerToggle.setAttribute('aria-label',extra('暂停', 'Pause')); showControls(); });
      let lastSaved = 0;
      video.addEventListener('timeupdate', () => { updateTimeline(); if (video.currentTime - lastSaved >= 5) { recordProgress(state, current.id, video.currentTime); save(); lastSaved = video.currentTime; } });
      video.addEventListener('pause', () => { playToggle.textContent = centerToggle.textContent = extra('播放', 'Play'); centerToggle.setAttribute('aria-label',extra('播放', 'Play')); showControls(); if (!switching && !video.error && !video.ended) playingIntent = false; if (video.currentTime > 0 && !video.ended) { recordProgress(state, current.id, video.currentTime); save(); } });
      video.addEventListener('ended', () => {
        completeLesson(state, current.id); markPlanLessonDone(state, currentPlan(), current.id, ids); save();
        const action = endDecision(state.settings.playbackMode, lessons.map(item => item.id), currentPlan().lessonIds, current.id);
        if (action.type === 'repeat' || action.type === 'next') {
          const next = lessons.find(item => item.id === action.nextId); if (!next) return;
          current = next; active = next.id; lastSaved = 0; recovering = false;
          const nextUrl = new URL(location.href); nextUrl.searchParams.set('lesson', next.id); history.replaceState({}, '', nextUrl);
          document.querySelector('.lesson-heading h1').textContent = title(next); document.querySelector('.lesson-heading .eyebrow').textContent = `${next.level.name} · ${next.unit ? `Unit ${next.unit} · ` : ''}${next.type}`; document.querySelector('#complete').textContent = t(state.completed[next.id] ? 'completed' : 'done');
          video.setAttribute('aria-label', next.title); load({ position: 0, shouldPlay: true });
        } else { stopped = true; video.removeAttribute('src'); status.textContent = ''; retry.hidden = false; }
      });
      disposePlayer = () => { disposed = true; ++serial; clearTimeout(timer); removeFullscreenListeners(); video.removeAttribute('src'); };
      load();
    };
    disposePlayer = () => { disposed = true; ++serial; clearTimeout(timer); };
    setupPlayer();
  }
}
window.addEventListener('popstate', () => { const id = new URLSearchParams(location.search).get('lesson'); active = ids.has(id) ? id : null; lessonPlanScope = null; render(); });
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/english/sw.js', { scope: '/english/' }).catch(() => {});
