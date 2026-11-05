
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getReminderDashboard, getReminders } from "../api/reminderApi.js";
import ReminderListener from "../components/ReminderListener.js";
import playReminderSound from "../utils/reminderSound";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reminders, setReminders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [upcomingReminder, setUpcomingReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError("");

        const response = await getReminderDashboard();
        const reminderResponse = await getReminders();

        const payload = reminderResponse?.data;

        const reminderList = Array.isArray(payload)
          ? payload
          : payload?.reminders ??
          reminderResponse?.reminders ??
          [];

        setReminders(reminderList);
        const dashboard = response.data;

        setSummary(dashboard?.summary ?? null);
        setUpcomingReminder(dashboard?.upcomingReminder ?? null);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load reminder dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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

        {error && <p role="alert" className="auth-error">{error}</p>}

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
                  <h3>
                    {upcomingReminder.title || "Scheduled Reminder"}
                  </h3>
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
                        {new Date(reminder.scheduledAt).toLocaleString()}
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
