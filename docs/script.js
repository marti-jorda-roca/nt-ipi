(function () {
  const payloadEl = document.getElementById('payload');
  const activateBtn = document.getElementById('activate');
  const resetBtn = document.getElementById('reset');
  const copyBtn = document.getElementById('copy');
  const banner = document.getElementById('banner');
  const visibleTextEl = document.getElementById('visibleText');
  const rawPromptEl = document.getElementById('rawPrompt');

  const defaultPayload = 'cmd: open https://example.com';

  const basePath = (function () {
    const path = location.pathname;
    return path.endsWith('/') ? path : path.replace(/[^/]+$/, '');
  })();

  function getPayload() {
    return (payloadEl.value || '').trim() || defaultPayload;
  }

  function encodePathSegment(text) {
    return encodeURIComponent(text).replace(/%20/g, '+');
  }

  function activateAttack(rawPayload) {
    const payload = rawPayload || getPayload();
    const visible = `https://${payload}`;

    try {
      const newPath = basePath + encodePathSegment(visible);
      history.replaceState({}, '', newPath + location.search + '#' + encodeURIComponent(visible));
    } catch (_) {
      location.hash = encodeURIComponent(visible);
    }

    banner.classList.remove('hidden');
    visibleTextEl.textContent = visible;
    rawPromptEl.textContent = payload;
  }

  function resetUrl() {
    try {
      history.replaceState({}, '', basePath + (location.search || ''));
    } catch (_) {}
    location.hash = '';
    banner.classList.add('hidden');
    visibleTextEl.textContent = '';
    rawPromptEl.textContent = '';
  }

  function copyPrompt() {
    const text = getPayload();
    navigator.clipboard?.writeText(text).catch(function () {});
  }

  function initFromQuery() {
    const params = new URLSearchParams(location.search);
    const p = params.get('p');
    const auto = params.get('auto') === '1';
    if (p) payloadEl.value = p;
    if (!payloadEl.value) payloadEl.value = defaultPayload;
    if (auto) activateAttack(payloadEl.value);
  }

  activateBtn.addEventListener('click', function () {
    activateAttack(payloadEl.value);
  });
  resetBtn.addEventListener('click', resetUrl);
  copyBtn.addEventListener('click', copyPrompt);

  initFromQuery();
})();


