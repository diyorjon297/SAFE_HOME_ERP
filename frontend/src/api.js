import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8001",
});

// Har bir API so‘roviga login tokenini avtomatik qo‘shadi
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("safe_home_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Backend 401 qaytarsa, login sahifasiga qaytaramiz
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("safe_home_token");
      localStorage.removeItem("safe_home_logged_in");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;