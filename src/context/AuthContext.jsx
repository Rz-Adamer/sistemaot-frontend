import { createContext, useEffect, useMemo, useState } from 'react'
import axios from '../api/axiosConfig'
import { toast } from 'react-toastify'
import { isAdmin, isOwner, roleLabel } from '../utils/formatters'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(() => {
		try {
			const raw = localStorage.getItem('sistemaot_user')
			return raw ? JSON.parse(raw) : null
		} catch {
			return null
		}
	})

	const [token, setToken] = useState(() => localStorage.getItem('sistemaot_token') || null)

	useEffect(() => {
		if (user) localStorage.setItem('sistemaot_user', JSON.stringify(user))
		else localStorage.removeItem('sistemaot_user')
	}, [user])

	useEffect(() => {
		if (token) localStorage.setItem('sistemaot_token', token)
		else localStorage.removeItem('sistemaot_token')
	}, [token])

	const login = async (email, password) => {
		try {
			const res = await axios.post('/api/auth/login', { email, password })
			if (res.data?.status === 'success') {
				const { token: accessToken, usuario } = res.data
				setToken(accessToken)
				setUser(usuario)
				toast.success(`Bienvenido, ${usuario.nombre_taller || usuario.email}`)
				return { ok: true, user: usuario }
			}
			toast.error(res.data?.message || 'Error al iniciar sesión')
			return { ok: false }
		} catch {
			return { ok: false }
		}
	}

	const logout = () => {
		setToken(null)
		setUser(null)
		toast.info('Sesión cerrada')
	}

	const value = useMemo(
		() => ({
			user,
			token,
			login,
			logout,
			isAdmin: isAdmin(user),
			isOwner: isOwner(user),
			roleLabel: roleLabel(user?.rol),
		}),
		[user, token],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
