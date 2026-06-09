import axios from 'axios'
import { toast } from 'react-toastify'

const instance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
})

instance.interceptors.request.use((config) => {
	const token = localStorage.getItem('sistemaot_token')
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})

instance.interceptors.response.use(
	(res) => res,
	(err) => {
		const message = err.response?.data?.message || err.message || 'Error en la petición'
		if (!err.config?.silent) toast.error(message)
		return Promise.reject(err)
	},
)

export default instance
