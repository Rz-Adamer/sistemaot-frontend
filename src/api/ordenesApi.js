import axios from './axiosConfig'

export const getOrdenes = (params = {}) => axios.get('/api/ordenes', { params })

export const getOrden = (id) => axios.get(`/api/ordenes/${id}`)

export const createOrden = (payload) => axios.post('/api/ordenes', payload)

export const updateOrden = (id, payload) => axios.put(`/api/ordenes/${id}`, payload)

export const updateEquipo = (ordenId, equipoId, payload) => axios.put(`/api/ordenes/${ordenId}/equipos/${equipoId}`, payload)

export default { getOrdenes, getOrden, createOrden, updateOrden, updateEquipo }
