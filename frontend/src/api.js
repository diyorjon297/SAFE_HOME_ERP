import axios from "axios";

const API = axios.create({
  baseURL: "http://172.20.10.2:8001",
});

export default API;