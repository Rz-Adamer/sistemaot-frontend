import { useState } from 'react'
import { UserRoundPlus } from 'lucide-react'
import { toast } from 'react-toastify'
import authApi from '../../api/authApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'

const initialForm = { email: '', password: '', nombre_taller: '', rol: 'dueño' }

const AdminUsuarios = () => {
	const [form, setForm] = useState(initialForm)
	const [saving, setSaving] = useState(false)

	const submit = async (e) => {
		e.preventDefault()
		setSaving(true)
		try {
			await authApi.registerOwner(form)
			toast.success('Dueño creado correctamente')
			setForm(initialForm)
		} finally {
			setSaving(false)
		}
	}

	const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }))

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Administración</p>
				<h2 className="text-3xl font-black text-zinc-950">Dueños de taller</h2>
			</div>

			<Card className="max-w-2xl">
				<h3 className="mb-4 flex items-center gap-2 text-lg font-black"><UserRoundPlus size={18} /> Crear acceso</h3>
				<form onSubmit={submit} className="grid gap-4">
					<div className="space-y-1.5">
						<label htmlFor="nombre_taller">Nombre del taller</label>
						<input id="nombre_taller" name="nombre_taller" value={form.nombre_taller} onChange={update} placeholder="Taller Central" />
					</div>
					<div className="space-y-1.5">
						<label htmlFor="email">Correo</label>
						<input id="email" name="email" type="email" value={form.email} onChange={update} placeholder="dueno@taller.com" required />
					</div>
					<div className="space-y-1.5">
						<label htmlFor="password">Contraseña temporal</label>
						<input id="password" name="password" type="password" value={form.password} onChange={update} minLength="6" required />
					</div>
					<div className="space-y-1.5">
						<label htmlFor="rol">Rol</label>
						<select id="rol" name="rol" value={form.rol} onChange={update}>
							<option value="dueño">Dueño</option>
							<option value="admin">Administrador</option>
						</select>
					</div>
					<Button type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear usuario'}</Button>
				</form>
			</Card>
		</div>
	)
}

export default AdminUsuarios
