import { useEffect, useState } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import clientesApi from '../../api/clientesApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { extractData } from '../../utils/formatters'

const emptyForm = { identificacion: '', nombre: '', telefono: '', correo: '', direccion: '' }

const ListaClientes = () => {
	const [clientes, setClientes] = useState([])
	const [form, setForm] = useState(emptyForm)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	const loadClientes = async () => {
		setLoading(true)
		try {
			const res = await clientesApi.getClientes({ limit: 50 })
			setClientes(extractData(res))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let active = true
		clientesApi.getClientes({ limit: 50 }).then((res) => {
			if (active) setClientes(extractData(res))
		}).finally(() => {
			if (active) setLoading(false)
		})
		return () => {
			active = false
		}
	}, [])

	const handleChange = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }))

	const handleSubmit = async (e) => {
		e.preventDefault()
		setSaving(true)
		try {
			await clientesApi.createCliente(form)
			toast.success('Cliente creado correctamente')
			setForm(emptyForm)
			await loadClientes()
		} finally {
			setSaving(false)
		}
	}

	const handleDelete = async (cliente) => {
		if (!confirm(`¿Eliminar a ${cliente.nombre}?`)) return
		await clientesApi.deleteCliente(cliente.id)
		toast.success('Cliente eliminado correctamente')
		await loadClientes()
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
				<div>
					<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Base comercial</p>
					<h2 className="text-3xl font-black text-zinc-950">Clientes</h2>
				</div>
			</div>

			<div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
				<Card>
					<h3 className="mb-4 flex items-center gap-2 text-lg font-black">
						<Plus size={18} /> Nuevo cliente
					</h3>
					<form onSubmit={handleSubmit} className="grid gap-3">
						<Field label="DNI/RUC" name="identificacion" value={form.identificacion} onChange={handleChange} required />
						<Field label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
						<Field label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
						<Field label="Correo" name="correo" type="email" value={form.correo} onChange={handleChange} />
						<Field label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} />
						<Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear cliente'}</Button>
					</form>
				</Card>

				<Card>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="flex items-center gap-2 text-lg font-black">
							<Users size={18} /> Registrados
						</h3>
						<span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-600">{clientes.length}</span>
					</div>

					{loading ? (
						<div className="text-sm text-zinc-500">Cargando clientes...</div>
					) : (
						<div className="overflow-hidden rounded-lg border border-zinc-200">
							<table className="w-full text-left text-sm">
								<thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
									<tr>
										<th className="px-4 py-3">Cliente</th>
										<th className="px-4 py-3">Contacto</th>
										<th className="px-4 py-3 text-right">Acción</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-zinc-200 bg-white">
									{clientes.map((cliente) => (
										<tr key={cliente.id}>
											<td className="px-4 py-3">
												<div className="font-bold text-zinc-900">{cliente.nombre}</div>
												<div className="text-xs text-zinc-500">{cliente.identificacion}</div>
											</td>
											<td className="px-4 py-3 text-zinc-600">
												<div>{cliente.telefono || '-'}</div>
												<div className="text-xs">{cliente.correo || '-'}</div>
											</td>
											<td className="px-4 py-3 text-right">
												<Button variant="ghost" onClick={() => handleDelete(cliente)} title="Eliminar">
													<Trash2 size={16} />
												</Button>
											</td>
										</tr>
									))}
									{clientes.length === 0 && (
										<tr>
											<td colSpan="3" className="px-4 py-8 text-center text-zinc-500">No hay clientes registrados.</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					)}
				</Card>
			</div>
		</div>
	)
}

const Field = ({ label, ...props }) => (
	<div className="space-y-1.5">
		<label htmlFor={props.name}>{label}</label>
		<input id={props.name} {...props} />
	</div>
)

export default ListaClientes
