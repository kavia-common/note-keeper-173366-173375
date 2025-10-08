(() => {
  const NB = window.NoteBridge || {};
  function init() {
    const search = document.getElementById('search');
    const createBtn = document.getElementById('create');

    if (search) {
      search.addEventListener('input', () => {
        const value = search && 'value' in search ? search.value : '';
        if (NB.emit) NB.emit({ type: 'search:changed', value });
      });
    }

    let creating = false;
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        if (creating) return;
        creating = true;
        if (NB.emit) NB.emit({ type: 'nav:open', id: null });
        window.dispatchEvent(new CustomEvent('sidebar:create'));
        setTimeout(() => { creating = false; }, 0);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
