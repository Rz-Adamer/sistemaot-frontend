import axios from './axiosConfig'

export const login = (email, password) => axios.post('/api/auth/login', { email, password })

export const registerOwner = (payload) => axios.post('/api/auth/register', payload)

export default { login, registerOwner }
