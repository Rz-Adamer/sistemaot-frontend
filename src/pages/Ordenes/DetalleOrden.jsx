import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, PackagePlus, Save } from 'lucide-react'
import { toast } from 'react-toastify'
import ordenesApi from '../../api/ordenesApi'
import repuestosApi from '../../api/repuestosApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { formatDateTime, formatMoney, statusClass } from '../../utils/formatters'

const estados = ['En revisión', 'En reparación', 'Listo para entrega', 'Entregado']
const soluciones = [
	'Mantenimiento correctivo',
	'Reparación de impresoras',
	'Recarga y gestión de consumibles',
	'Instalación y configuración',
	'Soporte técnico',
]

const DetalleOrden = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [orden, setOrden] = useState(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [repuestoSaving, setRepuestoSaving] = useState(false)
	const [form, setForm] = useState({ estado: 'En revisión', precio_total: 0, observacion_general: '', tipo_solucion: '' })
	const [repuesto, setRepuesto] = useState({ equipo_orden_id: '', nombre_repuesto: '', tipo_repuesto: '', costo: '', cantidad: 1 })

	const loadOrden = async () => {
		setLoading(true)
		try {
			const res = await ordenesApi.getOrden(id)
			const data = res.data?.data
			setOrden(data)
			if (data) {
				setForm({
					estado: data.estado || 'En revisión',
					precio_total: data.precio_total || 0,
					observacion_general: data.observacion_general || '',
					tipo_solucion: '',
				})
				setRepuesto((current) => ({ ...current, equipo_orden_id: data.equipos_orden?.[0]?.id || '' }))
			}
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let active = true
		ordenesApi.getOrden(id).then((res) => {
			if (!active) return
			const data = res.data?.data
			setOrden(data)
			if (data) {
				setForm({
					estado: data.estado || 'En revisión',
					precio_total: data.precio_total || 0,
					observacion_general: data.observacion_general || '',
					tipo_solucion: '',
				})
				setRepuesto((current) => ({ ...current, equipo_orden_id: data.equipos_orden?.[0]?.id || '' }))
			}
		}).finally(() => {
			if (active) setLoading(false)
		})
		return () => {
			active = false
		}
	}, [id])

	const updateOrden = async (e) => {
		e.preventDefault()
		setSaving(true)
		try {
			await ordenesApi.updateOrden(id, {
				...form,
				precio_total: Number(form.precio_total) || 0,
				tipo_solucion: form.tipo_solucion || undefined,
			})
			toast.success('Orden actualizada correctamente')
			await loadOrden()
		} finally {
			setSaving(false)
		}
	}

	const addRepuesto = async (e) => {
		e.preventDefault()
		setRepuestoSaving(true)
		try {
			await repuestosApi.createRepuesto({
				...repuesto,
				costo: Number(repuesto.costo) || 0,
				cantidad: Number(repuesto.cantidad) || 1,
			})
			toast.success('Repuesto agregado correctamente')
			setRepuesto({ equipo_orden_id: orden.equipos_orden?.[0]?.id || '', nombre_repuesto: '', tipo_repuesto: '', costo: '', cantidad: 1 })
			await loadOrden()
		} finally {
			setRepuestoSaving(false)
		}
	}

	if (loading) return <div className="text-sm text-zinc-500">Cargando orden...</div>
	if (!orden) {
		return (
			<Card>
				<div className="space-y-3 text-center">
					<h2 className="text-xl font-black">Orden no encontrada</h2>
					<Button onClick={() => navigate('/ordenes')}>Volver a órdenes</Button>
				</div>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
				<div>
					<Link to="/ordenes" className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-teal-700">
						<ArrowLeft size={16} /> Volver
					</Link>
					<div className="flex flex-wrap items-center gap-3">
						<h2 className="text-3xl font-black text-zinc-950">Orden #{orden.id}</h2>
						<span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass(orden.estado)}`}>{orden.estado}</span>
					</div>
				</div>
				<div className="text-left sm:text-right">
					<div className="text-sm text-zinc-500">Total actual</div>
					<div className="text-2xl font-black">{formatMoney(orden.precio_total)}</div>
				</div>
			</div>

			<div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
				<Card className="space-y-5">
					<div>
						<h3 className="text-lg font-black">Información</h3>
						<p className="text-sm text-zinc-500">Ingreso: {formatDateTime(orden.fecha_ingreso)}</p>
					</div>

					<div className="grid gap-3 rounded-lg bg-zinc-50 p-4 sm:grid-cols-2">
						<Info label="Cliente" value={orden.clientes?.nombre || '-'} />
						<Info label="Identificación" value={orden.clientes?.identificacion || '-'} />
						<Info label="Finalizado" value={formatDateTime(orden.fecha_finalizado)} />
						<Info label="Entregado" value={formatDateTime(orden.fecha_entrega)} />
					</div>

					<div className="space-y-3">
						<h4 className="font-black">Equipos</h4>
						{orden.equipos_orden?.map((equipo) => (
							<div key={equipo.id} className="rounded-lg border border-zinc-200 p-4">
								<div className="font-black">{equipo.tipo_equipo} {equipo.marca} {equipo.modelo}</div>
								<div className="mt-1 text-sm text-zinc-500">Serie: {equipo.serie || '-'}</div>
								<div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
									<Info label="Motivo" value={equipo.motivo_ingreso || '-'} />
									<Info label="Condición" value={equipo.condiciones_fisicas || '-'} />
									<Info label="Accesorios" value={equipo.accesorios_entregados || '-'} />
									<Info label="Diagnóstico" value={equipo.diagnostico_especifico || '-'} />
								</div>
							</div>
						))}
					</div>
				</Card>

				<div className="space-y-5">
					<Card>
						<h3 className="mb-4 flex items-center gap-2 text-lg font-black"><Save size={18} /> Actualizar orden</h3>
						<form onSubmit={updateOrden} className="grid gap-3">
							<div className="space-y-1.5">
								<label htmlFor="estado">Estado</label>
								<select id="estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
									{estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
								</select>
							</div>
							<div className="space-y-1.5">
								<label htmlFor="precio_total">Precio total</label>
								<input id="precio_total" type="number" min="0" step="0.01" value={form.precio_total} onChange={(e) => setForm({ ...form, precio_total: e.target.value })} />
							</div>
							<div className="space-y-1.5">
								<label htmlFor="tipo_solucion">Tipo de solución</label>
								<select id="tipo_solucion" value={form.tipo_solucion} onChange={(e) => setForm({ ...form, tipo_solucion: e.target.value })}>
									<option value="">Sin cambio</option>
									{soluciones.map((solucion) => <option key={solucion} value={solucion}>{solucion}</option>)}
								</select>
							</div>
							<div className="space-y-1.5">
								<label htmlFor="observacion_general">Observación</label>
								<textarea id="observacion_general" rows="4" value={form.observacion_general} onChange={(e) => setForm({ ...form, observacion_general: e.target.value })} />
							</div>
							<Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
						</form>
					</Card>

					<Card>
						<h3 className="mb-4 flex items-center gap-2 text-lg font-black"><PackagePlus size={18} /> Agregar repuesto</h3>
						<form onSubmit={addRepuesto} className="grid gap-3">
							<div className="space-y-1.5">
								<label htmlFor="equipo_orden_id">Equipo</label>
								<select id="equipo_orden_id" value={repuesto.equipo_orden_id} onChange={(e) => setRepuesto({ ...repuesto, equipo_orden_id: e.target.value })} required>
									{orden.equipos_orden?.map((equipo) => (
										<option key={equipo.id} value={equipo.id}>{equipo.tipo_equipo} {equipo.marca} {equipo.modelo}</option>
									))}
								</select>
							</div>
							<div className="grid gap-3 sm:grid-cols-2">
								<Field label="Repuesto" value={repuesto.nombre_repuesto} onChange={(e) => setRepuesto({ ...repuesto, nombre_repuesto: e.target.value })} required />
								<Field label="Tipo" value={repuesto.tipo_repuesto} onChange={(e) => setRepuesto({ ...repuesto, tipo_repuesto: e.target.value })} />
								<Field label="Costo" type="number" min="0" step="0.01" value={repuesto.costo} onChange={(e) => setRepuesto({ ...repuesto, costo: e.target.value })} required />
								<Field label="Cantidad" type="number" min="1" step="1" value={repuesto.cantidad} onChange={(e) => setRepuesto({ ...repuesto, cantidad: e.target.value })} required />
							</div>
							<Button type="submit" variant="secondary" disabled={repuestoSaving}>{repuestoSaving ? 'Agregando...' : 'Agregar repuesto'}</Button>
						</form>
					</Card>
				</div>
			</div>
		</div>
	)
}

const Info = ({ label, value }) => (
	<div>
		<div className="text-xs font-bold uppercase text-zinc-500">{label}</div>
		<div className="mt-1 text-sm font-semibold text-zinc-900">{value}</div>
	</div>
)

const Field = ({ label, ...props }) => (
	<div className="space-y-1.5">
		<label>{label}</label>
		<input {...props} />
	</div>
)

export default DetalleOrden
