let DATA = null;

const nav = document.getElementById('nav');
const contentEl = document.getElementById('content');
const placeholderEl = document.getElementById('placeholder');
const searchEl = document.getElementById('search');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

lightbox.addEventListener('click', () => lightbox.classList.remove('show'));

const catMap = {};
const catBlocks = {};
const secButtons = [];

const sidebarEl = document.getElementById('sidebar');
const overlayEl = document.getElementById('sidebar-overlay');
const menuToggle = document.getElementById('menu-toggle');

function openSidebar() {
  sidebarEl.classList.add('open');
  overlayEl.classList.add('show');
}
function closeSidebar() {
  sidebarEl.classList.remove('open');
  overlayEl.classList.remove('show');
}
menuToggle.addEventListener('click', () => {
  sidebarEl.classList.contains('open') ? closeSidebar() : openSidebar();
});
overlayEl.addEventListener('click', closeSidebar);

function selectSection(num) {
  const s = DATA.sections.find(x => x.num === num);
  if (!s) return;
  secButtons.forEach(b => b.classList.toggle('active', b.dataset.num === num));
  // make sure its category is open
  catBlocks[s.cat].block.classList.add('open');
  if (window.matchMedia('(max-width: 760px)').matches) closeSidebar();

  const cat = catMap[s.cat];
  let html = '';
  html += '<div class="crumb">' + cat.num + '. ' + cat.kr + '</div>';
  html += '<h2 class="title">' + s.en + '<span class="kr">' + s.kr + '</span></h2>';

  html += '<div class="muscle-grid">';
  s.muscles.forEach((m, i) => {
    html += '<div class="muscle-card">';
    html += '<div class="muscle-name"><div><span class="muscle-idx">' + (i+1) + '.</span><span class="muscle-kr">' + m.kr + '</span></div><div class="muscle-en">' + m.en + '</div></div>';
    if (m.img) {
      html += '<div class="slot"><img src="' + m.img + '" alt="' + m.kr + '" loading="lazy" onclick="openLightbox(this.src)"></div>';
    } else {
      html += '<div class="slot empty"><span class="slot-empty-label">이미지 추가 예정</span></div>';
    }
    html += '</div>';
  });
  html += '</div>';

  contentEl.innerHTML = html;
  contentEl.classList.add('show');
  placeholderEl.style.display = 'none';
  document.getElementById('main').scrollTop = 0;
}

function showMap(catNum) {
  const hm = (DATA.maps || []).find(x => x.catNum === catNum);
  if (!hm) return;
  secButtons.forEach(b => b.classList.remove('active'));
  if (window.matchMedia('(max-width: 760px)').matches) closeSidebar();

  const cat = catMap[catNum];
  let html = '';
  html += '<div class="crumb">' + cat.num + '. ' + cat.kr + '</div>';
  html += '<h2 class="title">' + cat.kr + ' 지도<span class="kr">부위를 클릭하면 근육 설명으로 이동합니다</span></h2>';
  html += '<div class="map-hint">그림 위 원하는 통증 부위를 눌러보세요</div>';
  html += '<div id="head-map-wrap"><svg viewBox="0 0 ' + hm.width + ' ' + hm.height + '" xmlns="http://www.w3.org/2000/svg">';
  html += '<image href="' + hm.img + '" x="0" y="0" width="' + hm.width + '" height="' + hm.height + '"></image>';
  Object.keys(hm.regions).forEach(num => {
    const s = DATA.sections.find(x => x.num === num);
    const label = s ? (s.kr + ' (' + s.en + ')') : num;
    hm.regions[num].forEach(polyPts => {
      const pts = polyPts.map(p => p[0] + ',' + p[1]).join(' ');
      html += '<polygon points="' + pts + '" data-num="' + num + '"><title>' + label + '</title></polygon>';
    });
  });
  html += '</svg></div>';

  contentEl.innerHTML = html;
  contentEl.classList.add('show');
  placeholderEl.style.display = 'none';
  document.getElementById('main').scrollTop = 0;

  contentEl.querySelectorAll('#head-map-wrap polygon').forEach(poly => {
    poly.addEventListener('click', () => selectSection(poly.dataset.num));
  });
}

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('show');
}

searchEl.addEventListener('input', () => {
  const q = searchEl.value.trim().toLowerCase();
  const hasQuery = !!q;
  secButtons.forEach(b => {
    const match = !q || b.dataset.search.includes(q);
    b.classList.toggle('hidden', !match);
  });
  Object.values(catBlocks).forEach(({block, list}) => {
    const anyVisible = Array.from(list.querySelectorAll('.sec-item')).some(b => !b.classList.contains('hidden'));
    block.style.display = anyVisible ? '' : 'none';
    if (hasQuery && anyVisible) {
      block.classList.add('open');
    }
  });
});

function init(data) {
  DATA = data;

  DATA.categories.forEach(c => catMap[c.num] = c);

  DATA.categories.forEach(c => {
    const count = DATA.sections.filter(s => s.cat === c.num).length;

    const block = document.createElement('div');
    block.className = 'cat-block';
    block.dataset.cat = c.num;

    const header = document.createElement('button');
    header.className = 'cat-header';
    header.innerHTML = '<span>' + c.num + '. ' + c.kr + '<span class="cat-count">(' + count + ')</span></span><span class="chev">&#9656;</span>';
    header.addEventListener('click', () => {
      block.classList.toggle('open');
    });
    block.appendChild(header);

    const list = document.createElement('div');
    list.className = 'sec-list';

    if (DATA.maps) {
      const m = DATA.maps.find(x => x.catNum === c.num);
      if (m) {
        const mapBtn = document.createElement('button');
        mapBtn.className = 'map-btn';
        mapBtn.textContent = '🗺️ 그림에서 부위 선택';
        mapBtn.addEventListener('click', (e) => { e.stopPropagation(); showMap(c.num); });
        list.appendChild(mapBtn);
      }
    }

    block.appendChild(list);

    nav.appendChild(block);
    catBlocks[c.num] = { block, list };
  });

  DATA.sections.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'sec-item';
    btn.dataset.num = s.num;
    btn.dataset.cat = s.cat;
    btn.dataset.search = (s.en + ' ' + s.kr + ' ' + s.muscles.map(m => m.en + ' ' + m.kr).join(' ')).toLowerCase();
    btn.innerHTML = '<span class="en">' + s.num + '. ' + s.en + '</span><span class="kr">' + s.kr + '</span>';
    btn.addEventListener('click', () => selectSection(s.num));
    catBlocks[s.cat].list.appendChild(btn);
    secButtons.push(btn);
  });
}

fetch('data.json')
  .then(res => res.json())
  .then(init)
  .catch(err => {
    placeholderEl.textContent = '데이터를 불러오지 못했습니다 (data.json 확인 필요): ' + err.message;
  });
