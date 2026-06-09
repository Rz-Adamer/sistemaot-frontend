export const normalizeRole = (role = '') =>
	String(role)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()

export const isAdmin = (user) => normalizeRole(user?.rol) === 'admin'

export const isOwner = (user) => ['dueno', 'owner'].includes(normalizeRole(user?.rol))

export const roleLabel = (role = '') => {
	const normalized = normalizeRole(role)
	if (normalized === 'admin') return 'Administrador'
	if (normalized === 'dueno') return 'Dueño'
	return role || 'Sin rol'
}

export const extractData = (response, fallback = []) => response?.data?.data ?? response?.data ?? fallback

export const formatMoney = (value = 0) =>
	new Intl.NumberFormat('es-PE', {
		style: 'currency',
		currency: 'PEN',
		minimumFractionDigits: 2,
	}).format(Number(value) || 0)

export const currency = formatMoney

export const formatDateTime = (value) => {
	if (!value) return '-'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return '-'
	return date.toLocaleString('es-PE', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	})
}

export const formatDate = (value) => {
	if (!value) return '-'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return '-'
	return date.toLocaleDateString('es-PE')
}

export const capitalize = (value = '') => String(value).charAt(0).toUpperCase() + String(value).slice(1)

export const statusClass = (status = '') => {
	const map = {
		'En revisión': 'bg-sky-50 text-sky-700 ring-sky-200',
		'En reparacion': 'bg-amber-50 text-amber-700 ring-amber-200',
		'En reparación': 'bg-amber-50 text-amber-700 ring-amber-200',
		'Listo para entrega': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
		Entregado: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
	}
	return map[status] || 'bg-zinc-100 text-zinc-700 ring-zinc-200'
}

export default { formatDateTime, formatDate, currency, capitalize }
