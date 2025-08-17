document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-btn');
  const todoList = document.getElementById('todo-list');

  addBtn.addEventListener('click', () => {
    const task = todoInput.value.trim();
    if (task) {
      const li = document.createElement('li');
      li.textContent = task;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        todoList.removeChild(li);
      });
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
      todoInput.value = '';
    }
  });

  todoInput.addEventListener('keypress', (event) => {
    if(event.key === 'Enter') {
      addBtn.click();
    }
  });
});
