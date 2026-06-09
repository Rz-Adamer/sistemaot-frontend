import { Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAuth from '../hooks/useAuth.js'
import { normalizeRole } from '../utils/formatters'

const ProtectedRoute = ({ children, roles }) => {
	const { user } = useAuth()

	if (!user) return <Navigate to="/login" replace />

	if (roles?.length) {
		const currentRole = normalizeRole(user.rol)
		const allowed = roles.map(normalizeRole)

		if (!allowed.includes(currentRole)) {
			toast.warn('No tienes permisos para ver esta sección')
			return <Navigate to={currentRole === 'admin' ? '/admin/logs' : '/dashboard'} replace />
		}
	}

	return children
}

export default ProtectedRoute
