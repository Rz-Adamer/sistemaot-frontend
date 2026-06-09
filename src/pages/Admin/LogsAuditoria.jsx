import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import auditoriaApi from '../../api/auditoriaApi'
import Card from '../../components/UI/Card.jsx'
import { extractData, formatDateTime } from '../../utils/formatters'

const LogsAuditoria = () => {
	const [logs, setLogs] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true
		auditoriaApi
			.getLogs({ limit: 50 })
			.then((res) => mounted && setLogs(extractData(res)))
			.finally(() => mounted && setLoading(false))
		return () => {
			mounted = false
		}
	}, [])

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Administración</p>
				<h2 className="text-3xl font-black text-zinc-950">Auditoría</h2>
			</div>

			<Card>
				<div className="mb-4 flex items-center gap-2">
					<History size={18} />
					<h3 className="text-lg font-black">Eventos recientes</h3>
				</div>

				{loading ? (
					<div className="text-sm text-zinc-500">Cargando auditoría...</div>
				) : (
					<div className="overflow-hidden rounded-lg border border-zinc-200">
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
				)}
			</Card>
		</div>
	)
}

export default LogsAuditoria
