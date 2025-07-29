import axios from 'axios'

const API_URL = 'https://acciojob-backend-7xqz.onrender.com/api/auth'

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData)
  return response.data
}

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials)
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data))
  }
  return response.data
}

export const logout = () => {
  localStorage.removeItem('user')
}