(() => {
  let todos = JSON.parse(localStorage.getItem('todos') || '[]');
  let filter = 'all';

  const newTodoInput = document.getElementById('new-todo');
  const todoList = document.getElementById('todo-list');
  const footer = document.getElementById('footer');
  const countEl = document.getElementById('count');
  const toggleAllBtn = document.getElementById('toggle-all');
  const clearCompletedBtn = document.getElementById('clear-completed');

  function save() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getFiltered() {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function render() {
    const filtered = getFiltered();
    const activeCount = todos.filter(t => !t.completed).length;
    const hasCompleted = todos.some(t => t.completed);
    const allDone = todos.length > 0 && activeCount === 0;

    // Toggle all button state
    toggleAllBtn.classList.toggle('all-done', allDone);

    // Footer visibility
    footer.style.display = todos.length ? 'flex' : 'none';
    countEl.textContent = `${activeCount} 件残り`;
    clearCompletedBtn.style.display = hasCompleted ? 'inline' : 'none';

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    // List
    if (filtered.length === 0) {
      todoList.innerHTML = `<li class="empty-state">${todos.length === 0 ? 'タスクを追加してください' : 'タスクがありません'}</li>`;
      return;
    }

    todoList.innerHTML = filtered.map(todo => `
      <li class="todo-item${todo.completed ? ' completed' : ''}" data-id="${todo.id}">
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} aria-label="完了">
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="delete-btn" aria-label="削除">✕</button>
      </li>
    `).join('');
  }

  // Add todo
  newTodoInput.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const text = newTodoInput.value.trim();
    if (!text) return;
    todos.push({ id: Date.now(), text, completed: false });
    newTodoInput.value = '';
    save();
    render();
  });

  // Toggle / delete via event delegation
  todoList.addEventListener('click', e => {
    const item = e.target.closest('.todo-item');
    if (!item) return;
    const id = Number(item.dataset.id);

    if (e.target.classList.contains('todo-checkbox')) {
      const todo = todos.find(t => t.id === id);
      if (todo) { todo.completed = !todo.completed; save(); render(); }
    }

    if (e.target.classList.contains('delete-btn')) {
      todos = todos.filter(t => t.id !== id);
      save();
      render();
    }
  });

  // Inline edit on double-click
  todoList.addEventListener('dblclick', e => {
    const span = e.target.closest('.todo-text');
    if (!span) return;
    const item = span.closest('.todo-item');
    const id = Number(item.dataset.id);
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const input = document.createElement('input');
    input.className = 'todo-text-input';
    input.value = todo.text;
    span.replaceWith(input);
    input.focus();

    function commit() {
      const newText = input.value.trim();
      if (newText) { todo.text = newText; save(); }
      else { todos = todos.filter(t => t.id !== id); save(); }
      render();
    }

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') render();
    });
    input.addEventListener('blur', commit);
  });

  // Toggle all
  toggleAllBtn.addEventListener('click', () => {
    const allDone = todos.every(t => t.completed);
    todos.forEach(t => { t.completed = !allDone; });
    save();
    render();
  });

  // Clear completed
  clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(t => !t.completed);
    save();
    render();
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      render();
    });
  });

  render();
})();
