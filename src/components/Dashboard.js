import React, { useState } from "react";
import Timer from "./Timer";
import Todo from "./Todo";
import "./dashboard.css";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("pomodoro"); // Default tab

  const renderContent = () => {
    if (activeTab === "pomodoro") {
      return <Timer />;
    } else if (activeTab === "todo") {
      return <Todo />;
    }
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Focus Dashboard</h1>
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "pomodoro" ? "active" : ""}`}
          onClick={() => setActiveTab("pomodoro")}
        >
          Pomodoro
        </button>
        <button
          className={`tab-button ${activeTab === "todo" ? "active" : ""}`}
          onClick={() => setActiveTab("todo")}
        >
          Todo List
        </button>
      </div>
      <div className="tab-content">{renderContent()}</div>
    </div>
  );
}

export default Dashboard;
