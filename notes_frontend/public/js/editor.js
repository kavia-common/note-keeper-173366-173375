(() => {
  const NB = window.NoteBridge || {};
  const fetchNote = NB.fetchNote;
  const updateNote = NB.updateNote;
  const deleteNote = NB.deleteNote;
  const createNote = NB.createNote;
  const currentIdFromURL = NB.currentIdFromURL;
  const onURLChange = NB.onURLChange;
  const pushIdToURL = NB.pushIdToURL;
  const toast = NB.toast;
  const registerGlobalShortcuts = NB.registerGlobalShortcuts;

  function init() {
    const root = document.getElementById('editor-root');
    const title = document.getElementById('title');
    const content = document.getElementById('content');
    const status = document.getElementById('status');
    const saveBtn = document.getElementById('save');
    const delBtn = document.getElementById('del');
    const emptyGuard = document.getElementById('empty-guard');
    if (!root || !title || !content || !status || !saveBtn || !delBtn || !emptyGuard) return;

    let currentId = currentIdFromURL ? currentIdFromURL() : null;
    let dirty = false;
    let saveTimer = null;

    function setStatus(text) { status.textContent = text; }
    function showEditor(show) { root.style.opacity = show ? '1' : '0.6'; emptyGuard.hidden = show; }

    function load(id) {
      currentId = id;
      if (!id) {
        title.value = '';
        content.value = '';
        setStatus('No note selected');
        showEditor(false);
        return;
      }
      const n = fetchNote ? fetchNote(id) : null;
      if (!n) {
        setStatus('Note not found');
        showEditor(false);
        return;
      }
      showEditor(true);
      title.value = n.title;
      content.value = n.content;
      setStatus('Saved');
      dirty = false;
      title.focus();
    }

    function doSave() {
      if (!currentId || !updateNote) return;
      try {
        const updated = updateNote(currentId, {
          title: (title.value || 'Untitled').trim(),
          content: content.value,
        });
        if (updated) {
          setStatus('Saved');
          dirty = false;
        }
      } catch {
        toast && toast('Failed to save (storage quota?)', 'error');
        setStatus('Error');
      }
    }

    function scheduleSave() {
      if (!currentId) return;
      setStatus('Saving…');
      dirty = true;
      if (saveTimer) window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => { doSave(); }, 500);
    }

    title.addEventListener('input', scheduleSave);
    content.addEventListener('input', scheduleSave);
    saveBtn.addEventListener('click', () => {
      doSave();
      if (toast) {
        toast('Saved');
      }
    });
    delBtn.addEventListener('click', () => {
      if (!currentId || !deleteNote) return;
      if (confirm('Delete this note?')) {
        if (deleteNote(currentId)) {
          if (toast) {
            toast('Note deleted');
          }
          if (pushIdToURL) {
            pushIdToURL(null);
          }
          load(null);
        }
      }
    });

    window.addEventListener('editor:open', (e) => load(e.detail.id));
    window.addEventListener('editor:create', () => {
      const n = createNote ? createNote({ title: 'Untitled', content: '' }) : null;
      if (!n) return;
      pushIdToURL && pushIdToURL(n.id);
      load(n.id);
      title.focus();
      title.select();
    });
    window.addEventListener('editor:clear', () => load(null));

    const off = onURLChange ? onURLChange(load) : () => {};
    const offKeys = registerGlobalShortcuts
      ? registerGlobalShortcuts(
          () => { if (dirty) { doSave(); toast && toast('Saved'); } },
          () => { pushIdToURL && pushIdToURL(null); load(null); }
        )
      : () => {};

    load(currentId);

    window.addEventListener('unload', () => {
      if (off) off();
      if (offKeys) offKeys();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
