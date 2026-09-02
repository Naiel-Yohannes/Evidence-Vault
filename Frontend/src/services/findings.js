import api from './interceptor'
const url = import.meta.env.VITE_API_URL
const baseURL = `${url}/api/findings`

const getAll = async () => {
    const response = await api.get(baseURL)
    return response.data
}

const getOne = async (id) => {
    const response = await api.get(`${baseURL}/${id}`)
    return response.data
}

const create = async (finding) => {
    const response = await api.post(baseURL, finding)
    return response.data
}

const update = async (id, finding) => {
    const response = await api.patch(`${baseURL}/${id}`, finding)
    return response.data
}

const remove = async (id) => {
    const response = await api.delete(`${baseURL}/${id}`)
    return response.data
}

export default { getAll, getOne, create, update, remove }
