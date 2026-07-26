import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ClipboardList, Plus, Search } from 'lucide-react'
import ordenesApi from '../../api/ordenesApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { extractData, formatDateTime, formatMoney, statusClass } from '../../utils/formatters'

const estados = ['', 'En revision', 'En reparacion', 'Listo para entregar', 'Entregado']
const meses = [
	{ value: '', label: 'Todos los meses' },
	{ value: '1', label: 'Enero' },
	{ value: '2', label: 'Febrero' },
	{ value: '3', label: 'Marzo' },
	{ value: '4', label: 'Abril' },
	{ value: '5', label: 'Mayo' },
	{ value: '6', label: 'Junio' },
	{ value: '7', label: 'Julio' },
	{ value: '8', label: 'Agosto' },
	{ value: '9', label: 'Septiembre' },
	{ value: '10', label: 'Octubre' },
	{ value: '11', label: 'Noviembre' },
	{ value: '12', label: 'Diciembre' },
]
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 8 }, (_, index) => String(currentYear - index))
const pageSize = 10

const shortText = (value, max = 70) => {
	const text = String(value || '').trim()
	if (!text) return ''
	return text.length > max ? `${text.slice(0, max)}...` : text
}

const ListaOrdenes = () => {
	const [ordenes, setOrdenes] = useState([])
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState({ estado: '', search: '', month: '', year: '' })
	const [page, setPage] = useState(1)
	const [pagination, setPagination] = useState({ totalItems: 0, currentPage: 1, totalPages: 0, limit: pageSize })

	const buildParams = (currentFilters = filters, currentPage = page) => {
		const params = { page: currentPage, limit: pageSize }
		if (currentFilters.estado) params.estado = currentFilters.estado
		if (currentFilters.search) params.search = currentFilters.search.trim()
		if (currentFilters.year) params.year = currentFilters.year
		if (currentFilters.month) params.month = currentFilters.month
		return params
	}

	const loadOrdenes = async (currentFilters = filters, currentPage = page) => {
		setLoading(true)
		try {
			const res = await ordenesApi.getOrdenes(buildParams(currentFilters, currentPage))
			setOrdenes(extractData(res))
			setPagination(res.data?.pagination || { totalItems: 0, currentPage, totalPages: 0, limit: pageSize })
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let active = true
		ordenesApi.getOrdenes({ page: 1, limit: pageSize }).then((res) => {
			if (active) {
				setOrdenes(extractData(res))
				setPagination(res.data?.pagination || { totalItems: 0, currentPage: 1, totalPages: 0, limit: pageSize })
			}
		}).finally(() => {
			if (active) setLoading(false)
		})
		return () => {
			active = false
		}
	}, [])

	const search = (e) => {
		e.preventDefault()
		setPage(1)
		loadOrdenes(filters, 1)
	}

	const clearFilters = () => {
		const clean = { estado: '', search: '', month: '', year: '' }
		setFilters(clean)
		setPage(1)
		loadOrdenes(clean, 1)
	}

	const changePage = (nextPage) => {
		setPage(nextPage)
		loadOrdenes(filters, nextPage)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
				<div>
					<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Operación diaria</p>
					<h2 className="text-2xl font-black text-zinc-950 sm:text-3xl">Órdenes</h2>
				</div>
				<Link to="/ordenes/nueva">
					<Button><Plus size={16} /> Crear orden</Button>
				</Link>
			</div>

			<Card>
				<form onSubmit={search} className="grid gap-3">
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-2.5 text-zinc-400" size={18} />
						<input
							className="pl-10"
							placeholder="Buscar por cliente, equipo, marca, modelo o serie"
							value={filters.search}
							onChange={(e) => setFilters({ ...filters, search: e.target.value })}
						/>
					</div>
					<div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-[190px_170px_140px_auto_auto] lg:items-center">
						<select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })} aria-label="Estado">
							{estados.map((estado) => (
								<option key={estado || 'todos'} value={estado}>{estado || 'Todos los estados'}</option>
							))}
						</select>
						<select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} aria-label="Mes">
							{meses.map((mes) => (
								<option key={mes.value || 'todos'} value={mes.value}>{mes.label}</option>
							))}
						</select>
						<select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} aria-label="Año">
							<option value="">Todos los años</option>
							{years.map((year) => (
								<option key={year} value={year}>{year}</option>
							))}
						</select>
						<Button type="submit" variant="secondary" className="w-full lg:w-auto">Filtrar</Button>
						<Button type="button" variant="ghost" onClick={clearFilters} className="w-full lg:w-auto">Limpiar</Button>
					</div>
				</form>
			</Card>

			<Card>
				<div className="mb-4 flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<ClipboardList size={18} />
						<h3 className="text-lg font-black">Listado</h3>
					</div>
					<span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-600">{pagination.totalItems}</span>
				</div>
				{loading ? (
					<div className="text-sm text-zinc-500">Cargando órdenes...</div>
				) : (
					<div className="grid gap-3">
						{ordenes.map((orden) => {
							const equipos = orden.equipos_orden || []
							return (
								<Link
									key={orden.id}
									to={`/ordenes/${orden.id}`}
									className="rounded-lg border border-zinc-200 p-4 transition hover:border-teal-300 hover:bg-teal-50/40"
								>
									<div className="grid gap-4 lg:grid-cols-[1fr_1.5fr_auto] lg:items-start">
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<span className="text-lg font-black">Orden #{orden.id}</span>
												<span className={`rounded-full px-2 py-1 text-xs font-bold ring-1 ${statusClass(orden.estado)}`}>{orden.estado}</span>
											</div>
											<div className="mt-1 text-sm font-semibold text-zinc-700">{orden.clientes?.nombre || 'Cliente sin nombre'}</div>
											<div className="mt-1 text-xs text-zinc-500">Ingreso: {formatDateTime(orden.fecha_ingreso)}</div>
										</div>

										<div className="space-y-2">
											{equipos.length > 0 ? equipos.map((equipo, index) => (
												<div key={equipo.id || index} className="rounded-md bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200">
													<div className="flex flex-wrap items-center gap-2 text-sm">
														<span className="font-black text-zinc-900">{index + 1}. {equipo.tipo_equipo} {equipo.marca} {equipo.modelo}</span>
														{equipo.serie && <span className="text-xs text-zinc-500">Serie: {equipo.serie}</span>}
													</div>
													<div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
														<span><strong>Técnico:</strong> {equipo.tecnicos?.nombre || 'Sin asignar'}</span>
														{equipo.tipo_solucion && <span><strong>Solución:</strong> {equipo.tipo_solucion}</span>}
														{equipo.diagnostico_especifico && <span><strong>Diagnóstico:</strong> {shortText(equipo.diagnostico_especifico)}</span>}
													</div>
												</div>
											)) : (
												<div className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-500 ring-1 ring-zinc-200">Sin equipos registrados</div>
											)}
										</div>

										<div className="text-left lg:text-right">
											<div className="text-sm text-zinc-500">Total sin IGV</div>
											<div className="font-black">{formatMoney(orden.precio_total)}</div>
											<div className="mt-1 text-xs text-zinc-500">{equipos.length} equipo(s)</div>
										</div>
									</div>
								</Link>
							)
						})}
						{ordenes.length === 0 && <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500">No hay órdenes para mostrar.</div>}
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
	)
}

export default ListaOrdenes
