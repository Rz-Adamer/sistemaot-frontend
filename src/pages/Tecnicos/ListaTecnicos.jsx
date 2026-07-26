import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Wrench } from 'lucide-react'
import { toast } from 'react-toastify'
import tecnicosApi from '../../api/tecnicosApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { extractData } from '../../utils/formatters'

const emptyForm = { nombre: '', telefono: '' }
const pageSize = 5

const validateForm = (form) => {
	const errors = {}
	const nombre = form.nombre.trim()
	const telefono = form.telefono.trim()
	const phoneDigits = telefono.replace(/\D/g, '')

	if (!nombre) errors.nombre = 'El nombre es obligatorio.'
	else if (nombre.length < 2) errors.nombre = 'El nombre debe tener al menos 2 caracteres.'
	else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(nombre)) errors.nombre = 'El nombre solo puede contener letras, espacios, apóstrofes y guiones.'

	if (telefono && !/^[+\d\s()-]+$/.test(telefono)) errors.telefono = 'El teléfono contiene caracteres no válidos.'
	else if (telefono && phoneDigits.length < 6) errors.telefono = 'El teléfono debe contener al menos 6 dígitos.'
	else if (telefono && phoneDigits.length > 15) errors.telefono = 'El teléfono no puede superar los 15 dígitos.'

	return errors
}

const ListaTecnicos = () => {
	const [tecnicos, setTecnicos] = useState([])
	const [form, setForm] = useState(emptyForm)
	const [errors, setErrors] = useState({})
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [page, setPage] = useState(1)
	const [pagination, setPagination] = useState({ totalItems: 0, currentPage: 1, totalPages: 0 })

	const loadTecnicos = useCallback(async (requestedPage = page) => {
		setLoading(true)
		try {
			const res = await tecnicosApi.getTecnicos({ page: requestedPage, limit: pageSize })
			setTecnicos(extractData(res))
			setPagination(res.data?.pagination || { totalItems: 0, currentPage: requestedPage, totalPages: 0 })
		} finally {
			setLoading(false)
		}
	}, [page])

	useEffect(() => {
		let active = true
		tecnicosApi.getTecnicos({ page, limit: pageSize }).then((res) => {
			if (active) {
				setTecnicos(extractData(res))
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

	const submit = async (e) => {
		e.preventDefault()
		const validationErrors = validateForm(form)

		if (Object.keys(validationErrors).length) {
			setErrors(validationErrors)
			return
		}

		setSaving(true)
		try {
			await tecnicosApi.createTecnico({
				nombre: form.nombre.trim(),
				telefono: form.telefono.trim(),
			})
			toast.success('Técnico creado correctamente')
			setForm(emptyForm)
			setErrors({})
			if (page === 1) await loadTecnicos(1)
			else changePage(1)
		} finally {
			setSaving(false)
		}
	}

	const remove = async (tecnico) => {
		if (!confirm(`¿Eliminar a ${tecnico.nombre}?`)) return
		await tecnicosApi.deleteTecnico(tecnico.id)
		toast.success('Técnico eliminado correctamente')

		if (tecnicos.length === 1 && page > 1) changePage(page - 1)
		else await loadTecnicos(page)
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Equipo técnico</p>
				<h2 className="text-2xl font-black text-zinc-950 sm:text-3xl">Técnicos</h2>
			</div>

			<div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
				<Card>
					<h3 className="mb-4 flex items-center gap-2 text-lg font-black"><Plus size={18} /> Nuevo técnico</h3>
					<form onSubmit={submit} className="grid gap-3" noValidate>
						<div className="space-y-1.5">
							<label htmlFor="nombre">Nombre</label>
							<input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} maxLength="100" aria-invalid={Boolean(errors.nombre)} />
							{errors.nombre && <p className="text-xs font-semibold text-red-600">{errors.nombre}</p>}
						</div>
						<div className="space-y-1.5">
							<label htmlFor="telefono">Teléfono</label>
							<input id="telefono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} maxLength="25" aria-invalid={Boolean(errors.telefono)} />
							{errors.telefono && <p className="text-xs font-semibold text-red-600">{errors.telefono}</p>}
						</div>
						<Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear técnico'}</Button>
					</form>
				</Card>

				<Card>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="flex items-center gap-2 text-lg font-black"><Wrench size={18} /> Registrados</h3>
						<span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-600">{pagination.totalItems}</span>
					</div>
					{loading ? (
						<div className="text-sm text-zinc-500">Cargando técnicos...</div>
					) : (
						<div className="grid gap-3">
							{tecnicos.map((tecnico) => (
								<div key={tecnico.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
									<div>
										<div className="font-bold">{tecnico.nombre}</div>
										<div className="text-sm text-zinc-500">{tecnico.telefono || 'Sin teléfono'}</div>
									</div>
									<Button variant="ghost" onClick={() => remove(tecnico)} title="Eliminar técnico">
										<Trash2 size={16} />
									</Button>
								</div>
							))}
							{tecnicos.length === 0 && <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500">No hay técnicos registrados.</div>}
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

export default ListaTecnicos
