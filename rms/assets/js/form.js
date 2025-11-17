const forms = document.querySelectorAll("form");
forms.forEach((form) => {
  const submitBtns = form.querySelectorAll('button[type="submit"], input[type="submit"]');
  if (submitBtns.length === 0) return;

  const updateState = () => {
    const isValid = form.checkValidity(); // required, pattern 등 HTML5 제약 종합 검사
    submitBtns.forEach((btn) => {
      btn.disabled = !isValid;
      if (isValid) btn.removeAttribute("disabled"); // CSS의 [disabled] 셀렉터 대비
      else btn.setAttribute("disabled", "");
    });
  };

  // 폼 내부 어떤 입력이든 변경되면 상태 갱신 (input + change 모두 커버)
  form.addEventListener("input", updateState, true);
  form.addEventListener("change", updateState, true);

  // 초기 상태 설정 (자동완성/저장값 채워진 케이스까지 커버)
  updateState();
  setTimeout(updateState, 100); // 일부 브라우저 자동완성 지연 대응
});


// 키보드 스크립트 추가
document.addEventListener('keydown', (e) => {
  const active = document.activeElement;

  if (active && active.tagName === 'INPUT' && e.key === 'Enter') {
    const form = active.form;
    if (!form) return;

    if (form.checkValidity()) {
      e.preventDefault();
      form.requestSubmit();
    }
  }
});