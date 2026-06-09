import axios from './axiosConfig'

export const getClientes = (params = {}) => axios.get('/api/clientes', { params })

export const createCliente = (payload) => axios.post('/api/clientes', payload)

export const deleteCliente = (id) => axios.delete(`/api/clientes/${id}`)

export default { getClientes, createCliente, deleteCliente }
