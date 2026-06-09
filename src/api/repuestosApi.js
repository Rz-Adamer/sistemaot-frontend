import axios from './axiosConfig'

export const createRepuesto = (payload) => axios.post('/api/repuestos', payload)

export default { createRepuesto }
