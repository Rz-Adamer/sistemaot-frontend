import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, History } from 'lucide-react'
import auditoriaApi from '../../api/auditoriaApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { extractData, formatDateTime } from '../../utils/formatters'

const pageSize = 10

const LogsAuditoria = () => {
	const [logs, setLogs] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [page, setPage] = useState(1)
	const [pagination, setPagination] = useState({ totalRegistros: 0, paginaActual: 1, totalPaginas: 0 })

	useEffect(() => {
		let mounted = true
		auditoriaApi
			.getLogs({ page, limit: pageSize })
			.then((res) => {
				if (mounted) {
					setLogs(extractData(res))
					setError('')
					setPagination(res.data?.paginacion || { totalRegistros: 0, paginaActual: page, totalPaginas: 0 })
				}
			})
			.catch((err) => {
				if (mounted) {
					setLogs([])
					setError(err.response?.data?.message || 'No se pudo cargar la auditoría.')
				}
			})
			.finally(() => mounted && setLoading(false))
		return () => {
			mounted = false
		}
	}, [page])

	const changePage = (nextPage) => {
		setLoading(true)
		setError('')
		setPage(nextPage)
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Administración</p>
				<h2 className="text-2xl font-black text-zinc-950 sm:text-3xl">Auditoría</h2>
			</div>

			<Card>
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<History size={18} />
						<h3 className="text-lg font-black">Eventos recientes</h3>
					</div>
					<span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-600">{pagination.totalRegistros}</span>
				</div>

				{loading ? (
					<div className="text-sm text-zinc-500">Cargando auditoría...</div>
				) : error ? (
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
						No se pudo cargar la auditoría: {error}
					</div>
				) : (
					<div className="grid gap-3">
						<div className="overflow-x-auto rounded-lg border border-zinc-200">
							<table className="w-full text-left text-sm">
								<thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
									<tr>
										<th className="px-4 py-3">Evento</th>
										<th className="px-4 py-3">Usuario</th>
										<th className="px-4 py-3">Descripción</th>
										<th className="px-4 py-3">Fecha</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-zinc-200 bg-white">
									{logs.map((log) => (
										<tr key={log.id}>
											<td className="px-4 py-3">
												<div className="font-black">{log.modulo || '-'}</div>
												<div className="text-xs text-zinc-500">{log.accion || '-'}</div>
											</td>
											<td className="px-4 py-3 text-zinc-600">
												<div>{log.usuario?.email || 'Desconocido'}</div>
												<div className="text-xs">{log.usuario?.rol || 'N/A'}</div>
											</td>
											<td className="px-4 py-3 text-zinc-600">{log.descripcion || '-'}</td>
											<td className="px-4 py-3 text-zinc-500">{formatDateTime(log.creado_en || log.created_at)}</td>
										</tr>
									))}
									{logs.length === 0 && (
										<tr>
											<td colSpan="4" className="px-4 py-8 text-center text-zinc-500">No hay registros.</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
						{pagination.totalPaginas > 1 && (
							<div className="flex flex-col gap-3 border-t border-zinc-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
								<span className="text-xs font-semibold text-zinc-500">
									Página {pagination.paginaActual} de {pagination.totalPaginas}
								</span>
								<div className="grid grid-cols-2 gap-2 sm:flex">
									<Button variant="secondary" onClick={() => changePage(page - 1)} disabled={page <= 1 || loading} title="Página anterior">
										<ChevronLeft size={16} />
									</Button>
									<Button variant="secondary" onClick={() => changePage(page + 1)} disabled={page >= pagination.totalPaginas || loading} title="Página siguiente">
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

export default LogsAuditoria
