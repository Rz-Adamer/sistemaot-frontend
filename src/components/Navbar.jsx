import { LogOut, Shield, UserRound } from 'lucide-react'
import useAuth from '../hooks/useAuth.js'
import Button from './UI/Button.jsx'

const Navbar = () => {
	const { user, logout, roleLabel } = useAuth()

	return (
		<header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
			<div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Panel de trabajo</p>
					<h1 className="text-lg font-bold text-zinc-950">{user?.nombre_taller || 'SistemaOT'}</h1>
				</div>

				<div className="flex items-center gap-3">
					<div className="hidden items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 sm:flex">
						{roleLabel === 'Administrador' ? <Shield size={16} /> : <UserRound size={16} />}
						<span>{roleLabel}</span>
					</div>
					<Button variant="secondary" onClick={logout} title="Cerrar sesión">
						<LogOut size={16} />
						<span className="hidden sm:inline">Salir</span>
					</Button>
				</div>
			</div>
		</header>
	)
}

export default Navbar
