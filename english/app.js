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
let disposePlayer = () => {};
if (active && !ids.has(active)) active = null;
const words = {
  zh: { access:'家庭访问码', login:'登录', logout:'退出登录', retry:'重试', logging:'正在登录…', loading:'正在加载视频…', invalid:'访问码不正确，请重试。', session:'请登录或重新登录以观看视频。', forbidden:'请求被拒绝，请检查访问地址。', missing:'课程不存在。', network:'网络请求失败，请重试。', intro:'每天一点，陪孩子发现英语的乐趣。', library:'课程库', plan:'今日计划', language:'English', search:'搜索课程', all:'全部级别', add:'加入今日计划', remove:'移出计划', play:'打开课程', done:'标记完成', completed:'已完成', back:'返回课程库', empty:'还没有课程，先从课程库加入。', total:'节课程', planned:'今日计划', noVideo:'视频尚未配置，请联系站点管理员。', videoError:'视频暂时无法播放，请稍后再试。', subtitles:'字幕暂不可用', noMatches:'没有找到匹配的课程。', local:'计划和学习进度保存在此浏览器中。', status:'课程加载失败，请刷新后重试。', select:'选择课程', addSelected:'加入所选课程', clearPlan:'清空所有已添加课程/计划', confirmClear:'确定清空今日和本周的所有已添加课程及计划吗？学习进度会保留。', playback:'播放方式', autoNext:'播完下一集', repeatOne:'重复当前', loopPlan:'循环计划', fullscreen:'全屏', exitFullscreen:'退出全屏', autoplayBlocked:'请点按播放继续。' },
  en: { access:'Family access code', login:'Sign in', logout:'Sign out', retry:'Retry', logging:'Signing in…', loading:'Loading video…', invalid:'Incorrect access code. Please try again.', session:'Sign in again to watch this video.', forbidden:'Request denied. Check the site address.', missing:'Lesson not found.', network:'Network request failed. Please retry.', intro:'A little English together, every day.', library:'Library', plan:'Today’s plan', language:'中文', search:'Search lessons', all:'All levels', add:'Add to today', remove:'Remove from plan', play:'Open lesson', done:'Mark complete', completed:'Completed', back:'Back to library', empty:'No lessons yet. Add one from the library.', total:'lessons', planned:'Today’s plan', noVideo:'Video is not configured yet. Please contact the site owner.', videoError:'This video cannot be played right now. Please try again later.', subtitles:'Subtitles are not available', noMatches:'No matching lessons.', local:'Your plan and progress are saved in this browser.', status:'Could not load lessons. Please refresh and try again.', select:'Select lesson', addSelected:'Add selected lessons', clearPlan:'Clear all added lessons and plans', confirmClear:'Clear all added lessons from today’s and this week’s plans? Learning progress will be kept.', playback:'Playback mode', autoNext:'Play next', repeatOne:'Repeat this lesson', loopPlan:'Loop today’s plan', fullscreen:'Fullscreen', exitFullscreen:'Exit fullscreen', autoplayBlocked:'Tap play to continue.' }
};
const lang = () => state.settings.language === 'en' ? 'en' : 'zh';
const t = key => words[lang()][key];
const esc = value => escapeHtml(String(value ?? ''));
const currentPlan = () => ({ identity: `today:${currentPlanDate()}`, lessonIds: plannedIds() });
const plannedIds = () => state.plans.today.key === currentPlanDate() ? state.plans.today.lessonIds : [];
function currentPlanDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
const save = () => saveState(state);
function setActive(id) {
  active = id; const url = new URL(location.href); if (id) url.searchParams.set('lesson', id); else url.searchParams.delete('lesson'); history.pushState({}, '', url); render();
}
function card(item) {
  const inPlan = plannedIds().includes(item.id);
  return `<article class="card"><div class="card-top"><label class="selection"><input type="checkbox" data-select="${esc(item.id)}" ${selectedIds.has(item.id) ? 'checked' : ''} aria-label="${t('select')}: ${esc(item.title)}"></label><span class="badge">${esc(item.level.name)}</span><span class="number">${esc(item.number || '')}</span></div><h3>${esc(item.title)}</h3><p>${item.unit ? `Unit ${esc(item.unit)} · ` : ''}${esc(item.type)}</p><div class="actions"><button class="primary" data-open="${esc(item.id)}">${t('play')}</button><button class="secondary" data-plan="${esc(item.id)}">${inPlan ? t('remove') : t('add')}</button></div>${state.completed[item.id] ? `<small class="completed">✓ ${t('completed')}</small>` : ''}</article>`;
}
function render() {
  disposePlayer(); disposePlayer = () => {};
  document.documentElement.lang = lang() === 'zh' ? 'zh-CN' : 'en';
  const selected = lessons.find(item => item.id === active);
  const filtered = lessons.filter(item => (level === 'all' || item.level.id === level) && item.title.toLowerCase().includes(query.toLowerCase()));
  const planItems = plannedIds().map(id => lessons.find(item => item.id === id)).filter(Boolean);
  app.innerHTML = `<header class="header"><a class="brand" href="/english/">✦ <span>Wow Family</span></a><nav aria-label="${t('library')}"><button data-view="library" class="${view === 'library' && !selected ? 'selected' : ''}">${t('library')}</button><button data-view="plan" class="${view === 'plan' && !selected ? 'selected' : ''}">${t('plan')} <span class="count">${planItems.length}</span></button></nav><button class="language" id="language">${t('language')}</button></header><div class="content">${selected ? `<button id="back" class="back">← ${t('back')}</button><section class="player"><div><span class="eyebrow">${esc(selected.level.name)} · ${esc(selected.type)}</span><h1>${esc(selected.title)}</h1><div id="video-area"></div><p class="notice">${t('subtitles')}</p><button class="primary" id="complete">${state.completed[selected.id] ? t('completed') : t('done')}</button></div></section>` : `<section class="hero"><div><span class="eyebrow">WOW FAMILY · ENGLISH</span><h1>${view === 'plan' ? t('planned') : t('library')}</h1><p>${t('intro')}</p></div><div class="hero-count"><strong>${catalog.totalLessons}</strong><span>${t('total')}</span></div></section>${view === 'library' ? `<div class="bulk"><button class="primary" id="add-selected" ${selectedIds.size ? '' : 'disabled'}>${t('addSelected')} (${selectedIds.size})</button></div><div class="filters"><label><span>${t('search')}</span><input id="search" type="search" value="${esc(query)}" placeholder="${t('search')}"></label><label><span>${t('all')}</span><select id="level"><option value="all">${t('all')}</option>${catalog.levels.map(l => `<option value="${esc(l.id)}" ${level === l.id ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select></label></div><section class="grid">${filtered.length ? filtered.map(card).join('') : `<p>${t('noMatches')}</p>`}</section>` : `<div class="bulk"><button class="secondary" id="clear-plan" ${state.plans.today.lessonIds.length || state.plans.week.lessonIds.length ? '' : 'disabled'}>${t('clearPlan')}</button></div><section class="grid">${planItems.length ? planItems.map(card).join('') : `<p>${t('empty')}</p>`}</section>`}`}<footer>${t('local')}</footer></div>`;
  document.querySelector('#language').onclick = () => { state.settings.language = lang() === 'zh' ? 'en' : 'zh'; save(); render(); };
  document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => { view = button.dataset.view; active = null; const url = new URL(location.href); url.searchParams.delete('lesson'); history.pushState({}, '', url); render(); });
  document.querySelectorAll('[data-open]').forEach(button => button.onclick = () => setActive(button.dataset.open));
  document.querySelectorAll('[data-plan]').forEach(button => button.onclick = () => { const id = button.dataset.plan; const prior = plannedIds(); setPlanLessons(state, 'today', prior.includes(id) ? prior.filter(x => x !== id) : [...prior, id], new Date(), ids); save(); render(); });
  document.querySelectorAll('[data-select]').forEach(box => box.onchange = () => { if (box.checked) selectedIds.add(box.dataset.select); else selectedIds.delete(box.dataset.select); const add = document.querySelector('#add-selected'); if (add) { add.disabled = !selectedIds.size; add.textContent = `${t('addSelected')} (${selectedIds.size})`; } });
  const addSelected = document.querySelector('#add-selected'); if (addSelected) addSelected.onclick = () => { const chosen = lessons.map(item => item.id).filter(id => selectedIds.has(id)); setPlanLessons(state, 'today', [...new Set([...plannedIds(), ...chosen])], new Date(), ids); selectedIds.clear(); save(); render(); };
  const clearPlan = document.querySelector('#clear-plan'); if (clearPlan) clearPlan.onclick = () => { if (!window.confirm(t('confirmClear'))) return; state = clearAllPlanContent(state); save(); render(); };
  const search = document.querySelector('#search'); if (search) search.oninput = e => { query = e.target.value; const pos = e.target.selectionStart; render(); const next = document.querySelector('#search'); next.focus(); next.setSelectionRange(pos, pos); };
  const filter = document.querySelector('#level'); if (filter) filter.onchange = e => { level = e.target.value; render(); };
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
      area.innerHTML = `<form id="login-form"><label for="access-code">${t('access')}</label><input id="access-code" type="password" autocomplete="current-password" required maxlength="256"><button class="primary" type="submit">${t('login')}</button><p role="status" aria-live="polite">${note}</p></form>`;
      const form = area.querySelector('form'), button = form.querySelector('button'), status = form.querySelector('[role=status]');
      form.onsubmit = async e => { e.preventDefault(); button.disabled = true; status.textContent = t('logging'); const code = form.querySelector('input').value;
        try { await post('/api/english/login', { code }); if (!disposed) { form.querySelector('input').value = ''; setupPlayer(); } }
        catch (err) { if (!disposed) { status.textContent = err.status === 401 ? t('invalid') : message(err); button.disabled = false; } }
      };
    };
    const setupPlayer = () => {
      area.innerHTML = `<div class="video-stage" id="video-stage"><video controls playsinline preload="metadata" aria-label="${esc(current.title)}"></video><div class="player-controls" id="player-controls"><label>${t('playback')} <select id="playback-mode"><option value="auto-next">${t('autoNext')}</option><option value="repeat-one">${t('repeatOne')}</option><option value="loop-list">${t('loopPlan')}</option></select></label><button id="fullscreen" type="button" aria-pressed="false">${t('fullscreen')}</button></div></div><p role="status" aria-live="polite" id="video-status"></p><button id="retry-video" type="button" hidden>${t('retry')}</button> <button id="logout" type="button">${t('logout')}</button>`;
      const video = area.querySelector('video'), stage = area.querySelector('#video-stage'), controls = area.querySelector('#player-controls'), mode = area.querySelector('#playback-mode'), fullscreen = area.querySelector('#fullscreen'), status = area.querySelector('#video-status'), retry = area.querySelector('#retry-video');
      mode.value = state.settings.playbackMode; mode.onchange = () => { state.settings.playbackMode = mode.value; save(); };
      const showControls = () => { controls.classList.add('visible'); clearTimeout(timer); timer = setTimeout(() => { if (!controls.contains(document.activeElement)) controls.classList.remove('visible'); }, 2500); };
      const hideControls = () => { clearTimeout(timer); if (!controls.contains(document.activeElement)) controls.classList.remove('visible'); };
      stage.addEventListener('pointermove', showControls); stage.addEventListener('pointerdown', showControls); stage.addEventListener('pointerleave', hideControls); stage.addEventListener('focusin', showControls); stage.addEventListener('focusout', () => setTimeout(hideControls, 0));
      const syncFullscreen = () => { const isFull = document.fullscreenElement === stage; fullscreen.setAttribute('aria-pressed', String(isFull)); fullscreen.textContent = t(isFull ? 'exitFullscreen' : 'fullscreen'); };
      document.addEventListener('fullscreenchange', syncFullscreen);
      const play = () => { playingIntent = true; const result = video.play(); if (result && typeof result.catch === 'function') result.catch(() => { playingIntent = false; if (!disposed) status.textContent = t('autoplayBlocked'); }); };
      fullscreen.onclick = async () => { try { if (document.fullscreenElement === stage) await document.exitFullscreen(); else { await stage.requestFullscreen(); if (video.paused && video.src) play(); } } catch { status.textContent = t('autoplayBlocked'); } syncFullscreen(); };
      const load = async (resume = pendingResume) => {
        if (resume) pendingResume = resume;
        const request = ++serial; status.textContent = t('loading'); retry.hidden = true;
        try { const data = await post('/api/english/playback', { lessonId:current.id }); if (disposed || request !== serial) return;
          const url = new URL(data.url); if (url.protocol !== 'https:' || !url.search || !Number.isFinite(Date.parse(data.expiresAt))) throw new Error('invalid response');
          expiresAt = Date.parse(data.expiresAt); resumeAt = pendingResume?.position ?? null; resumePlay = pendingResume?.shouldPlay ?? false; switching = true; video.src = url.href; status.textContent = '';
        } catch (err) { if (disposed || request !== serial) return; video.removeAttribute('src'); if (err.status === 401) { document.removeEventListener('fullscreenchange', syncFullscreen); loginForm(); } else { status.textContent = message(err); retry.hidden = false; } }
      };
      retry.onclick = () => { recovering = false; const resume = pendingResume || { position: stopped ? 0 : (video.currentTime || 0), shouldPlay: playingIntent }; stopped = false; load(resume); };
      area.querySelector('#logout').onclick = async () => { ++serial; playingIntent = false; pendingResume = null; video.pause(); video.removeAttribute('src'); try { await post('/api/english/logout', {}); if (!disposed) { document.removeEventListener('fullscreenchange', syncFullscreen); loginForm(); } } catch (err) { if (!disposed) { status.textContent = message(err); retry.hidden = false; } } };
      video.addEventListener('error', () => { if (disposed || !video.getAttribute('src')) return; if (!recovering && Date.now() >= expiresAt) { recovering = true; load({ position: video.currentTime || 0, shouldPlay: playingIntent }); } else { status.textContent = t('videoError'); retry.hidden = false; } });
      video.addEventListener('loadedmetadata', () => { video.currentTime = resumeAt === null ? resumePosition(state.watched[current.id], video.duration, !!state.completed[current.id]) : Math.min(resumeAt, Number.isFinite(video.duration) ? video.duration : resumeAt); switching = false; recovering = false; pendingResume = null; if (resumePlay) play(); resumeAt = null; resumePlay = false; });
      video.addEventListener('play', () => { playingIntent = true; });
      let lastSaved = 0;
      video.addEventListener('timeupdate', () => { if (video.currentTime - lastSaved >= 5) { recordProgress(state, current.id, video.currentTime); save(); lastSaved = video.currentTime; } });
      video.addEventListener('pause', () => { if (!switching && !video.error && !video.ended) playingIntent = false; if (video.currentTime > 0 && !video.ended) { recordProgress(state, current.id, video.currentTime); save(); } });
      video.addEventListener('ended', () => {
        completeLesson(state, current.id); markPlanLessonDone(state, currentPlan(), current.id, ids); save();
        const action = endDecision(state.settings.playbackMode, lessons.map(item => item.id), plannedIds(), current.id);
        if (action.type === 'repeat' || action.type === 'next') {
          const next = lessons.find(item => item.id === action.nextId); if (!next) return;
          current = next; active = next.id; lastSaved = 0; recovering = false;
          const nextUrl = new URL(location.href); nextUrl.searchParams.set('lesson', next.id); history.replaceState({}, '', nextUrl);
          document.querySelector('.player h1').textContent = next.title; document.querySelector('.player .eyebrow').textContent = `${next.level.name} · ${next.type}`; document.querySelector('#complete').textContent = t(state.completed[next.id] ? 'completed' : 'done');
          video.setAttribute('aria-label', next.title); load({ position: 0, shouldPlay: true });
        } else { stopped = true; video.removeAttribute('src'); status.textContent = ''; retry.hidden = false; }
      });
      disposePlayer = () => { disposed = true; ++serial; clearTimeout(timer); document.removeEventListener('fullscreenchange', syncFullscreen); video.removeAttribute('src'); };
      load();
    };
    disposePlayer = () => { disposed = true; ++serial; clearTimeout(timer); };
    setupPlayer();
  }
}
window.addEventListener('popstate', () => { const id = new URLSearchParams(location.search).get('lesson'); active = ids.has(id) ? id : null; render(); });
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/english/sw.js', { scope: '/english/' }).catch(() => {});
