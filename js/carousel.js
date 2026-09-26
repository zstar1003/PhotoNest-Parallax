// Adapted from hakadao/ArknightsParallaxCarousel (MIT).
// Preserve the original layers, animation timing and four-thumbnail composition.
(async function () {
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mediaList = document.querySelector('#media-list');
const layerFront = document.querySelector('#media-layer-front');
const mediaSerial = layerFront.querySelector('.media-info-serial');
const mediaTitle = layerFront.querySelector('.media-info-title');
const mediaDetail = layerFront.querySelector('.media-info-detail');
const mediaMainPic = document.querySelector('.media-main-pic');
let albums;
try {
  const response = await fetch('gallery.json?v=places-1');
  if (!response.ok) throw Error('Unable to load gallery');
  albums = await response.json();
} catch (error) {
  mediaTitle.textContent = '相册加载失败';
  mediaDetail.textContent = '请刷新页面重试';
  console.error(error); return;
}
let carouselList = [], items = [], navItems = [];
let activeIndex = 0, busy = false, pending = null, initial = true, generation = 0;
const sidebar = document.querySelector('#places-sidebar');
const toggle = document.querySelector('#places-toggle');
const backdrop = document.querySelector('#places-backdrop');
const mobile = matchMedia('(max-width: 900px)');
function setSidebar(open, restoreFocus = false) {
  sidebar.hidden = !open;
  document.body.classList.toggle('places-open',open);
  toggle.setAttribute('aria-expanded',String(open));
  backdrop.hidden = !open || !mobile.matches;
  if (restoreFocus) toggle.focus();
  requestAnimationFrame(() => { if(items.length) setSlidePosition(); });
}
toggle.addEventListener('click',()=>{setSidebar(sidebar.hidden); if(!sidebar.hidden) document.querySelector('#places-close').focus();});
document.querySelector('#places-close').addEventListener('click',()=>setSidebar(false,true));
backdrop.addEventListener('click',()=>setSidebar(false,true));
mobile.addEventListener('change',()=>setSidebar(!mobile.matches));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && !sidebar.hidden) setSidebar(false,true);
  if(e.key==='Tab' && mobile.matches && !sidebar.hidden) {
    const focusable=[...sidebar.querySelectorAll('button')];
    if(e.shiftKey && document.activeElement===focusable[0]) {e.preventDefault();focusable.at(-1).focus();}
    else if(!e.shiftKey && document.activeElement===focusable.at(-1)) {e.preventDefault();focusable[0].focus();}
  }
});
setSidebar(!mobile.matches);
document.querySelector('#album-count').textContent=String(albums.length).padStart(2,'0');
for (const album of albums) {
  const button=document.createElement('button');
  button.dataset.album=album.id;
  const label=document.createElement('span');label.textContent=album.title;
  const count=document.createElement('span');count.className='place-count';count.textContent=String(album.photos.length).padStart(2,'0');
  button.append(label,count);button.setAttribute('aria-label',`${album.title}，${album.photos.length} 张照片`);
  button.addEventListener('click',()=>{selectAlbum(album);if(mobile.matches)setSidebar(false,true);});
  document.querySelector('#album-list').append(button);
}
function selectAlbum(album) {
  generation++; activeIndex=0;busy=false;pending=null;initial=true;
  carouselList=album.photos.map((p,i)=>({title:p.title,desc:`#${p.location}#`,thumbnail:p.preview,small:p.smallPreview||p.preview,href:p.original,serial:String(i+1).padStart(2,'0')}));
  items=[];navItems=[];mediaList.replaceChildren();
  layerFront.querySelector('.media-nav-wrapper').replaceChildren();
  document.querySelectorAll('#album-list button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.album===album.id)));
  document.querySelector('#album-status').textContent=`${album.title} / ${album.photos.length} 张作品`;
  for(const el of [mediaSerial,mediaTitle,mediaDetail]) {el.style.transition='none';el.style.opacity='1';el.style.transform='none';}
  const mainImage=document.createElement('a');mainImage.className='media-img';mainImage.target='_blank';mainImage.rel='noopener';
  mediaMainPic.replaceChildren(mainImage);
for (const [index,item] of carouselList.entries()) {
  const thumb = document.createElement('div');
  thumb.className = 'media-list-item'; thumb.role = 'button';
  thumb.setAttribute('aria-label', `${item.serial} ${item.title}`);
  const picture = document.createElement('div'); picture.className = 'media-list-item-img';
  picture.dataset.title = item.title;
  thumb.append(picture); mediaList.append(thumb); items.push(thumb);
  const nav = document.createElement('div'); nav.className = 'media-nav-item'; nav.role = 'button'; nav.tabIndex = 0;
  nav.setAttribute('aria-label', `切换到 ${item.serial} ${item.title}`);
  layerFront.querySelector('.media-nav-wrapper').append(nav, document.createTextNode('\n  ')); navItems.push(nav);
  for (const element of [thumb,nav]) {
    element.addEventListener('click',()=>navigate(index,index>activeIndex?'left':'right'));
    element.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();element.click();}});
  }
}
const first=carouselList[0];
mediaMainPic.firstElementChild.href=first.href;
mediaMainPic.firstElementChild.style.backgroundImage=`url("${first.thumbnail}")`;
mediaMainPic.firstElementChild.setAttribute('aria-label',`查看原图：${first.title}`);
mediaSerial.textContent=first.serial;mediaTitle.textContent=first.title;mediaDetail.textContent=first.desc;
updateNavigation();setSlidePosition();
}
function updateNavigation() {
  // Show indicators only for the selected place, preserving the original motif.
  const start = Math.max(0,Math.min(activeIndex-8,carouselList.length-18));
  navItems.forEach((nav,i)=>{
    nav.hidden = i < start || i >= start+18;
    nav.setAttribute('active',String(i===activeIndex));
    nav.setAttribute('aria-current',String(i===activeIndex));
  });
}
function setSlidePosition() {
  if (!items.length) return;
  const style = getComputedStyle(items[0]);
  const width = parseFloat(style.width)+parseFloat(style.paddingRight)*2;
  const first = initial ? 0 : (activeIndex-1+items.length)%items.length;
  items.forEach((item,i)=>{
    const offset = (i-first+items.length)%items.length;
    const visible = offset < 4;
    item.style.transform = `translateX(${width*(visible?offset:offset===items.length-1?-1:4)}px)`;
    item.style.opacity = visible?'1':'0';
    item.style.pointerEvents = visible?'auto':'none';
    item.tabIndex = visible?0:-1;
    item.setAttribute('aria-hidden',String(!visible));
    if(visible) item.firstElementChild.style.backgroundImage = `url("${carouselList[i].small}")`;
  });
}
async function navigate(index,direction='left') {
  index = (index+carouselList.length)%carouselList.length;
  if(busy) {pending={index,direction};return;}
  if(index===activeIndex) return;
  const ownGeneration=generation;
  busy=true; activeIndex=index; initial=false;
  updateNavigation();setSlidePosition();
  const item=carouselList[index];
  try {
    if(reduceMotion.matches) {
      mediaMainPic.firstElementChild.style.backgroundImage=`url("${item.thumbnail}")`;
      mediaMainPic.firstElementChild.href=item.href;
      mediaSerial.textContent=item.serial;mediaTitle.textContent=item.title;mediaDetail.textContent=item.desc;
    } else {
      await Promise.all([
        imageZoom(.25,direction,item.thumbnail,item.href,ownGeneration),
        slideInText(mediaSerial,direction,.2,.4,item.serial,ownGeneration),
        slideInText(mediaTitle,direction,.2,.5,item.title,ownGeneration),
        slideInText(mediaDetail,direction,.2,.6,item.desc,ownGeneration)
      ]);
    }
    if(ownGeneration!==generation)return;
    mediaMainPic.firstElementChild.setAttribute('aria-label',`查看原图：${item.title}`);
  } finally {
    if(ownGeneration!==generation)return;
    busy=false;
    if(pending) {const next=pending;pending=null;navigate(next.index,next.direction);}
  }
}
function step(delta) { navigate((pending?.index??activeIndex)+delta,delta>0?'left':'right'); }
const prev = document.querySelector('#arrow-btn-prev'), next = document.querySelector('#arrow-btn-next');
prev.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
for(const button of [prev,next]) button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();button.click();}});
document.addEventListener('keydown',e=>{if(mobile.matches&&!sidebar.hidden)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
let touch;
mediaMainPic.addEventListener('touchstart',e=>{touch=e.changedTouches[0];},{passive:true});
mediaMainPic.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.clientX,dy=e.changedTouches[0].clientY-touch.clientY;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){e.preventDefault();step(dx<0?1:-1);}touch=null;});
window.addEventListener('resize',setSlidePosition);
selectAlbum(albums[0]);
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

