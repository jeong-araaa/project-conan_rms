// ------------------------------------------------------
// 1) 검색 영역: 입력 시 삭제 버튼 토글
// ------------------------------------------------------
function initSearchGroup(box) {
  const input = box.querySelector(".search__input");
  const btnDelete = box.querySelector(".search__btn--delete");
  if (!input || !btnDelete) return;

  const updateState = () => {
    const hasVal = input.value.trim().length > 0;
    box.classList.toggle("is-has-value", hasVal);
  };

  input.addEventListener("input", updateState);

  // 삭제 버튼 클릭 시
  btnDelete.addEventListener("click", (e) => {
    e.preventDefault();
    input.value = "";
    updateState();
    input.focus();
  });

  updateState();
  setTimeout(updateState, 100);
}


// ------------------------------------------------------
// 2) 문서 리스트 클릭 시 활성화
// ------------------------------------------------------
function initDocumentList() {
  const docItems = document.querySelectorAll('.document-item__inner');
  if (!docItems.length) return;

  docItems.forEach(item => {
    item.addEventListener('click', () => {
      docItems.forEach(el => el.classList.remove('is-active')); // 하나만 유지
      item.classList.add('is-active');
    });
  });
}


// ------------------------------------------------------
// 3) 우측 미리보기 높이 제어 (좌측 컨텐츠 높이에 맞춤)
// ------------------------------------------------------
/*
function initPreviewHeight() {
  const leftList = document.querySelector('.document-item');
  const previewItem = document.querySelector('.document__preview');
  if (!leftList || !previewItem) return;

  const cssVar = (n) =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n)) || 0;

  const getLeftContentHeight = () => {
    const items = leftList.querySelectorAll('.document-item__inner');
    let sum = 0;
    items.forEach(el => sum += el.offsetHeight);
    const padTop = parseFloat(getComputedStyle(leftList).paddingTop) || 0;
    const padBottom = parseFloat(getComputedStyle(leftList).paddingBottom) || 0;
    return sum + padTop + padBottom;
  };

  const applyPreviewHeight = () => {
    const headerH = cssVar('--header-h') || 0;
    const searchbarH = cssVar('--searchbar-h') || 0;
    const leftHeight = getLeftContentHeight();
    const available = window.innerHeight - headerH - searchbarH;
    const h = Math.max(120, Math.min(leftHeight, available));

    previewItem.style.height = `${h}px`;
    previewItem.style.overflow = (leftHeight > available) ? 'auto' : 'hidden';
  };

  // 이벤트 연결
  ['load', 'resize', 'orientationchange'].forEach(ev =>
    window.addEventListener(ev, applyPreviewHeight, { passive: true })
  );

  if ('ResizeObserver' in window)
    new ResizeObserver(applyPreviewHeight).observe(leftList);

  new MutationObserver(applyPreviewHeight)
    .observe(leftList, { childList: true, subtree: true });

  if (document.fonts) document.fonts.ready.then(applyPreviewHeight);
  applyPreviewHeight();
}
  */


// ------------------------------------------------------
// 4) 좌우 리사이즈 핸들 (PC 전용)
// ------------------------------------------------------
function initDocumentSplitter() {
  if (window.innerWidth <= 1024) return; // 태블릿 이하는 비활성

  const wrap   = document.querySelector('.document__wrap');
  const left   = document.querySelector('.document-item');
  const handle = document.querySelector('.document__resizer');
  const right  = document.querySelector('.document__preview');
  if (!wrap || !left || !handle || !right) return;

  const KEY = 'docSplitLeftWidth';
  const HANDLE_W = parseFloat(getComputedStyle(handle).width) || 6;
  const PREVIEW_MIN = Math.max(
    310,
    parseFloat(getComputedStyle(right).minWidth) || 310
  );

  const px = (n) => `${Math.round(n)}px`;

  // 현재 컨테이너 기준 경계 계산
  const getBounds = () => {
    const wrapW = wrap.getBoundingClientRect().width;
    const leftMin = Math.ceil(wrapW * 0.5);                    // 좌측 최소 50%
    const leftMax = Math.max(leftMin, wrapW - PREVIEW_MIN - HANDLE_W);
    return { leftMin, leftMax };
  };

  // 저장값 복원(있으면 좌측 px로 고정, 없으면 CSS calc 기본 유지)
  (function restore(){
    const saved = parseFloat(localStorage.getItem(KEY));
    if (Number.isNaN(saved)) return;
    const { leftMin, leftMax } = getBounds();
    const clamped = Math.min(Math.max(saved, leftMin), leftMax);
    left.style.flexBasis = px(clamped);
  })();

  let dragging = false;
  let startX = 0, startW = 0, rafId = null;

  const onMove = (clientX) => {
    const dx = clientX - startX;
    const { leftMin, leftMax } = getBounds();
    const next = Math.min(Math.max(startW + dx, leftMin), leftMax);
    left.style.flexBasis = px(next); // 좌측만 px로 갱신 → 우측은 자동으로 남은 영역
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const x = e.clientX;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => onMove(x));
  };

  const stopDrag = () => {
    if (!dragging) return;
    dragging = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', stopDrag);
    const w = parseFloat(getComputedStyle(left).flexBasis);
    if (!Number.isNaN(w)) localStorage.setItem(KEY, String(w));
  };

  handle.addEventListener('pointerdown', (e) => {
    handle.setPointerCapture?.(e.pointerId);
    dragging = true;
    startX = e.clientX;
    const basis = parseFloat(getComputedStyle(left).flexBasis);
    startW = Number.isNaN(basis) ? left.getBoundingClientRect().width : basis;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDrag);
    e.preventDefault();
  });

  // 창 리사이즈 시 현재 값 클램프 (저장값 있는 상태에서만 의미)
  const onResize = () => {
    const saved = localStorage.getItem(KEY);
    if (!saved) return; // 저장값 없으면 CSS calc 기본에 맡김
    const { leftMin, leftMax } = getBounds();
    const cur = parseFloat(getComputedStyle(left).flexBasis) || left.getBoundingClientRect().width;
    const clamped = Math.min(Math.max(cur, leftMin), leftMax);
    left.style.flexBasis = px(clamped);
    localStorage.setItem(KEY, String(clamped));
  };
  window.addEventListener('resize', onResize, { passive: true });

  // 더블클릭 시 초기 상태로 복귀 (CSS calc로 돌아가게)
  handle.addEventListener('dblclick', () => {
    left.style.removeProperty('flex-basis'); // ← calc 기본으로 복귀
    localStorage.removeItem(KEY);
  });
}


