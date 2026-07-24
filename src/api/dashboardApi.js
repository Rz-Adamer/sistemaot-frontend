import axios from './axiosConfig'

export const getStats = (params = {}) => axios.get('/api/dashboard', { params })

export default { getStats }
