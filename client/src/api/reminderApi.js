
import api from "./axios.js";

export const getReminders = async () => {
  const response = await api.get("/reminder");
  return response.data;
};

export const getReminderDashboard = async () => {
  const response = await api.get("/reminder/dashboard");
  return response.data;
};

export const createReminder = async (reminderData) => {
  const response = await api.post("/reminder", reminderData);
  return response.data;
};

export const updateReminder = async (id, reminderData) => {
  const response = await api.put(`/reminder/${id}`, reminderData);
  return response.data;
};

export const deleteReminder = async (id) => {
  const response = await api.delete(`/reminder/${id}`);
  return response.data;
};

export const pauseReminder = async (id) => {
  const response = await api.patch(`/reminder/${id}/pause`);
  return response.data;
};

export const resumeReminder = async (id) => {
  const response = await api.patch(`/reminder/${id}/resume`);
  return response.data;
};
