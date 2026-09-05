let DATA = null;
let muscleIndex = {};
let muscleNames = [];

const nav = document.getElementById('nav');
const contentEl = document.getElementById('content');
const placeholderEl = document.getElementById('placeholder');
const searchEl = document.getElementById('search');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const refModal = document.getElementById('ref-modal');

lightbox.addEventListener('click', () => lightbox.classList.remove('show'));
refModal.addEventListener('click', (e) => { if (e.target === refModal) closeRefModal(); });

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
    html += '<div class="muscle-name"><div><span class="muscle-idx">' + (i+1) + '.</span><span class="muscle-kr">' + m.kr + '</span>' + (muscleIndex[m.kr] && muscleIndex[m.kr].sections.length > 1 ? '<span class="ref-link" data-kr="' + m.kr + '">(참고)</span>' : '') + '</div><div class="muscle-en">' + m.en + '</div></div>';
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
  contentEl.querySelectorAll('.ref-link').forEach(el => {
    el.addEventListener('click', () => showMuscleRefModal(el.dataset.kr));
  });
}

function findMuscleImage(kr) {
  for (const s of DATA.sections) {
    for (const m of s.muscles) {
      if (m.kr === kr && m.img) return m.img;
    }
  }
  return null;
}

function showMuscleRefModal(kr) {
  const info = muscleIndex[kr];
  if (!info) return;
  document.getElementById('ref-modal-title').innerHTML = info.kr + '<span class="en">' + info.en + '</span>';

  const img = findMuscleImage(kr);
  const imgWrap = document.getElementById('ref-modal-img-wrap');
  const imgEl = document.getElementById('ref-modal-img');
  if (img) {
    imgEl.src = img;
    imgEl.onclick = () => openLightbox(img);
    imgWrap.style.display = '';
  } else {
    imgWrap.style.display = 'none';
  }

  document.getElementById('ref-modal-hint').textContent = '이 근육이 나타나는 통증 구역 (' + info.sections.length + '곳)';
  let html = '';
  info.sections.forEach(s => {
    html += '<button class="ref-modal-item" data-num="' + s.num + '">' + s.num + '. ' + s.en + '<span class="kr">' + s.kr + '</span></button>';
  });
  document.getElementById('ref-modal-list').innerHTML = html;
  document.querySelectorAll('#ref-modal-list .ref-modal-item').forEach(el => {
    el.addEventListener('click', () => { closeRefModal(); selectSection(el.dataset.num); });
  });
  refModal.classList.add('show');
}
function closeRefModal() {
  refModal.classList.remove('show');
}

function showMuscleIndexDetail(kr) {
  const info = muscleIndex[kr];
  if (!info) return;
  secButtons.forEach(b => b.classList.remove('active'));
  if (window.matchMedia('(max-width: 760px)').matches) closeSidebar();

  let html = '';
  html += '<div class="crumb">근육 색인</div>';
  html += '<h2 class="title">' + info.kr + '<span class="kr">' + info.en + '</span></h2>';
  html += '<div class="map-hint">이 근육이 나타나는 통증 구역 (' + info.sections.length + '곳) &mdash; 클릭하면 이동합니다</div>';
  html += '<div class="muscle-grid">';
  info.sections.forEach(s => {
    html += '<div class="muscle-card idx-ref-card" style="cursor:pointer" data-num="' + s.num + '">';
    html += '<div class="muscle-name"><div><span class="muscle-idx">' + s.num + '.</span><span class="muscle-kr">' + s.en + '</span></div><div class="muscle-en">' + s.kr + '</div></div>';
    html += '</div>';
  });
  html += '</div>';

  contentEl.innerHTML = html;
  contentEl.classList.add('show');
  placeholderEl.style.display = 'none';
  document.getElementById('main').scrollTop = 0;
  contentEl.querySelectorAll('.idx-ref-card').forEach(el => {
    el.addEventListener('click', () => selectSection(el.dataset.num));
  });
}

// ===== MPS 변증 (pain-region checklist -> ranked muscle suspects) =====
const diagSelected = new Set();

