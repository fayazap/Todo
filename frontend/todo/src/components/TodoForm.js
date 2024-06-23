import React, { useState } from 'react';
import '../styles/TodoForm.css';

const TodoForm = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const handleAddTodo = async () => {

    if (deadline) {
      const deadlineDate = new Date(deadline);
      const currentDate = new Date();
      if (deadlineDate < currentDate) {
        setError('Deadline cannot be in the past');
        return;
      }
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, deadline }),
      });

      const data = await response.json();

      if (response.ok) {
        onAddTodo(data.todo);
        setTitle('');
        setDescription('');
        setDeadline(''); 
      } else {
        setError('Failed to add todo');
      }
    } catch (error) {
      console.error('Add todo error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='todo-form-wrapper'>
      <div className="todo-input-container">
        <input
          className='todo-input'
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className='todo-input'
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className='todo-input'
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <button className='todo-button' onClick={handleAddTodo}>Add Todo</button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default TodoForm;
