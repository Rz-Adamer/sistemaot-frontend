import axios from './axiosConfig'

export const getLogs = (params = {}) => axios.get('/api/auditoria', { params })

export default { getLogs }
