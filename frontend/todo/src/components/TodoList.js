import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/TodoList.css";
import TodoForm from "./TodoForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-solid-svg-icons";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [error, setError] = useState("");
  const [viewCompleted, setViewCompleted] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("http://localhost:5000/todos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setTodos(data.todos);

          if (viewCompleted) {
            const completed = data.todos.filter((todo) => todo.completed);
            setCompletedTodos(completed);
          }
        } else {
          setError("Failed to fetch todos");
        }
      } catch (error) {
        console.error("Fetch todos error:", error);
        setError("An error occurred. Please try again later.");
      }
    };

    fetchTodos();
  }, [viewCompleted]);

  const handleCompleteTodo = async (todoId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:5000/todos/${todoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: true }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedTodos = todos.map((todo) =>
          todo.id === todoId ? { ...todo, completed: true } : todo
        );
        setTodos(updatedTodos);

        const updatedPendingTodos = todos.filter((todo) => todo.id !== todoId);
        setTodos(updatedPendingTodos);

        if (viewCompleted) {
          setCompletedTodos([...completedTodos, data.todo]);
        }
      } else {
        setError("Failed to mark todo as completed");
      }
    } catch (error) {
      console.error("Complete todo error:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:5000/todos/${todoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedTodos = todos.filter((todo) => todo.id !== todoId);
        setTodos(updatedTodos);
      } else {
        setError("Failed to delete todo");
      }
    } catch (error) {
      console.error("Delete todo error:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  const fetchCompletedTodos = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:5000/completed-todos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCompletedTodos(data.completed_todos);
      } else {
        setError("Failed to fetch completed todos");
      }
    } catch (error) {
      console.error("Fetch completed todos error:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    if (viewCompleted) {
      fetchCompletedTodos();
    }
  }, [viewCompleted]);

  const toggleView = (option) => {
    if (option === "pending") {
      setViewCompleted(false);
    } else if (option === "completed") {
      setViewCompleted(true);
    }
  };

  const handleAddTodo = (newTodo) => {
    setTodos([...todos, newTodo]);
  };

  return (
    <div className="todo-list-wrapper">
      <img src="/Images/logo.png" alt="Logo" className="Home-logo" />
      <h1>Todo List</h1>

      <TodoForm onAddTodo={handleAddTodo} />
      <div className="options">
        <button
          className={viewCompleted ? "" : "active"}
          onClick={() => toggleView("pending")}
        >
          Pending
        </button>
        <button
          className={viewCompleted ? "active" : ""}
          onClick={() => toggleView("completed")}
        >
          Completed
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {!viewCompleted ? (
        <div className="todo-items">
          {todos
            .filter((todo) => !todo.completed)
            .map((todo) => (
              <div key={todo.id} className="todo-item">
                <h3 className="todo-title">{todo.title}</h3>
                <div className="todo-contents">
                  <div className="todo-texts">
                    <p>{todo.description}</p>
                  </div>
                  <div className="todo-deadline">
                    {todo.deadline && (
                      <div>
                        <p>
                          <div>
                            <FontAwesomeIcon className="clock" icon={faClock} />
                          </div>
                          {new Date(todo.deadline).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p>{new Date(todo.deadline).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="button-container">
                  {!todo.completed && (
                    <button onClick={() => handleCompleteTodo(todo.id)}>
                      <FontAwesomeIcon className="icons" icon={faSquareCheck} />
                    </button>
                  )}
                  <button onClick={() => handleDeleteTodo(todo.id)}>
                    <FontAwesomeIcon className="icons" icon={faTrashCan} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="completed-todos">
          {completedTodos.map((todo) => (
            <div key={todo.id} className="completed-todo-item">
              <h3 className="todo-title">{todo.title}</h3>
              <div className="todo-contents">
                <div className="todo-texts">
                  <p>{todo.description}</p>
                </div>
                <div className="todo-deadline">
                  {todo.deadline && (
                    <div>
                      <p>
                        <div>
                          <FontAwesomeIcon className="clock" icon={faClock} />
                        </div>
                        {new Date(todo.deadline).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p>{new Date(todo.deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
