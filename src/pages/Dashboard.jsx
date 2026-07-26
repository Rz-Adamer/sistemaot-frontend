import { useEffect, useState } from 'react'
import { Activity, Banknote, ClipboardList, Timer } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import dashboardApi from '../api/dashboardApi'
import Card from '../components/UI/Card.jsx'
import { formatMoney } from '../utils/formatters'

const stateColors = ['#0f766e', '#d97706', '#059669', '#52525b']
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

const Dashboard = () => {
	const [stats, setStats] = useState(null)
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState({ anio: String(currentYear), mes: '' })

	useEffect(() => {
		let mounted = true
		const params = { anio: filters.anio }
		if (filters.mes) params.mes = filters.mes

		dashboardApi
			.getStats(params)
			.then((res) => mounted && setStats(res.data?.data))
			.finally(() => mounted && setLoading(false))
		return () => {
			mounted = false
		}
	}, [filters])

	const kpis = stats?.kpis || {}
	const chartTitle = filters.mes ? 'Rendimiento diario' : 'Rendimiento mensual'
	const chartHelp = filters.mes
		? 'Órdenes creadas y entregadas por día del mes seleccionado'
		: 'Órdenes creadas y entregadas por mes del año seleccionado'
	const updateFilters = (nextFilters) => {
		setLoading(true)
		setFilters(nextFilters)
	}

	if (loading && !stats) return <div className="text-sm text-zinc-500">Cargando dashboard...</div>

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
				<div>
					<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Resumen operativo</p>
					<h2 className="text-2xl font-black text-zinc-950 sm:text-3xl">Dashboard</h2>
				</div>
				<div className="grid w-full gap-2 sm:w-auto sm:grid-cols-[170px_140px]">
					<select value={filters.mes} onChange={(e) => updateFilters({ ...filters, mes: e.target.value })} aria-label="Mes del dashboard">
						{meses.map((mes) => (
							<option key={mes.value || 'todos'} value={mes.value}>{mes.label}</option>
						))}
					</select>
					<select value={filters.anio} onChange={(e) => updateFilters({ ...filters, anio: e.target.value })} aria-label="Año del dashboard">
						{years.map((year) => (
							<option key={year} value={year}>{year}</option>
						))}
					</select>
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
				<Kpi icon={Banknote} label="Ingresos" value={formatMoney(kpis.ingresosTotales)} />
				<Kpi icon={ClipboardList} label="Órdenes" value={kpis.totalOrdenes ?? 0} />
				<Kpi icon={Activity} label="Activas" value={kpis.ordenesActivas ?? 0} />
				<Kpi icon={Timer} label="Ticket promedio" value={formatMoney(kpis.ticketPromedio)} />
			</div>

			<div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
				<Card className="min-w-0">
					<div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
						<div>
							<h3 className="text-lg font-black">{chartTitle}</h3>
							<p className="text-sm text-zinc-500">{chartHelp}</p>
						</div>
						{loading && <span className="text-xs font-bold text-teal-700">Actualizando...</span>}
					</div>
					<div className="h-72 min-h-72 min-w-0 sm:h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={stats?.graficoRendimiento || []}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="mes" />
								<YAxis allowDecimals={false} />
								<Tooltip />
								<Bar dataKey="creadas" name="Creadas" fill="#0f766e" radius={[6, 6, 0, 0]} />
								<Bar dataKey="entregadas" name="Entregadas" fill="#eab308" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</Card>

				<Card className="min-w-0">
					<h3 className="mb-4 text-lg font-black">Estados</h3>
					<div className="h-72 min-h-72 min-w-0 sm:h-80">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie data={stats?.graficoEstados || []} dataKey="cantidad" nameKey="estado" outerRadius={105} label>
									{(stats?.graficoEstados || []).map((_, index) => (
										<Cell key={index} fill={stateColors[index % stateColors.length]} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</Card>
			</div>
		</div>
	)
}

const Kpi = ({ icon: Icon, label, value }) => (
	<Card>
		<div className="flex items-center justify-between gap-3">
			<div>
				<p className="text-sm font-semibold text-zinc-500">{label}</p>
				<p className="mt-2 text-2xl font-black text-zinc-950">{value}</p>
			</div>
			<div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-teal-700">
				<Icon size={22} />
			</div>
		</div>
	</Card>
)

export default Dashboard
