import axios from "axios";
import { extract } from "./extractData";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json = await res.json();
  return extract(json);
}


API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export const loginUser = (data) => API.post("/user/login", data).then(extract);
export const registerUser = (data) => API.post("/user", data).then(extract);

export const getBoards = () => API.get("/board/").then(extract);
export const getBoard = (id) => API.get(`/board/${id}/`).then(extract);
export const createBoard = (data) => API.post("/board/", data).then(extract);
export const deleteBoard = (id) => API.delete(`/board/${id}/`).then(extract);

export const generateDescription = (title) => API.post('/ai/generate-description', { title } ).then(extract);

export const getListsByBoard = (boardId) =>
  API.get(`/list/${boardId}`).then(extract);
export const createList = (data) => API.post("/list/", data).then(extract);
export const deleteList = (id) => API.delete(`/list/${id}`).then(extract);

export const createCard = (data) => API.post("/card/", data).then(extract);
export const getCardsByList = (listId) =>
  API.get(`/card/${listId}`).then(extract);

export function parseBoardsResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.boards)) return data.boards;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function parseBoardResponse(data) {
  return data?.board ?? data?.data ?? data;
}

export function parseListsResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.lists)) return data.lists;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function parseListResponse(data) {
  return data?.list ?? data?.data ?? data;
}

export function parseBoardDetail(data) {
  const board = data?.board ?? data?.data ?? data;
  const lists = parseListsResponse(
    data?.lists ?? board?.lists ?? (Array.isArray(data) ? data : []),
  );
  return { board, lists };
}
