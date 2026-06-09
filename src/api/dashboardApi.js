import axios from './axiosConfig'

export const getStats = () => axios.get('/api/dashboard')

export default { getStats }
