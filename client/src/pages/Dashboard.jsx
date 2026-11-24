
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

import {
  getReminderDashboard,
  getReminders,
  getTriggeredReminderHistory,
  updateReminderHistoryStatus,
  snoozeReminderHistory,
} from "../api/reminderApi.js";

import ReminderListener from "../components/ReminderListener.js";
import playReminderSound from "../utils/reminderSound";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reminders, setReminders] = useState([]);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [upcomingReminder, setUpcomingReminder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchDashboard = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);

    try {
      setError("");

      const [
        dashboardResponse,
        reminderResponse,
        historyResponse,
      ] = await Promise.all([
        getReminderDashboard(),
        getReminders(),
        getTriggeredReminderHistory(),
      ]);

      const reminderPayload = reminderResponse?.data;

      const reminderList = Array.isArray(reminderPayload)
        ? reminderPayload
        : reminderPayload?.reminders ?? [];

      setReminders(reminderList);

      const dashboard = dashboardResponse?.data;

      setSummary(dashboard?.summary ?? null);
      setUpcomingReminder(dashboard?.upcomingReminder ?? null);

      const triggeredHistory =
        historyResponse?.data?.history ?? [];

      setHistory(triggeredHistory);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load reminder dashboard."
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(true);

    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleHistoryAction = async (historyId, action) => {
    try {
      setActionLoading(historyId);
      setError("");
      setActionMessage("");

      if (action === "COMPLETED" || action === "DISMISSED") {
        await updateReminderHistoryStatus(historyId, action);

        setActionMessage(
          action === "COMPLETED"
            ? "Reminder completed successfully."
            : "Reminder dismissed successfully."
        );
      } else {
        await snoozeReminderHistory(historyId, action);

        setActionMessage(
          `Reminder snoozed for ${action} minutes.`
        );
      }

      await fetchDashboard(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update reminder."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setError("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const stats = [
    { label: "Total Reminders", value: summary?.totalReminders },
    { label: "Active Reminders", value: summary?.activeReminders },
    { label: "Completed Today", value: summary?.completedToday },
    { label: "Pending Today", value: summary?.pendingToday },
    { label: "Missed Today", value: summary?.missedToday },
    { label: "Snoozed Reminders", value: summary?.snoozedReminders },
  ];

  return (
    <div className="dashboard">
      <header>
        <h1>Reminder Dashboard</h1>

        <button onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </header>

      <main>
        <h2>Welcome, {user?.firstName || "User"}!</h2>
        <p>{user?.email || ""}</p>

        {loading && <p>Loading dashboard...</p>}

        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}

        {actionMessage && (
          <p role="status" className="success-message">
            {actionMessage}
          </p>
        )}

        {!loading && !error && summary && (
          <>
            <h2>Overview</h2>

            <div className="stats-grid">
              {stats.map((stat) => (
                <section className="stat-card" key={stat.label}>
                  <p>{stat.label}</p>
                  <h3>{stat.value ?? 0}</h3>
                </section>
              ))}
            </div>

            <section className="dashboard-section">
              <h2>Completion Rate</h2>
              <p>{summary.completionRate ?? 0}%</p>
            </section>

            <section className="dashboard-section">
              <h2>Upcoming Reminder</h2>

              {upcomingReminder ? (
                <>
                  <h3>{upcomingReminder.title || "Scheduled Reminder"}</h3>
                  <p>
                    Category: {upcomingReminder.category || "N/A"}
                  </p>
                  <p>
                    Scheduled:{" "}
                    {upcomingReminder.scheduledAt
                      ? new Date(
                          upcomingReminder.scheduledAt
                        ).toLocaleString()
                      : "Not available"}
                  </p>
                </>
              ) : (
                <p>No upcoming reminders.</p>
              )}
            </section>
          </>
        )}

        {/* Triggered Reminder Actions */}
        <section className="dashboard-section">
          <h2>Pending Reminder Actions</h2>

          {loading ? (
            <p>Loading triggered reminders...</p>
          ) : history.length === 0 ? (
            <p>No pending triggered reminders.</p>
          ) : (
            <div className="reminder-list">
              {history.map((item) => (
                <article className="reminder-card" key={item._id}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>Category: {item.category}</p>
                    <p>Type: {item.reminderType}</p>
                    <p>Status: {item.status}</p>
                    <p>
                      Triggered:{" "}
                      {item.triggeredAt
                        ? new Date(item.triggeredAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="reminder-actions">
                    <button
                      onClick={() =>
                        handleHistoryAction(item._id, "COMPLETED")
                      }
                      disabled={actionLoading === item._id}
                    >
                      Complete
                    </button>

                    <button
                      onClick={() =>
                        handleHistoryAction(item._id, "DISMISSED")
                      }
                      disabled={actionLoading === item._id}
                    >
                      Dismiss
                    </button>

                    {[5, 10, 15].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() =>
                          handleHistoryAction(item._id, minutes)
                        }
                        disabled={actionLoading === item._id}
                      >
                        {actionLoading === item._id
                          ? "Updating..."
                          : `Snooze ${minutes} min`}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* All Reminders */}
        <section className="dashboard-section">
          <h2>My Reminders</h2>

          {loading ? (
            <p>Loading reminders...</p>
          ) : reminders.length === 0 ? (
            <p>No reminders found. Create your first reminder soon.</p>
          ) : (
            <div className="reminder-list">
              {reminders.map((reminder) => (
                <article className="reminder-card" key={reminder._id}>
                  <div>
                    <h3>{reminder.title}</h3>
                    <p>Category: {reminder.category}</p>
                    <p>Type: {reminder.reminderType}</p>
                    <p>
                      Status: {reminder.isActive ? "Active" : "Paused"}
                    </p>

                    {reminder.scheduledAt && (
                      <p>
                        Scheduled:{" "}
                        {new Date(
                          reminder.scheduledAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <button onClick={playReminderSound}>
          Test Reminder Sound
        </button>
      </main>

      <ReminderListener />
    </div>
  );
};

export default Dashboard;
