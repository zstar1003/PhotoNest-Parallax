const $ = (selector) => document.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let albums = [], photos = [], active = 0, timer = null, renderId = 0, filter = 'all';
const pad = n => String(n).padStart(2, '0');
const english = { chongqing: 'CHONGQING', chengdu: 'CHENGDU', hongkong: 'HONG KONG', luoyang: 'LUOYANG', shenzhen: 'SHENZHEN', xian: 'XI’AN', xidian: 'XIDIAN UNIVERSITY' };
function stopPlayback() { clearInterval(timer); timer = null; $('#autoplay').textContent = '▷ 自动播放'; $('#autoplay').setAttribute('aria-pressed', 'false'); }
function startPlayback() { timer = setInterval(() => show(active + 1), 5500); $('#autoplay').textContent = 'Ⅱ 暂停播放'; $('#autoplay').setAttribute('aria-pressed', 'true'); }
function makeThumb(photo, index) {
  const button = document.createElement('button'); button.className = 'thumb';
  button.setAttribute('aria-label', `${index + 1} · ${photo.title}`);
  button.innerHTML = '<img loading="lazy" decoding="async" alt=""><span class="thumb-label"><span></span><span></span></span>';
  button.querySelector('img').src = photo.preview;
  button.querySelector('.thumb-label span').textContent = pad(index + 1);
  button.querySelector('.thumb-label span:last-child').textContent = photo.title;
  button.addEventListener('click', () => { stopPlayback(); show(index); });
  return button;
}
function selectAlbum(id) {
  stopPlayback(); filter = id;
  photos = albums.filter(a => id === 'all' || a.id === id).flatMap(a => a.photos.map(p => ({...p, album: a})));
  $('#filters').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.album === id)));
  $('#filmstrip').replaceChildren(...photos.map(makeThumb));
  $('#sheet-count').textContent = `${pad(photos.length)} FRAMES`;
  show(0, false);
}
async function show(index, animate = true) {
  if (!photos.length) return;
  active = (index + photos.length) % photos.length;
  const photo = photos[active], currentRender = ++renderId;
  $('#serial').textContent = pad(active + 1);
  $('#title').textContent = photo.title;
  $('#location').textContent = photo.location;
  $('#description').textContent = photo.album.description;
  $('#city-en').textContent = english[photo.album.id];
  const date = photo.original.match(/DJI_(\d{4})(\d{2})(\d{2})/);
  $('#photo-date').textContent = date ? `${date[1]} / ${date[2]} / ${date[3]}` : 'VISUAL JOURNAL';
  $('#dimensions').textContent = photo.dimensions;
  $('#position').textContent = `${pad(active + 1)} / ${pad(photos.length)}`;
  $('#status').textContent = `${photo.title} · ${active + 1} / ${photos.length}`;
  const thumbs = [...$('#filmstrip').children];
  thumbs.forEach((t,i) => t.setAttribute('aria-current', String(i === active)));
  const strip = $('#filmstrip'), thumb = thumbs[active];
  strip.scrollTo({left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2, behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant'});
  $('#hero').style.opacity = '.4';
  const loaded = new Image(); loaded.src = photo.preview;
  try { await loaded.decode(); } catch { if (currentRender === renderId) $('#status').textContent = '图片加载失败，请刷新重试。'; }
  if (currentRender !== renderId) return;
  $('#hero').src = photo.preview; $('#hero').alt = photo.alt; $('#hero').style.opacity = '1';
  $('.ambient').style.backgroundImage = `url("${photo.preview}")`;
  if (animate && !reducedMotion.matches) {
    $('#hero').getAnimations().forEach(a => a.cancel());
    $('#hero').animate([{opacity:.3,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
    $('.caption').getAnimations().forEach(a => a.cancel());
    $('.caption').animate([{opacity:.3,transform:'translateX(-15px)'},{opacity:1,transform:'translateX(0)'}],{duration:450});
  }
  const next = new Image(); next.src = photos[(active + 1) % photos.length].preview;
}
$('.prev').addEventListener('click', () => { stopPlayback(); show(active - 1); });
$('.next').addEventListener('click', () => { stopPlayback(); show(active + 1); });
$('#autoplay').addEventListener('click', () => { if (photos.length) timer ? stopPlayback() : startPlayback(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlayback(); });
document.addEventListener('keydown', e => {
  if ($('#lightbox').open || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); stopPlayback(); show(active + (e.key === 'ArrowRight' ? 1 : -1)); }
});
let touchStart = null;
$('.photo-frame').addEventListener('touchstart', e => { touchStart = {x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}; }, {passive:true});
$('.photo-frame').addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x, dy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { e.preventDefault(); stopPlayback(); show(active + (dx < 0 ? 1 : -1)); }
  touchStart = null;
});
let frame = 0;
$('.exhibition').addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || reducedMotion.matches) return;
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    const rect = $('.exhibition').getBoundingClientRect();
    document.documentElement.style.setProperty('--px', (e.clientX - rect.left) / rect.width * 2 - 1);
    document.documentElement.style.setProperty('--py', (e.clientY - rect.top) / rect.height * 2 - 1);
  });
});
$('.exhibition').addEventListener('pointerleave', () => { cancelAnimationFrame(frame); document.documentElement.style.setProperty('--px',0); document.documentElement.style.setProperty('--py',0); });
$('#open-photo').addEventListener('click', () => {
  if (!photos.length) return;
  stopPlayback(); const p = photos[active];
  $('#lightbox-image').src = p.preview; $('#lightbox-image').alt = p.alt;
  $('#lightbox-title').textContent = `${p.title} · ${p.location}`;
  $('#original').href = p.original; $('#lightbox').showModal();
});
$('#close-lightbox').addEventListener('click', () => $('#lightbox').close());
$('#lightbox').addEventListener('click', e => { if (e.target === $('#lightbox')) { const r = e.target.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
async function init() {
  try {
    const response = await fetch('./gallery.json'); if (!response.ok) throw Error('Gallery unavailable');
    albums = await response.json();
    // Open with the Chongqing series, then keep the source album order.
    albums.sort((a,b) => (b.id === 'chongqing') - (a.id === 'chongqing'));
    $('#collection-count').textContent = `${pad(albums.length)} PLACES / ${pad(albums.reduce((n,a) => n+a.photos.length,0))} PHOTOGRAPHS`;
    for (const a of [{id:'all', title:'全部', photos:albums.flatMap(a=>a.photos)}, ...albums]) {
      const b = document.createElement('button'); b.dataset.album = a.id;
      b.append(document.createTextNode(a.title)); const count = document.createElement('sup'); count.textContent = pad(a.photos.length); b.append(count);
      b.addEventListener('click', () => selectAlbum(a.id)); $('#filters').append(b);
    }
    selectAlbum('all');
  } catch (error) { $('#description').textContent = '相册暂时无法载入，请刷新页面重试。'; $('#status').textContent = '相册加载失败'; console.error(error); }
}
init();