// ------------------------------------------------------
// 5) 고급검색
// ------------------------------------------------------
/* 공통 유틸 */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

/* 고급검색 토글*/
function initFilterToggle(){
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.search__btn--filter');
    if (!btn) return;

    const form = btn.closest('form') || document;
    const filterSec = form.querySelector('.search__section--filter');
    const searchBar = document.querySelector('.search__bar');
    const container = document.querySelector('#container');
    if (!filterSec || !searchBar || !container) return;

    const open = !filterSec.classList.contains('is-open');

    // 상태 토글
    filterSec.classList.toggle('is-open', open);
    btn.classList.toggle('is-active', open);
    searchBar.classList.toggle('is-open', open);
    container.classList.toggle('is-expanded', open);

    btn.setAttribute('aria-expanded', open);

    // 오픈 시 자동 스크롤
    if (open) filterSec.scrollIntoView({ behavior:'smooth', block:'nearest' });
  });
}

/* 생성일자 버튼 → 네이티브 date 띄우기*/
function initDateButtons(){
  const fmt = (v) => {
    if (!v) return '연도. 월. 일';
    const [y,m,d] = v.split('-');
    return `${y}. ${String(m).padStart(2,'0')}. ${String(d).padStart(2,'0')}.`;
  };

  const findProxy = (btn) => {
    const id = btn.dataset.target || btn.getAttribute('aria-controls');
    if (id) return document.getElementById(id);
    const next = btn.nextElementSibling;
    return (next && next.matches('input[type="date"]')) ? next : null;
  };

  const placeUnderButton = (btn, inp) => {
    const r = btn.getBoundingClientRect();
    inp.classList.remove('blind');        // 시각적으로 보이게
    // 버튼 바로 아래에, 보이지 않게(투명) 띄워두고 picker만 열기
    Object.assign(inp.style, {
      position: 'absolute',
      left: (r.left + window.scrollX) + 'px',
      top:  (r.bottom + window.scrollY) + 'px',
      width: '1px', height: '1px',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '2147483647'
    });
  };

  const restore = (inp) => {
    inp.removeAttribute('style');
    inp.classList.add('blind');           // 다시 숨김
  };

  document.querySelectorAll('.btn-date').forEach((btn) => {
    const inp = findProxy(btn);
    if (!inp) return;

    // 초기 라벨
    if (inp.value) btn.textContent = fmt(inp.value);

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      placeUnderButton(btn, inp);
      if (inp.showPicker) inp.showPicker(); else inp.click();
    });

    inp.addEventListener('change', () => {
      btn.textContent = fmt(inp.value);
      btn.classList.toggle('has-value', !!inp.value);
      restore(inp);
    });

    inp.addEventListener('blur', () => restore(inp));
  });
}

/* 드롭다운 (열기/닫기/선택 반영) */
function initFormDropdowns(){
  document.addEventListener('click', (e)=>{
    const dd = e.target.closest('.form-dropdown');
    const btn = e.target.closest('.btn-dropdown');

    // 드롭다운 버튼 클릭 시
    if (btn && dd){
      e.preventDefault();

      const open = !dd.classList.contains('is-open');

      // 같은 form 안의 다른 드롭다운은 모두 닫기
      document.querySelectorAll('.form-dropdown.is-open').forEach(x=>{
        if (x !== dd) x.classList.remove('is-open');
      });

      // 현재 클릭한 것만 열기/닫기
      dd.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open);
      return;
    }

    // 🔹 바깥 영역 클릭 시 닫기
    document.querySelectorAll('.form-dropdown.is-open').forEach(x=>{
      if (!x.contains(e.target)) x.classList.remove('is-open');
    });
  });

  document.addEventListener('click', (e)=>{
    const selBtn = e.target.closest('.btn-select');
    if (!selBtn) return;

    const li = selBtn.closest('li');
    const dd = selBtn.closest('.form-dropdown');
    const trigger = $('.btn-dropdown', dd);
    if (!trigger || !dd) return;

    // 버튼 텍스트 반영
    trigger.textContent = selBtn.textContent;
    trigger.classList.add('is-selected');

    // li is-active 부여
    dd.querySelectorAll('li').forEach(el => el.classList.remove('is-active'));
    if (li) li.classList.add('is-active');

    // 닫기
    dd.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  });
}


// ------------------------------------------------------
// 부팅
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".search__group").forEach(initSearchGroup);
  initDocumentList();
  // initPreviewHeight();
  initDocumentSplitter();
  initFilterToggle();
  initDateButtons();
  initFormDropdowns();
});