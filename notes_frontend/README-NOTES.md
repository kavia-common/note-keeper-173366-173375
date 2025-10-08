Note Keeper (Astro)

- Dev: npm run dev (listens on port 3000 per astro.config.mjs)
- Build: npm run build; Preview: npm run preview

UI
- Top NavBar with search and New Note
- Sidebar listing notes with relative update time
- Main NoteEditor with debounced autosave

Data
- LocalStorage-backed (src/lib/storage.ts) with an in-memory cache and multi-tab sync.
- Public API: fetchNotes, fetchNote, createNote, updateNote, deleteNote, onNotesChanged

Routing
- Uses query param ?id=<noteId> to open a note, updates history via pushState
