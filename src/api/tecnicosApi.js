import axios from './axiosConfig'

export const getTecnicos = (params = {}) => axios.get('/api/tecnicos', { params })

export const createTecnico = (payload) => axios.post('/api/tecnicos', payload)

export const deleteTecnico = (id) => axios.delete(`/api/tecnicos/${id}`)

export default { getTecnicos, createTecnico, deleteTecnico }
