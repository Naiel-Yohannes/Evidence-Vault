import api from './interceptor'
const url = import.meta.env.VITE_API_URL
const baseURL = `${url}/api/auth`

const register = async (user) => {
    const response = await api.post(`${baseURL}/register`, user)
    return response.data
}

const login = async (credentials) => {
    const response = await api.post(`${baseURL}/login`, credentials)
    return response.data
}

export default { register, login }
