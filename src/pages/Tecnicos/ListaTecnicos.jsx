import { useEffect, useState } from 'react'
import { Plus, Trash2, Wrench } from 'lucide-react'
import { toast } from 'react-toastify'
import tecnicosApi from '../../api/tecnicosApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { extractData } from '../../utils/formatters'

const ListaTecnicos = () => {
	const [tecnicos, setTecnicos] = useState([])
	const [form, setForm] = useState({ nombre: '', telefono: '' })
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	const loadTecnicos = async () => {
		setLoading(true)
		try {
			const res = await tecnicosApi.getTecnicos({ limit: 50 })
			setTecnicos(extractData(res))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let active = true
		tecnicosApi.getTecnicos({ limit: 50 }).then((res) => {
			if (active) setTecnicos(extractData(res))
		}).finally(() => {
			if (active) setLoading(false)
		})
		return () => {
			active = false
		}
	}, [])

	const submit = async (e) => {
		e.preventDefault()
		setSaving(true)
		try {
			await tecnicosApi.createTecnico(form)
			toast.success('Técnico creado correctamente')
			setForm({ nombre: '', telefono: '' })
			await loadTecnicos()
		} finally {
			setSaving(false)
		}
	}

	const remove = async (tecnico) => {
		if (!confirm(`¿Eliminar a ${tecnico.nombre}?`)) return
		await tecnicosApi.deleteTecnico(tecnico.id)
		toast.success('Técnico eliminado correctamente')
		await loadTecnicos()
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Equipo técnico</p>
				<h2 className="text-3xl font-black text-zinc-950">Técnicos</h2>
			</div>

			<div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
				<Card>
					<h3 className="mb-4 flex items-center gap-2 text-lg font-black"><Plus size={18} /> Nuevo técnico</h3>
					<form onSubmit={submit} className="grid gap-3">
						<div className="space-y-1.5">
							<label htmlFor="nombre">Nombre</label>
							<input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
						</div>
						<div className="space-y-1.5">
							<label htmlFor="telefono">Teléfono</label>
							<input id="telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
						</div>
						<Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear técnico'}</Button>
					</form>
				</Card>

				<Card>
					<h3 className="mb-4 flex items-center gap-2 text-lg font-black"><Wrench size={18} /> Registrados</h3>
					{loading ? (
						<div className="text-sm text-zinc-500">Cargando técnicos...</div>
					) : (
						<div className="grid gap-3">
							{tecnicos.map((tecnico) => (
								<div key={tecnico.id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
									<div>
										<div className="font-bold">{tecnico.nombre}</div>
										<div className="text-sm text-zinc-500">{tecnico.telefono || 'Sin teléfono'}</div>
									</div>
									<Button variant="ghost" onClick={() => remove(tecnico)} title="Eliminar técnico">
										<Trash2 size={16} />
									</Button>
								</div>
							))}
							{tecnicos.length === 0 && <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500">No hay técnicos registrados.</div>}
						</div>
					)}
				</Card>
			</div>
		</div>
	)
}

export default ListaTecnicos