/**
 * 文字滑入動畫
 * @param {HTMLElement} element 要套用動畫的HTML元素
 * @param {'left' | 'right'} direction 方向 (1.'left', 2.'right')
 * @param {number} duration 持續時間
 * @param {number} delay 延遲時間
 * @param {string} newText 滑入過後顯示的文字
 */
async function slideInText(element, direction, duration, delay, newText, ownGeneration) {
  let a
  if (direction === 'left') {
    a = -50
  } else if (direction === 'right') {
    a = 50
  }
  element.style.transition = `${duration}s ease-out`

  await sleep(delay * 1000)
  if(ownGeneration!==generation)return
  element.style.opacity = `0`
  element.style.transform = `translateX(${a}%)`
  await sleep(duration * 1000)
  if(ownGeneration!==generation)return
  element.style.transform = `translateX(${-a}%)`
  element.style.opacity = `0`
  await sleep(duration * 1000)
  if(ownGeneration!==generation)return
  element.textContent = newText
  element.style.transform = `translateX(0)`
  element.style.opacity = `1`
  await sleep(delay * 1000)
  if(ownGeneration!==generation)return
}

/**
 * 圖片切換動畫
 * @param {number} duration 持續時間
 * @param {'left' | 'right'} direction 方向 (1.'left', 2.'right')
 * @param {string} newImg 切換後的圖片
 * @param {string} href 圖片跳轉連結
 */
