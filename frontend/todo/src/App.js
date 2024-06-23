import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import ParticlesBg from './components/ParticlesBg';

function App() {
  return (
    <Router>
      <div className="App">
        <ParticlesBg />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/todos" element={<TodoList />} /> 
          <Route path="/todos/new" element={<TodoForm />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
