import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import clientesApi from '../../api/clientesApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { extractData } from '../../utils/formatters'

const emptyForm = { identificacion: '', nombre: '', telefono: '', correo: '', direccion: '' }
const pageSize = 5

const validateForm = (form) => {
	const errors = {}
	const identificacion = form.identificacion.trim()
	const nombre = form.nombre.trim()
	const telefono = form.telefono.trim()
	const correo = form.correo.trim()
	const direccion = form.direccion.trim()
	const phoneDigits = telefono.replace(/\D/g, '')

	if (!identificacion) errors.identificacion = 'El DNI o RUC es obligatorio.'
	else if (!/^\d+$/.test(identificacion)) errors.identificacion = 'El DNI/RUC solo debe contener números.'
	else if (![8, 11].includes(identificacion.length)) errors.identificacion = 'Ingrese un DNI de 8 dígitos o un RUC de 11 dígitos.'

	if (!nombre) errors.nombre = 'El nombre es obligatorio.'
	else if (nombre.length < 2) errors.nombre = 'El nombre debe tener al menos 2 caracteres.'
	else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9&.,' -]+$/.test(nombre)) errors.nombre = 'El nombre contiene caracteres no válidos.'

	if (telefono && !/^[+\d\s()-]+$/.test(telefono)) errors.telefono = 'El teléfono contiene caracteres no válidos.'
	else if (telefono && phoneDigits.length < 6) errors.telefono = 'El teléfono debe contener al menos 6 dígitos.'
	else if (telefono && phoneDigits.length > 15) errors.telefono = 'El teléfono no puede superar los 15 dígitos.'

	if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errors.correo = 'Ingrese un correo válido.'

	if (direccion && direccion.length < 5) errors.direccion = 'La dirección debe tener al menos 5 caracteres.'
	else if (direccion.length > 150) errors.direccion = 'La dirección no puede superar los 150 caracteres.'

	return errors
}

const ListaClientes = () => {
	const [clientes, setClientes] = useState([])
	const [form, setForm] = useState(emptyForm)
	const [errors, setErrors] = useState({})
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [page, setPage] = useState(1)
	const [pagination, setPagination] = useState({ totalItems: 0, currentPage: 1, totalPages: 0 })

	const loadClientes = useCallback(async (requestedPage = page) => {
		setLoading(true)
		try {
			const res = await clientesApi.getClientes({ page: requestedPage, limit: pageSize })
			setClientes(extractData(res))
			setPagination(res.data?.pagination || { totalItems: 0, currentPage: requestedPage, totalPages: 0 })
		} finally {
			setLoading(false)
		}
	}, [page])

	useEffect(() => {
		let active = true
		clientesApi.getClientes({ page, limit: pageSize }).then((res) => {
			if (active) {
				setClientes(extractData(res))
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

	const handleChange = (e) => {
		const { name, value } = e.target
		setForm((current) => ({ ...current, [name]: value }))
		setErrors((current) => ({ ...current, [name]: undefined }))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		const validationErrors = validateForm(form)

		if (Object.keys(validationErrors).length) {
			setErrors(validationErrors)
			return
		}

		setSaving(true)
		try {
			await clientesApi.createCliente({
				identificacion: form.identificacion.trim(),
				nombre: form.nombre.trim(),
				telefono: form.telefono.trim(),
				correo: form.correo.trim(),
				direccion: form.direccion.trim(),
			})
			toast.success('Cliente creado correctamente')
			setForm(emptyForm)
			setErrors({})
			if (page === 1) await loadClientes(1)
			else changePage(1)
		} finally {
			setSaving(false)
		}
	}

	const handleDelete = async (cliente) => {
		if (!confirm(`¿Eliminar a ${cliente.nombre}?`)) return
		await clientesApi.deleteCliente(cliente.id)
		toast.success('Cliente eliminado correctamente')

		if (clientes.length === 1 && page > 1) changePage(page - 1)
		else await loadClientes(page)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
				<div>
					<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Base comercial</p>
					<h2 className="text-3xl font-black text-zinc-950">Clientes</h2>
				</div>
			</div>

			<div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
				<Card>
					<h3 className="mb-4 flex items-center gap-2 text-lg font-black">
						<Plus size={18} /> Nuevo cliente
					</h3>
					<form onSubmit={handleSubmit} className="grid gap-3" noValidate>
						<Field label="DNI/RUC" name="identificacion" value={form.identificacion} onChange={handleChange} error={errors.identificacion} inputMode="numeric" maxLength="11" />
						<Field label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} error={errors.nombre} maxLength="100" />
						<Field label="Teléfono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} error={errors.telefono} maxLength="25" />
						<Field label="Correo" name="correo" type="email" value={form.correo} onChange={handleChange} error={errors.correo} maxLength="120" />
						<Field label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} error={errors.direccion} maxLength="150" />
						<Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear cliente'}</Button>
					</form>
				</Card>

				<Card>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="flex items-center gap-2 text-lg font-black">
							<Users size={18} /> Registrados
						</h3>
						<span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-600">{pagination.totalItems}</span>
					</div>

					{loading ? (
						<div className="text-sm text-zinc-500">Cargando clientes...</div>
					) : (
						<div className="grid gap-3">
							<div className="overflow-hidden rounded-lg border border-zinc-200">
								<table className="w-full text-left text-sm">
									<thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
										<tr>
											<th className="px-4 py-3">Cliente</th>
											<th className="px-4 py-3">Contacto</th>
											<th className="px-4 py-3 text-right">Acción</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-zinc-200 bg-white">
										{clientes.map((cliente) => (
											<tr key={cliente.id}>
												<td className="px-4 py-3">
													<div className="font-bold text-zinc-900">{cliente.nombre}</div>
													<div className="text-xs text-zinc-500">{cliente.identificacion}</div>
												</td>
												<td className="px-4 py-3 text-zinc-600">
													<div>{cliente.telefono || '-'}</div>
													<div className="text-xs">{cliente.correo || '-'}</div>
												</td>
												<td className="px-4 py-3 text-right">
													<Button variant="ghost" onClick={() => handleDelete(cliente)} title="Eliminar">
														<Trash2 size={16} />
													</Button>
												</td>
											</tr>
										))}
										{clientes.length === 0 && (
											<tr>
												<td colSpan="3" className="px-4 py-8 text-center text-zinc-500">No hay clientes registrados.</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
							{pagination.totalPages > 1 && (
								<div className="flex items-center justify-between border-t border-zinc-200 pt-3">
									<span className="text-xs font-semibold text-zinc-500">
										Página {pagination.currentPage} de {pagination.totalPages}
									</span>
									<div className="flex gap-2">
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

const Field = ({ label, error, ...props }) => (
	<div className="space-y-1.5">
		<label htmlFor={props.name}>{label}</label>
		<input id={props.name} aria-invalid={Boolean(error)} {...props} />
		{error && <p className="text-xs font-semibold text-red-600">{error}</p>}
	</div>
)

export default ListaClientes
