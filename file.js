const apiUrl = 'http://localhost:3000'; 
function toggleForms() {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
  loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
}
document.getElementById('register').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;

  const response = await fetch(`${apiUrl}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    alert('Registration successful');
    toggleForms(); 
  } else {
    alert(data.error || 'Registration failed');
  }
});
document.getElementById('login').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch(`${apiUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    document.cookie = `authToken=${data.token};path=/`; 
    alert('Login successful');
    window.location.href = "dashboard.html";
  } else {
    alert(data.error || 'Login failed');
  }
});
function getAuthToken() {
  const match = document.cookie.match(/(^| )authToken=([^;]+)/);
  return match ? match[2] : null;
}

async function fetchTodos() {
    const token = getAuthToken();  
    if (!token) {
      return;  
    }
  
    const response = await fetch(`${apiUrl}/todos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    const data = await response.json();
  
    if (response.ok) {
      displayTodos(data); 
    } else {
      alert(data.error || 'Failed to fetch to-dos');
    }
  }
  async function toggleComplete(todoElement, todoId, currentStatus) {
    const token = getAuthToken();  

    if (!token) {
      alert('Please log in first.');
      return;
    }

    const newStatus = !currentStatus; 

    const response = await fetch(`${apiUrl}/todos/${todoId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: newStatus }),  
    });

    const data = await response.json();

    if (response.ok) {
       
        todoElement.style.textDecoration = data.completed ? 'line-through' : 'none';
    } else {
        alert(data.error || 'Failed to update to-do status');
    }
}
  
function displayTodos(todos) {
  const todoItems = document.getElementById('todoItems');
  todoItems.innerHTML = '';  

  if (todos.length === 0) {
      todoItems.innerHTML = '<li>No to-dos available. Start by adding one!</li>';
  } else {
      todos.forEach(todo => {
          const todoElement = document.createElement('li');
          const titleElement = document.createElement('span');
          titleElement.textContent = todo.title;
          if (todo.completed) {
              titleElement.style.textDecoration = 'line-through';
          }
          todoElement.addEventListener('click', () => toggleComplete(titleElement, todo.id, todo.completed));
          todoElement.appendChild(titleElement);
          const deleteBtn = document.createElement('button');
          deleteBtn.classList.add('delete-btn');
          deleteBtn.textContent = 'Delete';
          deleteBtn.onclick = (e) => {
              e.stopPropagation();  
              deleteTodo(todo.id);
          };
          todoElement.appendChild(deleteBtn);
          todoItems.appendChild(todoElement);
      });
  }
}
  
  async function createTodo() {
    const token = getAuthToken();  
    const title = document.getElementById('todoTitle').value.trim();
  
    if (!token) {
      alert('You must be logged in to create a to-do');
      return;
    }
  
    if (!title) {
      alert('Please enter a title for the to-do');
      return;
    }
  
    const response = await fetch(`${apiUrl}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description: '' }), 
    });
  
    const data = await response.json();
  
    if (response.ok) {
      fetchTodos(); 
      document.getElementById('todoTitle').value = '';
    } else {
      alert(data.error || 'Failed to create to-do');
    }
  }
  async function deleteTodo(id) {
    const token = getAuthToken(); 
    if (!token) {
      alert('Please log in first.');
      return;
    }
  
    const response = await fetch(`${apiUrl}/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    if (response.ok) {
      fetchTodos(); 
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to delete to-do');
    }
  }

  