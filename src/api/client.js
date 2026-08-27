import axios from 'axios'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const TOKEN_KEY = 'nightclub_admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}
export function setToken(token, remember = true) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    sessionStorage.setItem(TOKEN_KEY, token)
  }
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api',
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers['x-auth-token'] = token
  return config
})

let unauthorizedHandler = null
export function onUnauthorized(handler) {
  unauthorizedHandler = handler
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)
