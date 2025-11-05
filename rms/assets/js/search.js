document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".search__group").forEach(initSearchGroup);
});
function initSearchGroup(box) {
  const input = box.querySelector(".search__input");
  const btnDelete = box.querySelector(".search__btn--delete");
  if (!input || !btnDelete) return;

  const updateState = () => {
    const hasVal = input.value.trim().length > 0;
    box.classList.toggle("is-has-value", hasVal);
  };

  // 값 변화만 감지해서 토글
  input.addEventListener("input", updateState);

  // 삭제 버튼: 값 비우고 포커스 유지
  btnDelete.addEventListener("click", (e) => {
    e.preventDefault();
    input.value = "";
    updateState();
    input.focus();
  });

  // 초기 상태 (자동완성/저장값 대응)
  updateState();
  setTimeout(updateState, 100);
}

// 문서리스트 클릭 시 활성화
const docItems = document.querySelectorAll('.document-item__inner');
docItems.forEach(item => {
  item.addEventListener('click', () => {
    // 다른 아이템에 붙은 is-active 제거 (하나만 유지하려면 이 부분 유지)
    docItems.forEach(el => el.classList.remove('is-active'));

    // 클릭한 요소에 토글 (다중 선택 허용하려면 아래 한 줄만 사용)
    item.classList.toggle('is-active');
  });
});


// textarea 자동 높이 조절
document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.querySelector(".resize");
  if (!textarea) return;

  // 초기 높이 저장 (padding 등 포함 X)
  const baseHeight = textarea.scrollHeight;

  const resizeTextarea = () => {
    textarea.style.height = `${textarea.scrollHeight}px`; // 실제 내용 높이에 맞게 조정
  };

  // 입력 중일 때마다 실행
  textarea.addEventListener("input", resizeTextarea);

  // 페이지 로드 시 기본값 기준으로 1회 실행
  resizeTextarea();
});



// 뷰어 높이 제어
(function(){
  const leftList    = document.querySelector('.document-item'); // 왼쪽 컨테이너
  const previewItem = document.querySelector('.document__preview'); // 오른쪽 높이 대상
  if (!leftList || !previewItem) return;

  const cssVar = (n) =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n)) || 0;

  function getLeftContentHeight(){
    // .document-item__inner 들의 실제 렌더된 높이를 합산
    const items = leftList.querySelectorAll('.document-item__inner');
    let sum = 0;
    items.forEach(el => { sum += el.offsetHeight; });
    // 컨테이너의 위쪽 패딩이 있으면 보정 (지금은 16px)
    const padTop = parseFloat(getComputedStyle(leftList).paddingTop) || 0;
    const padBottom = parseFloat(getComputedStyle(leftList).paddingBottom) || 0;
    return sum + padTop + padBottom;
  }

  function applyPreviewHeight(){
    const headerH    = cssVar('--header-h'); // 예: 80
    const searchbarH = cssVar('--searchbar-h'); // 예: 136

    // 1) 왼쪽 실제 콘텐츠 높이
    const leftHeight = getLeftContentHeight();

    // 2) 화면 가용 높이 (헤더~검색바 사이)
    const available = window.innerHeight - headerH - searchbarH;

    // 3) 적용 높이: 둘 중 작은 값(최소 120)
    const h = Math.max(120, Math.min(leftHeight, available));

    previewItem.style.height = h + 'px';
    previewItem.style.overflow = (leftHeight > available) ? 'auto' : 'hidden';
  }

  // 초기 & 환경 변화 반응
  ['load','resize','orientationchange','scroll'].forEach(ev =>
    window.addEventListener(ev, applyPreviewHeight, {passive:true})
  );

  // 좌측 DOM 변화(아이템 개수 변화)에 반응
  new MutationObserver(applyPreviewHeight)
    .observe(leftList, {childList:true, subtree:true});

  // 좌측 자체 크기 변화도 반응
  if ('ResizeObserver' in window){
    new ResizeObserver(applyPreviewHeight).observe(leftList);
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(applyPreviewHeight);
  applyPreviewHeight();
})();