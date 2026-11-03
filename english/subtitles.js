// Captions stay on this origin even when the video is a signed COS URL.
// Only the authenticated POST returns subtitle text; nothing enters Cache API.
export function mountSubtitles({ video, container, lessonId, language, post, isCurrent, enabled = true, onEnabled = () => {} }) {
  let disposed = false, track, objectUrl, segmentEnd = null, segmentStart = null, generation = 0;
  const alive = () => !disposed && isCurrent();
  const label = (zh, en) => language === 'zh' ? zh : en;
  const clearTrack = () => { if (track) { try { track.track.mode = 'disabled'; } catch {} track.remove(); track = null; } if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; } };
  container.replaceChildren();
  const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = label('正在加载字幕…', 'Loading subtitles…');
  const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'secondary'; retry.textContent = label('重试字幕', 'Retry subtitles'); retry.hidden = true;
  const controls = document.createElement('div'); container.append(status, retry, controls);
  const load = async () => {
    const request = ++generation; retry.hidden = true; status.textContent = label('正在加载字幕…', 'Loading subtitles…'); controls.replaceChildren(); clearTrack(); segmentEnd = null;
    try {
      const data = await post('/api/english/subtitles', { lessonId });
      if (!alive() || request !== generation) return;
      if (data.lessonId !== lessonId || typeof data.englishVtt !== 'string' || !data.englishVtt.startsWith('WEBVTT\n') || !Array.isArray(data.cues) || !data.cues.length || !data.cues.every((cue, index) => cue.index === index && Number.isFinite(cue.start) && cue.start >= 0 && Number.isFinite(cue.end) && cue.end > cue.start && typeof cue.text === 'string')) throw new Error('Invalid subtitles');
      status.textContent = data.bilingualVtt ? label('中文字幕为机器翻译，仅供参考。', 'Chinese captions are machine translated for reference.') : label('本课使用英文字幕。', 'English captions are available.');
      const field = document.createElement('label'), select = document.createElement('select'); field.textContent = label('字幕 ', 'Captions '); select.setAttribute('aria-label', label('字幕', 'Captions'));
      for (const [value, text] of [['off', label('关闭', 'Off')], ['en', 'English'], ...(data.bilingualVtt ? [['zh', label('中英双语', 'English + 中文')]] : [])]) { const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option); }
      select.value = enabled ? language === 'zh' && data.bilingualVtt ? 'zh' : 'en' : 'off';
      const apply = () => {
        clearTrack(); onEnabled(select.value !== 'off'); if (select.value === 'off') return;
        const current = document.createElement('track'); current.kind = 'subtitles'; current.srclang = select.value; current.label = select.value === 'zh' ? 'English + 中文' : 'English'; current.default = true;
        objectUrl = URL.createObjectURL(new Blob([select.value === 'zh' ? data.bilingualVtt : data.englishVtt], { type: 'text/vtt;charset=utf-8' })); current.src = objectUrl; track = current;
        current.addEventListener('load', () => { if (alive() && track === current) current.track.mode = 'showing'; });
        current.addEventListener('error', () => { if (alive() && track === current) { status.textContent = label('字幕显示失败，请重试。', 'Captions failed to display. Please retry.'); retry.hidden = false; } });
        video.append(current);
      };
      select.onchange = apply; field.append(select); controls.append(field); apply();
      const details = document.createElement('details'), summary = document.createElement('summary'), list = document.createElement('ol'); summary.textContent = label('逐句听读', 'Listen sentence by sentence'); details.append(summary, list);
      data.cues.forEach(cue => { const li = document.createElement('li'), button = document.createElement('button'); button.type = 'button'; button.className = 'secondary'; button.textContent = cue.text + (language === 'zh' && cue.chinese ? ` · ${cue.chinese}` : ''); button.onclick = () => { if (!alive()) return; segmentStart = cue.start; segmentEnd = cue.end; video.currentTime = cue.start; const playing = video.play(); playing?.catch(() => { if (alive()) status.textContent = label('请点击视频播放按钮继续。', 'Tap the video play button to continue.'); }); }; li.append(button); list.append(li); });
      controls.append(details);
    } catch (error) {
      if (!alive() || request !== generation) return;
      status.textContent = error.status === 401 ? label('登录已过期，请重新登录后加载字幕。', 'Sign in again to load subtitles.') : label('字幕加载失败；视频仍可播放，请重试字幕。', 'Subtitles could not load. Video playback is still available; retry subtitles.'); retry.hidden = false;
    }
  };
  const stopSegment = () => { if (segmentEnd !== null && video.currentTime >= segmentEnd) { segmentEnd = null; video.pause(); } };
  const cancelSegment = () => { if (segmentEnd !== null && (video.currentTime < segmentStart - 0.1 || video.currentTime > segmentEnd)) segmentEnd = null; };
  video.addEventListener('timeupdate', stopSegment); video.addEventListener('seeking', cancelSegment);
  retry.onclick = load; load();
  return () => { disposed = true; ++generation; clearTrack(); video.removeEventListener('timeupdate', stopSegment); video.removeEventListener('seeking', cancelSegment); container.replaceChildren(); };
}
