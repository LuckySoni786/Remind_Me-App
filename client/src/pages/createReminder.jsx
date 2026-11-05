
import { useState, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import { createReminder } from "../api/reminderApi.js";
import { getMedicines } from "../api/medicineApi.js";

const CreateReminder = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "MEDICINE",
    medicine: "",
    reminderType: "ONE_TIME",
    scheduledAt: "",
    notificationType: "BROWSER",
    description: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [medicines, setMedicines] = useState([]);
const [loadingMedicines, setLoadingMedicines] = useState(false);

useEffect(() => {
  const loadMedicines = async () => {
    setLoadingMedicines(true);

    try {
      const response = await getMedicines();
      setMedicines(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load medicines.");
    } finally {
      setLoadingMedicines(false);
    }
  };

  loadMedicines();
}, []);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const reminderData = {
        ...form,
        scheduledAt: form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : undefined,
      };

      await createReminder(reminderData);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create Reminder</h1>
        <p>Set up your next reminder.</p>

        <label htmlFor="title">Reminder Title</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Morning Medicine"
          required
        />
        <label htmlFor="medicine">Select Medicine</label>
<select
  id="medicine"
  name="medicine"
  value={form.medicine}
  onChange={handleChange}
  required={form.category === "MEDICINE"}
  disabled={loadingMedicines || form.category !== "MEDICINE"}
>
  <option value="">
    {loadingMedicines ? "Loading medicines..." : "Select a medicine"}
  </option>

  {medicines.map((medicine) => (
    <option key={medicine._id} value={medicine._id}>
{medicine.medicineName} - {medicine.dosage} ({medicine.type})
    </option>
  ))}
</select>

        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option value="MEDICINE">Medicine</option>
          <option value="EXERCISE">Exercise</option>
          <option value="MEAL">Meal</option>
          <option value="WATER">Water</option>
          <option value="APPOINTMENT">Appointment</option>
          <option value="CUSTOM">Custom</option>
        </select>

        <label htmlFor="reminderType">Reminder Type</label>
        <select
          id="reminderType"
          name="reminderType"
          value={form.reminderType}
          onChange={handleChange}
        >
          <option value="ONE_TIME">One Time</option>
          <option value="DAILY">Daily</option>
          <option value="HOURLY">Hourly</option>
          <option value="WEEKLY">Weekly</option>
          <option value="CUSTOM">Custom</option>
        </select>

        <label htmlFor="scheduledAt">Date and Time</label>
        <input
          id="scheduledAt"
          name="scheduledAt"
          type="datetime-local"
          value={form.scheduledAt}
          onChange={handleChange}
          required={form.reminderType === "ONE_TIME"}
        />

        <label htmlFor="notificationType">Notification Type</label>
        <select
          id="notificationType"
          name="notificationType"
          value={form.notificationType}
          onChange={handleChange}
        >
          <option value="BROWSER">Browser</option>
          <option value="EMAIL">Email</option>
          <option value="BOTH">Browser and Email</option>
        </select>

        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Add any notes..."
          rows={3}
        />

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create Reminder"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateReminder;
