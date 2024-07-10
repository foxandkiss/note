document.addEventListener('DOMContentLoaded', () => {
  const notesForm = document.getElementById('notesForm');
  const contentInput = document.getElementById('content');
  const messageContainer = document.getElementById('message-container');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');

  let autosaveTimeout;

  if (notesForm) {
    notesForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (contentInput.value.trim() === '') {
        showMessage('Note content cannot be empty', 'error');
        return;
      }

      const response = await fetch('/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentInput.value }),
      });
      
      if (response.ok) {
        loadNotes();
        contentInput.value = '';
        showMessage('Note created successfully', 'success');
      } else {
        showMessage('Error creating note', 'error');
      }
    });

    searchInput.addEventListener('input', loadNotes);
    sortSelect.addEventListener('change', loadNotes);

    contentInput.addEventListener('input', () => {
      clearTimeout(autosaveTimeout);
      autosaveTimeout = setTimeout(() => {
        autosaveNote();
      }, 10000); // Автозбереження через 2 секунди після останнього вводу
    });

    loadNotes();
  }

  async function autosaveNote() {
    if (contentInput.value.trim() === '') return;

    const response = await fetch('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: contentInput.value }),
    });

    if (response.ok) {
      showMessage('Note autosaved', 'success');
    } else {
      showMessage('Error autosaving note', 'error');
    }
  }

  async function loadNotes() {
    const searchQuery = searchInput.value.toLowerCase();
    const sortOrder = sortSelect.value;
    
    const response = await fetch('/notes');
    const notes = await response.json();

    const filteredNotes = notes.filter(note => 
      note.content.toLowerCase().includes(searchQuery)
    );

    const sortedNotes = filteredNotes.sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';
    sortedNotes.forEach(note => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${note.content} - ${new Date(note.createdAt).toLocaleString()}</span><br>
        <button onclick="deleteNote('${note._id}')"><i class='bx bx-trash'></i></button>
        <button onclick="editNotePrompt('${note._id}', '${note.content}')"><i class='bx bx-edit'></i></button>
      `;
      notesList.appendChild(li);
    });
  }

  async function deleteNote(id) {
    const response = await fetch(`/notes/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      loadNotes();
      showMessage('Note deleted successfully', 'success');
    } else {
      showMessage('Error deleting note', 'error');
    }
  }

  function editNotePrompt(id, content) {
    const newContent = prompt('Edit your note:', content);
    if (newContent !== null) {
      editNote(id, newContent);
    }
  }

  async function editNote(id, content) {
    const response = await fetch(`/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (response.ok) {
      loadNotes();
      showMessage('Note updated successfully', 'success');
    } else {
      showMessage('Error updating note', 'error');
    }
  }

  function showMessage(message, type) {
    const messageBox = document.createElement('div');
    messageBox.className = `message-box ${type}`;
    messageBox.textContent = message;
    messageContainer.appendChild(messageBox);
    setTimeout(() => {
      messageBox.remove();
    }, 5000);
  }

  window.deleteNote = deleteNote;
  window.editNotePrompt = editNotePrompt;
  window.editNote = editNote;
});
