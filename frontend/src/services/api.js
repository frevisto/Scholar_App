import axios from "axios";

const API_BASE = "http://192.168.100.44:3333"; // ajuste para o IP do backend

const api = axios.create({
  baseURL: API_BASE,
});

export default api;