import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export const loginUser = (data) => API.post('/user/login', data)
export const registerUser = (data) => API.post('/user', data)

export const getBoards = () => API.get('/board/')
export const getBoard = (id) => API.get(`/board/${id}/`)
export const createBoard = (data) => API.post('/board/', data)
export const deleteBoard = (id) => API.delete(`/board/${id}/`)

export const getListsByBoard = (boardId) => API.get(`/list/${boardId}`)
export const createList = (data) => API.post('/list/', data)

export const createCard = (data) => API.post('/card/', data)
export const getCardsByList = (listId) => API.get(`/card/${listId}`)

export function parseBoardsResponse(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.boards)) return data.boards
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function parseBoardResponse(data) {
  return data?.board ?? data?.data ?? data
}

export function parseListsResponse(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.lists)) return data.lists
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function parseListResponse(data) {
  return data?.list ?? data?.data ?? data
}

export function parseBoardDetail(data) {
  const board = data?.board ?? data?.data ?? data
  const lists = parseListsResponse(
    data?.lists ?? board?.lists ?? (Array.isArray(data) ? data : [])
  )
  return { board, lists }
}
