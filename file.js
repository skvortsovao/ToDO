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
  async function toggleCompleteStatus(id, todoElement) {
    const token = getAuthToken();
    if (!token) {
      alert('Please log in first.');
      return;
    }
  
    const isCompleted = todoElement.style.backgroundColor === 'green';
  
    const response = await fetch(`${apiUrl}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: !isCompleted }),  
    });
  
    if (response.ok) {
      const todo = await response.json(); 
      if (todo.completed) {
        todoElement.style.backgroundColor = 'green';  
        todoElement.querySelector('span').style.textDecoration = 'line-through'; 
      } else {
        todoElement.style.backgroundColor = '';  
        todoElement.querySelector('span').style.textDecoration = '';  
      }
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to toggle completion status');
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
        const descElement = document.createElement('p');
        
        titleElement.textContent = todo.title;
        descElement.textContent = todo.description;
  
        if (todo.completed) {
          titleElement.style.textDecoration = 'line-through';
          todoElement.style.backgroundColor = 'green';
        }
  
        todoElement.addEventListener('click', () => toggleComplete(titleElement, todo.id, todo.completed));
  
        todoElement.appendChild(titleElement);
        todoElement.appendChild(descElement);
  
        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('button-wrapper');
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editTodo(todo.id, todo.title, todo.description);
  
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();  
          deleteTodo(todo.id);
        };
  
        const completeBtn = document.createElement('button');
completeBtn.classList.add('complete-btn');
completeBtn.innerHTML = '<i class="fa fa-check"></i>'; 
completeBtn.onclick = (e) => {
  e.stopPropagation();  
  toggleCompleteStatus(todo.id, todoElement); 
};
  
        buttonWrapper.appendChild(completeBtn);
        buttonWrapper.appendChild(editBtn);
        buttonWrapper.appendChild(deleteBtn);
  
        todoElement.appendChild(buttonWrapper);
  
        todoItems.appendChild(todoElement);
      });
    }
  }
let currentEditId = null; 

function openEditModal(id, title, description) {
  currentEditId = id;
  document.getElementById("editTitle").value = title;
  document.getElementById("editDescription").value = description;
  document.getElementById("editModal").style.display = "flex"; 
}

function editTodo(id, currentTitle, currentDescription) {
  const newTitle = prompt('Edit Title:', currentTitle);
  const newDescription = prompt('Edit Description:', currentDescription);

  if (newTitle !== null && newDescription !== null) {
      updateTodo(id, newTitle, newDescription);
  }
}

async function updateTodo(id, title, description) {
  const token = getAuthToken();
  if (!token) {
      alert('Please log in first.');
      return;
  }

  const response = await fetch(`${apiUrl}/todos/${id}`, {
      method: 'PUT',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
  });

  if (response.ok) {
      fetchTodos();  
  } else {
      const data = await response.json();
      alert(data.error || 'Failed to update to-do');
  }
}
async function createTodo() {
  const token = getAuthToken();  
  const title = document.getElementById('todoTitle').value.trim();
  const description = document.getElementById('todoDescription').value.trim();

  if (!token) {
    alert('You must be logged in to create a to-do');
    return;
  }

  if (!title || !description) {
    alert('Please enter both a title and a description for the to-do');
    return;
  }

  const response = await fetch(`${apiUrl}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description }),  
  });

  const data = await response.json();

  if (response.ok) {
    fetchTodos(); 
    document.getElementById('todoTitle').value = '';
    document.getElementById('todoDescription').value = '';
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

  
