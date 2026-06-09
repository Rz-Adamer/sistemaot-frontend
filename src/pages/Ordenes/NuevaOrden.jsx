import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import clientesApi from '../../api/clientesApi'
import ordenesApi from '../../api/ordenesApi'
import tecnicosApi from '../../api/tecnicosApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { extractData } from '../../utils/formatters'

const emptyEquipo = {
	tecnico_id: '',
	tipo_equipo: '',
	marca: '',
	modelo: '',
	serie: '',
	accesorios_entregados: '',
	condiciones_fisicas: '',
	motivo_ingreso: '',
}

const NuevaOrden = () => {
	const navigate = useNavigate()
	const [clientes, setClientes] = useState([])
	const [tecnicos, setTecnicos] = useState([])
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({ cliente_id: '', observacion_general: '', equipos: [emptyEquipo] })

	useEffect(() => {
		Promise.all([clientesApi.getClientes({ limit: 100 }), tecnicosApi.getTecnicos({ limit: 100 })]).then(([clientesRes, tecnicosRes]) => {
			setClientes(extractData(clientesRes))
			setTecnicos(extractData(tecnicosRes))
		})
	}, [])

	const updateEquipo = (field, value) => {
		setForm((current) => ({
			...current,
			equipos: current.equipos.map((equipo, index) => (index === 0 ? { ...equipo, [field]: value } : equipo)),
		}))
	}

	const submit = async (e) => {
		e.preventDefault()
		setSaving(true)
		try {
			const payload = {
				...form,
				equipos: form.equipos.map((equipo) => ({ ...equipo, tecnico_id: equipo.tecnico_id || null })),
			}
			await ordenesApi.createOrden(payload)
			toast.success('Orden creada correctamente')
			navigate('/ordenes')
		} finally {
			setSaving(false)
		}
	}

	const equipo = form.equipos[0]

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Nueva recepción</p>
				<h2 className="text-3xl font-black text-zinc-950">Crear orden</h2>
			</div>

			<form onSubmit={submit} className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
				<Card className="space-y-4">
					<h3 className="text-lg font-black">Datos generales</h3>
					<div className="space-y-1.5">
						<label htmlFor="cliente_id">Cliente</label>
						<select id="cliente_id" value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })} required>
							<option value="">Selecciona un cliente</option>
							{clientes.map((cliente) => (
								<option key={cliente.id} value={cliente.id}>{cliente.nombre} · {cliente.identificacion}</option>
							))}
						</select>
					</div>
					<div className="space-y-1.5">
						<label htmlFor="observacion_general">Observación general</label>
						<textarea
							id="observacion_general"
							rows="5"
							value={form.observacion_general}
							onChange={(e) => setForm({ ...form, observacion_general: e.target.value })}
						/>
					</div>
				</Card>

				<Card className="space-y-4">
					<h3 className="text-lg font-black">Equipo recibido</h3>
					<div className="grid gap-3 md:grid-cols-2">
						<Field label="Tipo de equipo" value={equipo.tipo_equipo} onChange={(e) => updateEquipo('tipo_equipo', e.target.value)} required />
						<Field label="Marca" value={equipo.marca} onChange={(e) => updateEquipo('marca', e.target.value)} required />
						<Field label="Modelo" value={equipo.modelo} onChange={(e) => updateEquipo('modelo', e.target.value)} required />
						<Field label="Serie" value={equipo.serie} onChange={(e) => updateEquipo('serie', e.target.value)} />
						<div className="space-y-1.5">
							<label htmlFor="tecnico">Técnico</label>
							<select id="tecnico" value={equipo.tecnico_id} onChange={(e) => updateEquipo('tecnico_id', e.target.value)}>
								<option value="">Sin asignar</option>
								{tecnicos.map((tecnico) => (
									<option key={tecnico.id} value={tecnico.id}>{tecnico.nombre}</option>
								))}
							</select>
						</div>
						<Field label="Accesorios" value={equipo.accesorios_entregados} onChange={(e) => updateEquipo('accesorios_entregados', e.target.value)} />
					</div>
					<div className="grid gap-3 md:grid-cols-2">
						<TextArea label="Condiciones físicas" value={equipo.condiciones_fisicas} onChange={(e) => updateEquipo('condiciones_fisicas', e.target.value)} />
						<TextArea label="Motivo de ingreso" value={equipo.motivo_ingreso} onChange={(e) => updateEquipo('motivo_ingreso', e.target.value)} required />
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="secondary" onClick={() => navigate('/ordenes')}>Cancelar</Button>
						<Button type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear orden'}</Button>
					</div>
				</Card>
			</form>
		</div>
	)
}

const Field = ({ label, ...props }) => (
	<div className="space-y-1.5">
		<label>{label}</label>
		<input {...props} />
	</div>
)

const TextArea = ({ label, ...props }) => (
	<div className="space-y-1.5">
		<label>{label}</label>
		<textarea rows="4" {...props} />
	</div>
)

export default NuevaOrden
