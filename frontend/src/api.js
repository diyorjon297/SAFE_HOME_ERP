
import axios from "axios";

const API = axios.create({
  baseURL: "https://safe-home-erp.onrender.com",
  timeout: 30000,
});

export default API;
