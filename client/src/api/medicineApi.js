
import api from "./axios.js";

export const getMedicines = async () => {
  const response = await api.get("/medicine/getMedicine");
  return response.data;
};

export const createMedicine = async (medicineData) => {
  const response = await api.post("/medicine/medicine", medicineData);
  return response.data;
};