function showDiagnosis() {
  secButtons.forEach(b => b.classList.remove('active'));
  if (window.matchMedia('(max-width: 760px)').matches) closeSidebar();

  let html = '';
  html += '<div class="diag-header"><h2 class="title">🩺 MPS 변증</h2></div>';
  html += '<div class="diag-desc">환자가 아프다고 하는 부위를 모두 선택하세요 (여러 군데 선택 가능). 선택한 부위들에 공통으로 관련된 근육을 확률 순으로 보여드립니다.</div>';
  html += '<div class="diag-toolbar"><div class="diag-count">선택된 부위: <span id="diag-count-num">' + diagSelected.size + '</span>개</div>';
  html += '<div class="diag-actions"><button class="diag-btn-ghost" onclick="resetDiagnosis()">초기화</button><button class="diag-btn-primary" id="diag-submit" onclick="runDiagnosis()"' + (diagSelected.size === 0 ? ' disabled' : '') + '>진단 결과 보기</button></div></div>';

  DATA.categories.forEach(c => {
    const secs = DATA.sections.filter(s => s.cat === c.num);
    html += '<div class="diag-cat-group"><div class="diag-cat-title">' + c.num + '. ' + c.kr + '</div><div class="diag-grid">';
    secs.forEach(s => {
      const checked = diagSelected.has(s.num);
      html += '<label class="diag-check-row' + (checked ? ' checked' : '') + '" data-num="' + s.num + '">';
      html += '<input type="checkbox" data-num="' + s.num + '"' + (checked ? ' checked' : '') + '>';
      html += '<span class="label"><span class="en">' + s.en + '</span><span class="kr">' + s.kr + '</span></span>';
      html += '</label>';
    });
    html += '</div></div>';
  });

  contentEl.innerHTML = html;
  contentEl.classList.add('show');
  placeholderEl.style.display = 'none';
  document.getElementById('main').scrollTop = 0;

  contentEl.querySelectorAll('.diag-check-row input').forEach(cb => {
    cb.addEventListener('change', () => {
      const num = cb.dataset.num;
      if (cb.checked) diagSelected.add(num); else diagSelected.delete(num);
      cb.closest('.diag-check-row').classList.toggle('checked', cb.checked);
      document.getElementById('diag-count-num').textContent = diagSelected.size;
      document.getElementById('diag-submit').disabled = diagSelected.size === 0;
    });
  });
}

function resetDiagnosis() {
  diagSelected.clear();
  showDiagnosis();
}

