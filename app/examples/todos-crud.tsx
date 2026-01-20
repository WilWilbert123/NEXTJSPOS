'use client';

import { useEffect, useState } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function TodosCRUD() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // READ - Fetch all todos
  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
    setLoading(false);
  };

  // CREATE - Add new todo
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      const newTodo = await res.json();
      setTodos([...todos, newTodo]);
      setNewTitle('');
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  // UPDATE - Toggle completion
  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !completed }),
      });
      const updated = await res.json();
      setTodos(todos.map((t) => (t.id === id ? updated : t)));
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  // DELETE - Remove todo
  const deleteTodo = async (id: number) => {
    try {
      await fetch(`/api/todos?id=${id}`, { method: 'DELETE' });
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>CRUD Todo App</h2>

      {/* CREATE */}
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new todo..."
          style={{ padding: '8px', width: '70%' }}
        />
        <button type="submit" style={{ padding: '8px 16px', marginLeft: '8px' }}>
          Add
        </button>
      </form>

      {/* READ & UPDATE & DELETE */}
      <ul style={{ marginTop: '20px', listStyle: 'none', padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              borderBottom: '1px solid #ddd',
            }}
          >
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
              }}
            >
              {todo.title}
            </span>
            <div>
              {/* UPDATE */}
              <button
                onClick={() => toggleTodo(todo.id, todo.completed)}
                style={{ marginRight: '8px' }}
              >
                {todo.completed ? 'Undo' : 'Done'}
              </button>
              {/* DELETE */}
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{ color: 'red' }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
