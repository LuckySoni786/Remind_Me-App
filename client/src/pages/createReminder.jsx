
import { useState, useEffect } from "react";
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
    time: "",
    daysOfWeek: [],

    intervalMinutes: "",
    customInterval: "",
    customIntervalUnit: "MINUTES",

    startTime: "",
    endTime: "",

    startDate: "",
    endDate: "",

    notificationType: "BROWSER",
    description: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [medicines, setMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const weekDays = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  // Load medicines
  useEffect(() => {
    const loadMedicines = async () => {
      setLoadingMedicines(true);

      try {
        const response = await getMedicines();
        setMedicines(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load medicines."
        );
      } finally {
        setLoadingMedicines(false);
      }
    };

    loadMedicines();
  }, []);

  // Handle normal inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle weekly days
  const handleDayChange = (day) => {
    setForm((previous) => {
      const selectedDays = previous.daysOfWeek.includes(day)
        ? previous.daysOfWeek.filter((item) => item !== day)
        : [...previous.daysOfWeek, day];

      return {
        ...previous,
        daysOfWeek: selectedDays,
      };
    });
  };

  // Convert date input to ISO
  const convertDate = (date) => {
    return date
      ? new Date(`${date}T00:00:00`).toISOString()
      : undefined;
  };

  // Submit reminder
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      form.category === "MEDICINE" &&
      !form.medicine
    ) {
      setError("Please select a medicine.");
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      form.startDate > form.endDate
    ) {
      setError("Start date cannot be after end date.");
      return;
    }

    if (
      ["HOURLY", "CUSTOM"].includes(form.reminderType) &&
      (!form.startTime || !form.endTime)
    ) {
      setError("Start time and end time are required.");
      return;
    }

    if (
      ["HOURLY", "CUSTOM"].includes(form.reminderType) &&
      form.startTime >= form.endTime
    ) {
      setError("Start time must be before end time.");
      return;
    }

    if (
      form.reminderType === "WEEKLY" &&
      form.daysOfWeek.length === 0
    ) {
      setError("Please select at least one day.");
      return;
    }

    setSaving(true);

    try {
      // Common fields
      const reminderData = {
        title: form.title.trim(),
        category: form.category,
        reminderType: form.reminderType,

        medicine:
          form.category === "MEDICINE"
            ? form.medicine
            : undefined,

        notificationType: form.notificationType,
        timezone: form.timezone,
        description: form.description.trim(),

        startDate: convertDate(form.startDate),
        endDate: convertDate(form.endDate),
      };

      // ONE TIME
      if (form.reminderType === "ONE_TIME") {
        reminderData.scheduledAt = form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : undefined;
      }

      // DAILY
      if (form.reminderType === "DAILY") {
        reminderData.time = form.time;
      }

      // WEEKLY
      if (form.reminderType === "WEEKLY") {
        reminderData.time = form.time;
        reminderData.daysOfWeek = form.daysOfWeek;
      }

      // HOURLY
      if (form.reminderType === "HOURLY") {
        reminderData.intervalMinutes = Number(
          form.intervalMinutes
        );

        reminderData.startTime = form.startTime;
        reminderData.endTime = form.endTime;
      }

      // CUSTOM
      if (form.reminderType === "CUSTOM") {
        reminderData.customInterval = Number(
          form.customInterval
        );

        reminderData.customIntervalUnit =
          form.customIntervalUnit;

        reminderData.startTime = form.startTime;
        reminderData.endTime = form.endTime;
      }

      await createReminder(reminderData);

      navigate("/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-container">
      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        <h1>Create Reminder</h1>
        <p>Set up your next reminder.</p>

        {/* TITLE */}
        <label htmlFor="title">
          Reminder Title
        </label>

        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Morning Medicine"
          required
        />

        {/* CATEGORY */}
        <label htmlFor="category">
          Category
        </label>

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

        {/* MEDICINE */}
        {form.category === "MEDICINE" && (
          <>
            <label htmlFor="medicine">
              Select Medicine
            </label>

            <select
              id="medicine"
              name="medicine"
              value={form.medicine}
              onChange={handleChange}
              required
              disabled={loadingMedicines}
            >
              <option value="">
                {loadingMedicines
                  ? "Loading medicines..."
                  : "Select a medicine"}
              </option>

              {medicines.map((medicine) => (
                <option
                  key={medicine._id}
                  value={medicine._id}
                >
                  {medicine.medicineName} -{" "}
                  {medicine.dosage} ({medicine.type})
                </option>
              ))}
            </select>
          </>
        )}

        {/* REMINDER TYPE */}
        <label htmlFor="reminderType">
          Reminder Type
        </label>

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

        {/* ONE TIME */}
        {form.reminderType === "ONE_TIME" && (
          <>
            <label htmlFor="scheduledAt">
              Scheduled Date and Time
            </label>

            <input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </>
        )}

        {/* DAILY */}
        {form.reminderType === "DAILY" && (
          <>
            <label htmlFor="time">
              Reminder Time
            </label>

            <input
              id="time"
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </>
        )}

        {/* WEEKLY */}
        {form.reminderType === "WEEKLY" && (
          <>
            <label htmlFor="time">
              Reminder Time
            </label>

            <input
              id="time"
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              required
            />

            <label>
              Select Days
            </label>

            <div className="weekly-days">
              {weekDays.map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={form.daysOfWeek.includes(day)}
                    onChange={() => handleDayChange(day)}
                  />
                  {day.charAt(0) +
                    day.slice(1).toLowerCase()}
                </label>
              ))}
            </div>
          </>
        )}

        {/* HOURLY */}
        {form.reminderType === "HOURLY" && (
          <>
            <label htmlFor="intervalMinutes">
              Repeat Every (Minutes)
            </label>

            <input
              id="intervalMinutes"
              name="intervalMinutes"
              type="number"
              min="1"
              step="1"
              value={form.intervalMinutes}
              onChange={handleChange}
              placeholder="e.g. 60"
              required
            />

            <label htmlFor="startTime">
              Start Time
            </label>

            <input
              id="startTime"
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              required
            />

            <label htmlFor="endTime">
              End Time
            </label>

            <input
              id="endTime"
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              required
            />
          </>
        )}

        {/* CUSTOM */}
        {form.reminderType === "CUSTOM" && (
          <>
            <label htmlFor="customInterval">
              Repeat Every
            </label>

            <input
              id="customInterval"
              name="customInterval"
              type="number"
              min="1"
              step="1"
              value={form.customInterval}
              onChange={handleChange}
              placeholder="e.g. 2"
              required
            />

            <label htmlFor="customIntervalUnit">
              Interval Unit
            </label>

            <select
              id="customIntervalUnit"
              name="customIntervalUnit"
              value={form.customIntervalUnit}
              onChange={handleChange}
            >
              <option value="MINUTES">Minutes</option>
              <option value="HOURS">Hours</option>
              <option value="DAYS">Days</option>
            </select>

            <label htmlFor="startTime">
              Start Time
            </label>

            <input
              id="startTime"
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              required
            />

            <label htmlFor="endTime">
              End Time
            </label>

            <input
              id="endTime"
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              required
            />
          </>
        )}

        {/* DATE RANGE */}
        <label htmlFor="startDate">
          Start Date (Optional)
        </label>

        <input
          id="startDate"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
        />

        <label htmlFor="endDate">
          End Date (Optional)
        </label>

        <input
          id="endDate"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleChange}
        />

        {/* NOTIFICATION */}
        <label htmlFor="notificationType">
          Notification Type
        </label>

        <select
          id="notificationType"
          name="notificationType"
          value={form.notificationType}
          onChange={handleChange}
        >
          <option value="BROWSER">Browser</option>
          <option value="EMAIL">Email</option>
          <option value="BOTH">
            Browser and Email
          </option>
        </select>

        {/* DESCRIPTION */}
        <label htmlFor="description">
          Description (Optional)
        </label>

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

        <button
          type="submit"
          disabled={saving || loadingMedicines}
        >
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
