import { useEffect, useState } from 'react'
import { Activity, Banknote, ClipboardList, Timer } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import dashboardApi from '../api/dashboardApi'
import Card from '../components/UI/Card.jsx'
import { formatMoney } from '../utils/formatters'

const stateColors = ['#0f766e', '#d97706', '#059669', '#52525b']

const Dashboard = () => {
	const [stats, setStats] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true
		dashboardApi
			.getStats()
			.then((res) => mounted && setStats(res.data?.data))
			.finally(() => mounted && setLoading(false))
		return () => {
			mounted = false
		}
	}, [])

	const kpis = stats?.kpis || {}

	if (loading) return <div className="text-sm text-zinc-500">Cargando dashboard...</div>

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Resumen operativo</p>
				<h2 className="text-3xl font-black text-zinc-950">Dashboard</h2>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<Kpi icon={Banknote} label="Ingresos" value={formatMoney(kpis.ingresosTotales)} />
				<Kpi icon={ClipboardList} label="Órdenes" value={kpis.totalOrdenes ?? 0} />
				<Kpi icon={Activity} label="Activas" value={kpis.ordenesActivas ?? 0} />
				<Kpi icon={Timer} label="Ticket promedio" value={formatMoney(kpis.ticketPromedio)} />
			</div>

			<div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
				<Card>
					<h3 className="mb-4 text-lg font-black">Rendimiento mensual</h3>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={stats?.graficoRendimiento || []}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="mes" />
								<YAxis allowDecimals={false} />
								<Tooltip />
								<Bar dataKey="creadas" fill="#0f766e" radius={[6, 6, 0, 0]} />
								<Bar dataKey="entregadas" fill="#eab308" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</Card>

				<Card>
					<h3 className="mb-4 text-lg font-black">Estados</h3>
					<div className="h-80">
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
