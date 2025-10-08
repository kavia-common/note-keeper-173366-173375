(() => {
  const NB = window.NoteBridge || {};
  const fetchNotes = NB.fetchNotes;
  const deleteNote = NB.deleteNote;
  const onNotesChanged = NB.onNotesChanged;
  const currentIdFromURL = NB.currentIdFromURL;
  const subscribe = NB.subscribe;
  const pushIdToURL = NB.pushIdToURL;
  const toast = NB.toast;

  function relativeTime(ts) {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    const delta = Math.round((ts - Date.now()) / 1000);
    const abs = Math.abs(delta);
    const units = [
      ['year', 60*60*24*365],
      ['month', 60*60*24*30],
      ['day', 60*60*24],
      ['hour', 60*60],
      ['minute', 60],
      ['second', 1],
    ];
    for (const [unit, sec] of units) {
      if (abs >= sec || unit === 'second') {
        return rtf.format(Math.round(delta / sec), unit);
      }
    }
    return 'just now';
  }

  function init() {
    const list = document.getElementById('list');
    if (!list) return;

    let filter = '';
    let selectedId = currentIdFromURL ? currentIdFromURL() : null;

    function render() {
      if (!fetchNotes) return;
      const notes = fetchNotes().filter(n => {
        if (!filter) return true;
        const f = filter.toLowerCase();
        return (n.title || '').toLowerCase().includes(f) || (n.content || '').toLowerCase().includes(f);
      });

      list.innerHTML = '';
      if (notes.length === 0) {
        const li = document.createElement('li');
        li.className = 'muted small';
        li.textContent = 'No notes yet.';
        list.appendChild(li);
        return;
      }

      for (const n of notes) {
        const li = document.createElement('li');
        li.className = 'item';
        li.setAttribute('role', 'button');
        li.setAttribute('tabindex', '0');
        li.setAttribute('aria-selected', String(n.id === selectedId));
        li.dataset.id = n.id;

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = n.title || 'Untitled';

        const meta = document.createElement('div');
        meta.className = 'meta';

        const time = document.createElement('span');
        time.className = 'time';
        time.textContent = `Updated ${relativeTime(n.updatedAt)}`;

        const del = document.createElement('button');
        del.className = 'del';
        del.title = 'Delete note';
        del.setAttribute('aria-label', 'Delete note');
        del.textContent = 'Delete';

        del.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!deleteNote) return;
          if (confirm('Delete this note?')) {
            const id = n.id;
            const removed = deleteNote(id);
            if (removed && selectedId === id) {
              selectedId = null;
              pushIdToURL && pushIdToURL(null);
              window.dispatchEvent(new CustomEvent('editor:clear'));
            }
            toast && toast('Note deleted');
            render();
          }
        });

        li.addEventListener('click', () => open(n.id));
        li.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open(n.id);
          }
        });

        meta.append(time, del);
        li.append(title, meta);
        list.appendChild(li);
      }
    }

    function open(id) {
      selectedId = id;
      pushIdToURL && pushIdToURL(id);
      window.dispatchEvent(new CustomEvent('editor:open', { detail: { id }}));
      render();
    }

    if (subscribe) {
      subscribe((e) => {
        if (e.type === 'search:changed') {
          filter = e.value;
          render();
        }
      });
    }

    const un = onNotesChanged ? onNotesChanged(() => render()) : () => {};
    window.addEventListener('sidebar:create', () => {
      window.dispatchEvent(new CustomEvent('editor:create'));
    });
    window.addEventListener('url:changed', (e) => {
      selectedId = (e.detail && e.detail.id) || null;
      render();
    });
    render();
    window.addEventListener('unload', () => un && un());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
