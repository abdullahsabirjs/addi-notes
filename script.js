const yearEl = document.getElementById('year');
const searchInput = document.getElementById('searchInput');
const createBtn = document.getElementById('createBtn');
const notesList = document.getElementById('notesList');

const editorOverlay = document.getElementById('editorOverlay');
const formTitleEl = document.getElementById('formTitle');
const closeEditorBtn = document.getElementById('closeEditor');
const titleInput = document.getElementById('titleInput');
const bodyInput = document.getElementById('bodyInput');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const toggleDark = document.getElementById("toggleDark");

let notes = [];         
let editingId = null;    


const nowStr = () => new Date().toLocaleString();
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

function persist() {
  localStorage.setItem('notes-app', JSON.stringify(notes));
}

function load() {
  const raw = localStorage.getItem('notes-app');
  notes = raw ? JSON.parse(raw) : [];
}

function snippet(text, max = 120) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max).trim() + '…' : text;
}


function render(filter = '') {
  const q = filter.trim().toLowerCase();
  notesList.innerHTML = '';

  const filtered = q
    ? notes.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.body  || '').toLowerCase().includes(q)
      )
    : notes;


  filtered
    .slice()
    .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''))
    .forEach(note => {
      const card = document.createElement('article');
      card.className = 'note-card';
      card.dataset.id = note.id;

      const h3 = document.createElement('div');
      h3.className = 'note-title';
      h3.textContent = note.title || '(No title)';

      const meta = document.createElement('div');
      meta.className = 'note-meta';
      const stamp = note.updatedAt && note.updatedAt !== note.createdAt
        ? `Updated ${note.updatedAt}`
        : `Created ${note.createdAt}`;
      meta.textContent = stamp;

      const body = document.createElement('div');
      body.className = 'note-body';
      body.textContent = snippet(note.body, 140);

      const actions = document.createElement('div');
      actions.className = 'card-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'edit';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => openEditor(note));

      const delBtn = document.createElement('button');
      delBtn.className = 'delete';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => deleteNote(note.id));

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      card.appendChild(h3);
      card.appendChild(meta);
      card.appendChild(body);
      card.appendChild(actions);
      notesList.appendChild(card);
    });
}

function openEditor(note = null) {
  if (note) {
    
    editingId = note.id;
    formTitleEl.textContent = 'Edit Note';
    titleInput.value = note.title || '';
    bodyInput.value = note.body || '';
  } else {
 
    editingId = null;
    formTitleEl.textContent = 'Create Note';
    titleInput.value = '';
    bodyInput.value = '';
  }
  editorOverlay.classList.add('open');
  titleInput.focus();
}

function closeEditor() {
  editorOverlay.classList.remove('open');
  editingId = null;
  titleInput.value = '';
  bodyInput.value = '';
}

function saveNote() {
  const title = titleInput.value.trim();
  const body  = bodyInput.value.trim();

  if (!title || !body) {
    alert('Please add both Title and Note body.');
    return;
  }

  if (editingId) {
    
    const idx = notes.findIndex(n => n.id === editingId);
    if (idx !== -1) {
      notes[idx] = {
        ...notes[idx],
        title,
        body,
        updatedAt: nowStr()
      };
    }
  } else {
  
    const note = {
      id: uid(),
      title,
      body,
      createdAt: nowStr(),
      updatedAt: nowStr()
    };
    notes.push(note);
  }

  persist();
  render(searchInput.value);
  closeEditor();
}

function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  notes = notes.filter(n => n.id !== id);
  persist();
  render(searchInput.value);
}


createBtn.addEventListener('click', () => openEditor());
closeEditorBtn.addEventListener('click', closeEditor);
cancelBtn.addEventListener('click', closeEditor);
saveBtn.addEventListener('click', saveNote);


editorOverlay.addEventListener('click', (e) => {
  if (e.target === editorOverlay) closeEditor();
});


document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && editorOverlay.classList.contains('open')) {
    closeEditor();
  }
});

searchInput.addEventListener('input', (e) => {
  render(e.target.value);
});

yearEl.textContent = new Date().getFullYear();
load();
render();

toggleDark.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  
    if (document.body.classList.contains("dark")) {
      toggleDark.textContent = "☀️ Light Mode";
    } else {
      toggleDark.textContent = "🌙 Dark Mode";
    }
  });