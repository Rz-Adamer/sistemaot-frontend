import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, UserRoundPlus, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import authApi from '../../api/authApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { extractData } from '../../utils/formatters'

const initialForm = { email: '', password: '', nombre_taller: '', rol: 'dueño' }
const pageSize = 5

const validateForm = (form) => {
	const errors = {}
	const nombreTaller = form.nombre_taller.trim()
	const email = form.email.trim()

	if (!nombreTaller) errors.nombre_taller = 'El nombre del taller es obligatorio.'
	else if (nombreTaller.length < 2) errors.nombre_taller = 'El nombre del taller debe tener al menos 2 caracteres.'
	else if (nombreTaller.length > 100) errors.nombre_taller = 'El nombre del taller no puede superar los 100 caracteres.'
	else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9&.,' -]+$/.test(nombreTaller)) errors.nombre_taller = 'El nombre del taller contiene caracteres no válidos.'

	if (!email) errors.email = 'El correo es obligatorio.'
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Ingrese un correo válido.'
	else if (email.length > 120) errors.email = 'El correo no puede superar los 120 caracteres.'

	if (!form.password) errors.password = 'La contraseña temporal es obligatoria.'
	else if (form.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.'
	else if (form.password.length > 72) errors.password = 'La contraseña no puede superar los 72 caracteres.'
	else if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
		errors.password = 'Incluya al menos una mayúscula, una minúscula y un número.'
	}

	return errors
}

const AdminUsuarios = () => {
	const [owners, setOwners] = useState([])
	const [form, setForm] = useState(initialForm)
	const [errors, setErrors] = useState({})
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [page, setPage] = useState(1)
	const [pagination, setPagination] = useState({ totalItems: 0, currentPage: 1, totalPages: 0 })

	const loadOwners = useCallback(async (requestedPage = page) => {
		setLoading(true)
		try {
			const res = await authApi.getOwners({ page: requestedPage, limit: pageSize })
			setOwners(extractData(res))
			setPagination(res.data?.pagination || { totalItems: 0, currentPage: requestedPage, totalPages: 0 })
		} finally {
			setLoading(false)
		}
	}, [page])

	useEffect(() => {
		let active = true
		authApi.getOwners({ page, limit: pageSize }).then((res) => {
			if (active) {
				setOwners(extractData(res))
				setPagination(res.data?.pagination || { totalItems: 0, currentPage: page, totalPages: 0 })
			}
		}).finally(() => {
			if (active) setLoading(false)
		})
		return () => {
			active = false
		}
	}, [page])

	const changePage = (nextPage) => {
		setLoading(true)
		setPage(nextPage)
	}

	const submit = async (e) => {
		e.preventDefault()
		const validationErrors = validateForm(form)

		if (Object.keys(validationErrors).length) {
			setErrors(validationErrors)
			return
		}

		setSaving(true)
		try {
			await authApi.registerOwner({
				...form,
				email: form.email.trim().toLowerCase(),
				nombre_taller: form.nombre_taller.trim(),
			})
			toast.success('Dueño creado correctamente')
			setForm(initialForm)
			setErrors({})
			if (form.rol === 'dueño') {
				if (page === 1) await loadOwners(1)
				else changePage(1)
			}
		} finally {
			setSaving(false)
		}
	}

	const update = (e) => {
		const { name, value } = e.target
		setForm((current) => ({ ...current, [name]: value }))
		setErrors((current) => ({ ...current, [name]: undefined }))
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Administración</p>
				<h2 className="text-2xl font-black text-zinc-950 sm:text-3xl">Dueños de taller</h2>
			</div>

			<div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
				<Card>
					<h3 className="mb-4 flex items-center gap-2 text-lg font-black"><UserRoundPlus size={18} /> Crear acceso</h3>
					<form onSubmit={submit} className="grid gap-4" noValidate>
						<div className="space-y-1.5">
							<label htmlFor="nombre_taller">Nombre del taller</label>
							<input id="nombre_taller" name="nombre_taller" value={form.nombre_taller} onChange={update} placeholder="Taller Central" maxLength="100" aria-invalid={Boolean(errors.nombre_taller)} />
							{errors.nombre_taller && <p className="text-xs font-semibold text-red-600">{errors.nombre_taller}</p>}
						</div>
						<div className="space-y-1.5">
							<label htmlFor="email">Correo</label>
							<input id="email" name="email" type="email" value={form.email} onChange={update} placeholder="dueno@taller.com" maxLength="120" aria-invalid={Boolean(errors.email)} />
							{errors.email && <p className="text-xs font-semibold text-red-600">{errors.email}</p>}
						</div>
						<div className="space-y-1.5">
							<label htmlFor="password">Contraseña temporal</label>
							<input id="password" name="password" type="password" value={form.password} onChange={update} maxLength="72" aria-invalid={Boolean(errors.password)} />
							{errors.password && <p className="text-xs font-semibold text-red-600">{errors.password}</p>}
						</div>
						<div className="space-y-1.5">
							<label htmlFor="rol">Rol</label>
							<select id="rol" name="rol" value={form.rol} onChange={update}>
								<option value="dueño">Dueño</option>
								<option value="admin">Administrador</option>
							</select>
						</div>
						<Button type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear usuario'}</Button>
					</form>
				</Card>

				<Card>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="flex items-center gap-2 text-lg font-black"><Users size={18} /> Dueños registrados</h3>
						<span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-600">{pagination.totalItems}</span>
					</div>

					{loading ? (
						<div className="text-sm text-zinc-500">Cargando dueños...</div>
					) : (
						<div className="grid gap-3">
							<div className="overflow-x-auto rounded-lg border border-zinc-200">
								<table className="w-full text-left text-sm">
									<thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
										<tr>
											<th className="px-4 py-3">Taller</th>
											<th className="px-4 py-3">Correo</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-zinc-200 bg-white">
										{owners.map((owner) => (
											<tr key={owner.id}>
												<td className="px-4 py-3">
													<div className="font-bold text-zinc-900">{owner.nombre_taller || 'Sin nombre'}</div>
													<div className="text-xs text-zinc-500">Dueño</div>
												</td>
												<td className="px-4 py-3 text-zinc-600">{owner.email}</td>
											</tr>
										))}
										{owners.length === 0 && (
											<tr>
												<td colSpan="2" className="px-4 py-8 text-center text-zinc-500">No hay dueños registrados.</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
							{pagination.totalPages > 1 && (
								<div className="flex flex-col gap-3 border-t border-zinc-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
									<span className="text-xs font-semibold text-zinc-500">
										Página {pagination.currentPage} de {pagination.totalPages}
									</span>
									<div className="grid grid-cols-2 gap-2 sm:flex">
										<Button variant="secondary" onClick={() => changePage(page - 1)} disabled={page <= 1 || loading} title="Página anterior">
											<ChevronLeft size={16} />
										</Button>
										<Button variant="secondary" onClick={() => changePage(page + 1)} disabled={page >= pagination.totalPages || loading} title="Página siguiente">
											<ChevronRight size={16} />
										</Button>
									</div>
								</div>
							)}
						</div>
					)}
				</Card>
			</div>
		</div>
	)
}

export default AdminUsuarios
