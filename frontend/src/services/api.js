import axios from "axios";

const API_BASE = "http://10.68.55.89:3333"; // ajuste para o IP do backend

const api = axios.create({
  baseURL: API_BASE,
});

export default api;