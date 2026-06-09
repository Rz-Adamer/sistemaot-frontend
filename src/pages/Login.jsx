import { useState } from 'react'
import { MonitorCog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import { isAdmin } from '../utils/formatters'
import Button from '../components/UI/Button.jsx'

const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const auth = useAuth()
	const navigate = useNavigate()

	const submit = async (e) => {
		e.preventDefault()
		setLoading(true)
		const res = await auth.login(email, password)
		setLoading(false)
		if (res.ok) navigate(isAdmin(res.user) ? '/admin/logs' : '/dashboard')
	}

	return (
		<div className="grid min-h-screen grid-cols-1 bg-zinc-950 text-white lg:grid-cols-[1.1fr_0.9fr]">
			<section className="flex min-h-[42vh] flex-col justify-between px-8 py-8 lg:min-h-screen lg:px-14">
				<div className="flex items-center gap-3">
					<div className="grid h-12 w-12 place-items-center rounded-lg bg-teal-400 text-zinc-950">
						<MonitorCog size={26} />
					</div>
					<div>
						<div className="text-xl font-black">SistemaOT</div>
						<div className="text-sm text-zinc-400">Gestión de órdenes técnicas</div>
					</div>
				</div>

				<div className="max-w-2xl py-12">
					<p className="mb-4 text-sm font-bold uppercase tracking-wide text-teal-300">Talleres, clientes y equipos</p>
					<h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">
						Control operativo para recibir, diagnosticar y entregar equipos.
					</h1>
					<p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
						Administra clientes, técnicos, órdenes de trabajo, estados y auditoría desde un panel claro y rápido.
					</p>
				</div>

				<div className="grid grid-cols-3 gap-3 text-sm text-zinc-300">
					<div className="rounded-lg border border-white/10 p-4">Órdenes</div>
					<div className="rounded-lg border border-white/10 p-4">Clientes</div>
					<div className="rounded-lg border border-white/10 p-4">Auditoría</div>
				</div>
			</section>

			<section className="flex items-center justify-center bg-white px-6 py-10 text-zinc-950">
				<div className="w-full max-w-md">
					<h2 className="text-2xl font-black">Iniciar sesión</h2>
					<p className="mt-2 text-sm text-zinc-500">Ingresa con tu cuenta de administrador o dueño.</p>

					<form onSubmit={submit} className="mt-8 space-y-4">
						<div className="space-y-2">
							<label htmlFor="email">Correo</label>
							<input
								id="email"
								type="email"
								placeholder="correo@taller.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="password">Contraseña</label>
							<input
								id="password"
								type="password"
								placeholder="Tu contraseña"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<Button type="submit" disabled={loading} className="w-full">
							{loading ? 'Ingresando...' : 'Ingresar'}
						</Button>
					</form>
				</div>
			</section>
		</div>
	)
}

export default Login
