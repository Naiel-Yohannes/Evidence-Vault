import api from "./interceptor";
const baseURL = import.meta.env.VITE_API_URL + "/api";

const shareFinding = async (findingId) => {
  const response = await api.post(`${baseURL}/finding/share/${findingId}`);
  return response.data
}

const getSharedFInding = async (token)  => {
  const response = await api.get(`${baseURL}/shared/${token}`)
  return response.data
}

const downloadSharedEvidence = async (token, fileId) => {
  const response = await api.get(`${baseURL}/finding/evidence/download/${token}/${fileId}`, {responseType: 'blob'})
  return response.data
}

export default {shareFinding, getSharedFInding, downloadSharedEvidence}