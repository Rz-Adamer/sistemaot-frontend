import { ClipboardList, Gauge, History, MonitorCog, Users, UserRoundPlus, Wrench } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const ownerItems = [
	{ to: '/dashboard', label: 'Dashboard', icon: Gauge },
	{ to: '/ordenes', label: 'Órdenes', icon: ClipboardList },
	{ to: '/clientes', label: 'Clientes', icon: Users },
	{ to: '/tecnicos', label: 'Técnicos', icon: Wrench },
]

const adminItems = [
	{ to: '/admin/usuarios', label: 'Dueños', icon: UserRoundPlus },
	{ to: '/admin/logs', label: 'Auditoría', icon: History },
]

const Sidebar = () => {
	const { isAdmin } = useAuth()
	const items = isAdmin ? adminItems : ownerItems

	return (
		<aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-zinc-200 bg-zinc-950 text-white md:block">
			<div className="flex h-full flex-col">
				<div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
					<div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-400 text-zinc-950">
						<MonitorCog size={24} />
					</div>
					<div>
						<div className="text-lg font-black">SistemaOT</div>
						<div className="text-xs text-zinc-400">Gestión de taller</div>
					</div>
				</div>

				<nav className="flex flex-1 flex-col gap-1 px-4 py-5">
					{items.map(({ to, label, icon: Icon }) => (
						<NavLink
							key={to}
							to={to}
							className={({ isActive }) =>
								`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
									isActive ? 'bg-white text-zinc-950' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
								}`
							}
						>
							<Icon size={18} />
							{label}
						</NavLink>
					))}
				</nav>
			</div>
		</aside>
	)
}

export default Sidebar