function runDiagnosis() {
  if (diagSelected.size === 0) return;
  const total = diagSelected.size;
  const scores = {};
  diagSelected.forEach(num => {
    const s = DATA.sections.find(x => x.num === num);
    if (!s) return;
    s.muscles.forEach(m => {
      if (!scores[m.kr]) scores[m.kr] = { kr: m.kr, en: m.en, count: 0, sections: [] };
      scores[m.kr].count++;
      scores[m.kr].sections.push({ num: s.num, en: s.en, kr: s.kr });
    });
  });
  const ranked = Object.values(scores).sort((a, b) => b.count - a.count || a.kr.localeCompare(b.kr, 'ko'));

  const byCount = {};
  ranked.forEach(r => { (byCount[r.count] = byCount[r.count] || []).push(r); });
  const counts = Object.keys(byCount).map(Number).sort((a, b) => b - a);
  const medals = ['🥇', '🥈', '🥉'];

  let html = '';
  html += '<div class="diag-header"><h2 class="title">🩺 MPS 변증 &mdash; 결과</h2></div>';
  html += '<div class="diag-results-hint">선택한 통증 부위 ' + total + '곳 기준, 관련도 순으로 정렬했습니다.</div>';
  html += '<div class="diag-toolbar"><div class="diag-count">선택된 부위: <span>' + total + '</span>개</div>';
  html += '<div class="diag-actions"><button class="diag-btn-ghost" onclick="showDiagnosis()">부위 다시 선택</button><button class="diag-btn-ghost" onclick="resetDiagnosis()">초기화</button></div></div>';

  if (ranked.length === 0) {
    html += '<div class="diag-empty">일치하는 근육을 찾지 못했습니다.</div>';
  } else {
    counts.forEach((cnt, i) => {
      const pct = Math.round((cnt / total) * 100);
      const medal = medals[i] || '▪️';
      const tierLabel = cnt === total ? '전체 부위 일치' : cnt + ' / ' + total + '곳 일치';
      html += '<div class="diag-tier"><div class="diag-tier-title"><span class="medal">' + medal + '</span>' + tierLabel + '<span class="pct">' + pct + '%</span></div>';
      html += '<div class="diag-muscle-grid">';
      byCount[cnt].forEach(r => {
        html += '<div class="diag-muscle-card" data-kr="' + r.kr + '">';
        html += '<div class="kr">' + r.kr + '</div><div class="en">' + r.en + '</div>';
        html += '<div class="match">' + r.sections.map(s => s.en).join(', ') + '</div>';
        html += '</div>';
      });
      html += '</div></div>';
    });
  }

  contentEl.innerHTML = html;
  contentEl.classList.add('show');
  placeholderEl.style.display = 'none';
  document.getElementById('main').scrollTop = 0;

  contentEl.querySelectorAll('.diag-muscle-card').forEach(el => {
    el.addEventListener('click', () => showMuscleRefModal(el.dataset.kr));
  });
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

  // build reverse index: muscle kr name -> which sections it appears in
  DATA.sections.forEach(s => {
    s.muscles.forEach(m => {
      if (!muscleIndex[m.kr]) muscleIndex[m.kr] = { kr: m.kr, en: m.en, sections: [] };
      muscleIndex[m.kr].sections.push({ num: s.num, kr: s.kr, en: s.en });
    });
  });
  muscleNames = Object.keys(muscleIndex).sort((a, b) => a.localeCompare(b, 'ko'));

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

  // ===== muscle index block (bottom of sidebar, alphabetical) =====
  const idxBlock = document.createElement('div');
  idxBlock.className = 'cat-block idx-block';

  const idxHeader = document.createElement('button');
  idxHeader.className = 'cat-header';
  idxHeader.innerHTML = '<span>🔤 근육 색인 (가나다순)<span class="cat-count">(' + muscleNames.length + ')</span></span><span class="chev">&#9656;</span>';
  idxHeader.addEventListener('click', () => idxBlock.classList.toggle('open'));
  idxBlock.appendChild(idxHeader);

  const idxListWrap = document.createElement('div');
  idxListWrap.className = 'sec-list';

  const idxSearch = document.createElement('input');
  idxSearch.className = 'idx-search';
  idxSearch.type = 'text';
  idxSearch.placeholder = '근육 이름 검색';
  idxListWrap.appendChild(idxSearch);

  const idxList = document.createElement('div');
  idxList.className = 'idx-list';
  const idxItems = [];
  muscleNames.forEach(kr => {
    const info = muscleIndex[kr];
    const btn = document.createElement('button');
    btn.className = 'idx-item';
    btn.dataset.search = (kr + ' ' + info.en).toLowerCase();
    btn.innerHTML = kr + '<span class="en">' + info.en + '</span>';
    btn.addEventListener('click', () => showMuscleIndexDetail(kr));
    idxList.appendChild(btn);
    idxItems.push(btn);
  });
  idxListWrap.appendChild(idxList);
  idxBlock.appendChild(idxListWrap);
  nav.appendChild(idxBlock);

  idxSearch.addEventListener('click', (e) => e.stopPropagation());
  idxSearch.addEventListener('input', () => {
    const q = idxSearch.value.trim().toLowerCase();
    idxItems.forEach(b => b.classList.toggle('hidden', !!q && !b.dataset.search.includes(q)));
  });
}

fetch('data.json')
  .then(res => res.json())
  .then(init)
  .catch(err => {
    placeholderEl.textContent = '데이터를 불러오지 못했습니다 (data.json 확인 필요): ' + err.message;
  });
