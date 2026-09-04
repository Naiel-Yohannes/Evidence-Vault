import api from './interceptor'
const url = import.meta.env.VITE_API_URL

const upload = async (findingId, file) => {
    const formData = new FormData()
    formData.append('evidence', file)
    const response = await api.post(`${url}/api/findings/${findingId}/evidence`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data
}

const list = async (findingId) => {
    const response = await api.get(`${url}/api/findings/${findingId}/evidence`)
    return response.data
}

const remove = async (evidenceId) => {
    const response = await api.delete(`${url}/api/evidence/${evidenceId}`)
    return response.data
}

export default { upload, list, remove }
