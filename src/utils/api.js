import axios from 'axios'

// Base URL — change this when deploying!
const API = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// Automatically add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth APIs
export const loginUser = (data) => API.post('user/login', data)
export const registerUser = (data) => API.post('/user/', data)

// Board APIs
export const getBoards = () => API.get('/boards')
export const createBoard = (data) => API.post('/boards', data)
export const deleteBoard = (id) => API.delete(`/boards/${id}`)

// List APIs
export const getLists = (boardId) => API.get(`/lists/${boardId}`)
export const createList = (data) => API.post('/lists', data)
export const deleteList = (id) => API.delete(`/lists/${id}`)

// Card APIs
export const getCards = (listId) => API.get(`/cards/${listId}`)
export const createCard = (data) => API.post('/cards', data)
export const updateCard = (id, data) => API.put(`/cards/${id}`, data)
export const deleteCard = (id) => API.delete(`/cards/${id}`)