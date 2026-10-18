
import api from "./axios.js";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch("/auth/update-profile", profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.patch("/auth/change-password", passwordData);
  return response.data;
};

export const updateNotificationPreferences = async (preferences) => {
  const response = await api.patch(
    "/auth/notification-preferences",
    preferences
  );
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/auth/delete-account");
  return response.data;
};
