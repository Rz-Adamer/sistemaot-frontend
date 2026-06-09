import axios from './axiosConfig'

export const getOrdenes = (params = {}) => axios.get('/api/ordenes', { params })

export const getOrden = async (id) => {
	const res = await getOrdenes({ limit: 100 })
	const orden = res.data?.data?.find((item) => String(item.id) === String(id))
	return { ...res, data: { ...res.data, data: orden || null } }
}

export const createOrden = (payload) => axios.post('/api/ordenes', payload)

export const updateOrden = (id, payload) => axios.put(`/api/ordenes/${id}`, payload)

export default { getOrdenes, getOrden, createOrden, updateOrden }