async function imageZoom(duration, direction, newImg, href, ownGeneration) {
  let oldImgTransformOrigin
  let newImgTransformOrigin
  if (direction === 'left') {
    oldImgTransformOrigin = 'left top'
    newImgTransformOrigin = 'right bottom'
  } else if (direction === 'right') {
    oldImgTransformOrigin = 'right bottom'
    newImgTransformOrigin = 'left top'
  }

  mediaMainPic.innerHTML += mediaMainPic.innerHTML
  const mediaOldImg = mediaMainPic.querySelector('.media-img:nth-child(1)')
  const mediaNewImg = mediaMainPic.querySelector('.media-img:nth-child(2)')
  mediaNewImg.href = href
  mediaNewImg.style.backgroundImage = `url(${newImg})`

  mediaOldImg.style.transformOrigin = oldImgTransformOrigin
  mediaOldImg.style.transform = 'scale(1)'
  mediaOldImg.style.transition = `${duration}s`

  mediaNewImg.style.transformOrigin = newImgTransformOrigin
  mediaNewImg.style.transform = 'scale(0)'
  mediaNewImg.style.transition = `${duration}s`

  await sleep(duration * 1000)
  if(ownGeneration!==generation)return
  mediaOldImg.style.transform = 'scale(0)'
  mediaNewImg.style.transform = 'scale(1)'
  await sleep(duration * 1000)
  if(ownGeneration!==generation)return
  mediaMainPic.innerHTML = mediaNewImg.outerHTML
}


})();
