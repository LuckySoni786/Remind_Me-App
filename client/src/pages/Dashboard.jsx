
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ReminderListener from "../components/ReminderListener.js";
import playReminderSound from "../utils/reminderSound";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setError("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Reminder Dashboard</h1>
        <button onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </header>

      <main>
        <h2>
          Welcome, {user?.firstName || "User"}!
        </h2>

        <p>{user?.email || ""}</p>

        {error && <p role="alert">{error}</p>}

        <button onClick={playReminderSound}>
          Test Reminder Sound
        </button>
      </main>

      <ReminderListener />
    </div>
  );
};

export default Dashboard;
