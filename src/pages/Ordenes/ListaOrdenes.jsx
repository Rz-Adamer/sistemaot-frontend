import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Plus, Search } from 'lucide-react'
import ordenesApi from '../../api/ordenesApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { extractData, formatDateTime, formatMoney, statusClass } from '../../utils/formatters'

const estados = ['', 'En revisión', 'En reparación', 'Listo para entrega', 'Entregado']

const ListaOrdenes = () => {
	const [ordenes, setOrdenes] = useState([])
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState({ estado: '', search: '' })

	const loadOrdenes = async () => {
		setLoading(true)
		try {
			const params = { limit: 50 }
			if (filters.estado) params.estado = filters.estado
			if (filters.search) params.search = filters.search
			const res = await ordenesApi.getOrdenes(params)
			setOrdenes(extractData(res))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let active = true
		ordenesApi.getOrdenes({ limit: 50 }).then((res) => {
			if (active) setOrdenes(extractData(res))
		}).finally(() => {
			if (active) setLoading(false)
		})
		return () => {
			active = false
		}
	}, [])

	const search = (e) => {
		e.preventDefault()
		loadOrdenes()
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
				<div>
					<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Operación diaria</p>
					<h2 className="text-3xl font-black text-zinc-950">Órdenes</h2>
				</div>
				<Link to="/ordenes/nueva">
					<Button><Plus size={16} /> Crear orden</Button>
				</Link>
			</div>

			<Card>
				<form onSubmit={search} className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-2.5 text-zinc-400" size={18} />
						<input
							className="pl-10"
							placeholder="Buscar por cliente, equipo, marca, modelo o serie"
							value={filters.search}
							onChange={(e) => setFilters({ ...filters, search: e.target.value })}
						/>
					</div>
					<select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}>
						{estados.map((estado) => (
							<option key={estado || 'todos'} value={estado}>{estado || 'Todos los estados'}</option>
						))}
					</select>
					<Button type="submit" variant="secondary">Filtrar</Button>
				</form>
			</Card>

			<Card>
				<div className="mb-4 flex items-center gap-2">
					<ClipboardList size={18} />
					<h3 className="text-lg font-black">Listado</h3>
				</div>
				{loading ? (
					<div className="text-sm text-zinc-500">Cargando órdenes...</div>
				) : (
					<div className="grid gap-3">
						{ordenes.map((orden) => {
							const equipo = orden.equipos_orden?.[0]
							return (
								<Link
									key={orden.id}
									to={`/ordenes/${orden.id}`}
									className="rounded-lg border border-zinc-200 p-4 transition hover:border-teal-300 hover:bg-teal-50/40"
								>
									<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
										<div>
											<div className="flex flex-wrap items-center gap-2">
												<span className="text-lg font-black">Orden #{orden.id}</span>
												<span className={`rounded-full px-2 py-1 text-xs font-bold ring-1 ${statusClass(orden.estado)}`}>{orden.estado}</span>
											</div>
											<div className="mt-1 text-sm text-zinc-600">
												{orden.clientes?.nombre || 'Cliente sin nombre'} · {equipo ? `${equipo.tipo_equipo} ${equipo.marca} ${equipo.modelo}` : 'Sin equipo'}
											</div>
											<div className="mt-1 text-xs text-zinc-500">Ingreso: {formatDateTime(orden.fecha_ingreso)}</div>
										</div>
										<div className="text-left md:text-right">
											<div className="text-sm text-zinc-500">Total</div>
											<div className="font-black">{formatMoney(orden.precio_total)}</div>
										</div>
									</div>
								</Link>
							)
						})}
						{ordenes.length === 0 && <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500">No hay órdenes para mostrar.</div>}
					</div>
				)}
			</Card>
		</div>
	)
}

export default ListaOrdenes
