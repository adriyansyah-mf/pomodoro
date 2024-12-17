import React, { useState, useEffect } from "react";
import "./todo.css"; // Include this for consistent styling

const Todo = () => {
    const [tasks, setTasks] = useState(() => {
        const storedTasks = localStorage.getItem("tasks");
        return storedTasks ? JSON.parse(storedTasks) : [];
    });
    const [taskInput, setTaskInput] = useState("");

    // Save tasks to localStorage whenever tasks state changes
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () => {
        if (taskInput.trim() !== "") {
            const newTask = { text: taskInput, completed: false };
            setTasks([...tasks, newTask]);
            setTaskInput("");
        }
    };

    const toggleTaskCompletion = (index) => {
        const updatedTasks = tasks.map((task, i) =>
            i === index ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
    };

    const deleteTask = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    };

    return (
        <div className="glassmorphic-card p-4 text-center h-100">
            <h1>Todo List</h1>
            <div className="todo-input">
                <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Add a new task"
                />
                <button onClick={addTask}>Add</button>
            </div>
            <ul className="todo-list">
                {tasks.map((task, index) => (
                    <li
                        key={index}
                        className={`todo-item ${task.completed ? "completed" : ""}`}
                        onClick={() => toggleTaskCompletion(index)}
                    >
                        {task.text}
                        <button
                            className="delete-button"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent task completion toggle
                                deleteTask(index);
                            }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Todo;
