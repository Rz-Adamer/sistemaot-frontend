import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, History, PackagePlus, Save, Wrench } from 'lucide-react'
import { toast } from 'react-toastify'
import ordenesApi from '../../api/ordenesApi'
import repuestosApi from '../../api/repuestosApi'
import tecnicosApi from '../../api/tecnicosApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { downloadOrderPdf } from '../../utils/orderPdf'
import { extractData, formatDateTime, formatMoney, statusClass } from '../../utils/formatters'

const estados = ['En revision', 'En reparacion', 'Listo para entregar', 'Entregado']
const soluciones = ['Mantenimiento correctivo', 'Reparación de impresoras', 'Recarga y gestión de consumibles', 'Instalación y configuración', 'Soporte técnico']
const emptyRepuesto = { equipo_orden_id: '', nombre_repuesto: '', tipo_repuesto: '', costo: '', cantidad: 1 }
const cleanText = (value) => {
	if (value === null || value === undefined) return ''
	const text = String(value).trim()
	return text.toLowerCase() === 'null' ? '' : text
}

const DetalleOrden = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [orden, setOrden] = useState(null)
	const [tecnicos, setTecnicos] = useState([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [repuestoSaving, setRepuestoSaving] = useState(false)
	const [form, setForm] = useState({ estado: 'En revision', mano_obra: 0, observacion_general: '' })
	const [equiposForm, setEquiposForm] = useState({})
	const [repuesto, setRepuesto] = useState(emptyRepuesto)

	const applyOrden = (data) => {
		setOrden(data)
		if (!data) return
		setForm({ estado: data.estado, mano_obra: data.mano_obra || 0, observacion_general: data.observacion_general || '' })
		setEquiposForm(Object.fromEntries((data.equipos_orden || []).map(equipo => [equipo.id, { tecnico_id: equipo.tecnico_id || '', diagnostico_especifico: cleanText(equipo.diagnostico_especifico), tipo_solucion: cleanText(equipo.tipo_solucion), costo_solucion: equipo.costo_solucion || 0 }])))
		setRepuesto(current => ({ ...current, equipo_orden_id: current.equipo_orden_id || data.equipos_orden?.[0]?.id || '' }))
	}

	const loadOrden = async () => {
		setLoading(true)
		try {
			const res = await ordenesApi.getOrden(id)
			applyOrden(res.data?.data)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let active = true
		Promise.all([ordenesApi.getOrden(id), tecnicosApi.getTecnicos({ limit: 100 })]).then(([ordenRes, tecnicosRes]) => {
			if (!active) return
			applyOrden(ordenRes.data?.data)
			setTecnicos(extractData(tecnicosRes))
		}).finally(() => active && setLoading(false))
		return () => { active = false }
	}, [id])

	const delivered = orden?.estado === 'Entregado'
	const canEditCosts = orden?.estado === 'En reparacion'
	const canAddRepuesto = orden?.estado === 'En reparacion'
	const subtotalRepuesto = (Number(repuesto.costo) || 0) * (Number(repuesto.cantidad) || 0)
	const totalServiciosPreview = useMemo(
		() => Object.values(equiposForm).reduce((total, equipo) => total + (Number(equipo.costo_solucion) || 0), 0),
		[equiposForm],
	)
	const totalPreview = useMemo(() => totalServiciosPreview + Number(orden?.total_repuestos || 0), [totalServiciosPreview, orden?.total_repuestos])

	const updateEquipoField = (equipoId, field, value) => {
		setEquiposForm(current => ({ ...current, [equipoId]: { ...current[equipoId], [field]: value } }))
	}

	const updateOrden = async (e) => {
		e.preventDefault()
		if (['Listo para entregar', 'Entregado'].includes(form.estado)) {
			const faltanDiagnosticos = orden.equipos_orden.some(equipo => !equiposForm[equipo.id]?.diagnostico_especifico?.trim())
			const faltanSoluciones = orden.equipos_orden.some(equipo => !equiposForm[equipo.id]?.tipo_solucion)
			const costosInvalidos = orden.equipos_orden.some(equipo => Number(equiposForm[equipo.id]?.costo_solucion || 0) < 0)
			if (faltanDiagnosticos) {
				toast.error('Todos los equipos deben tener diagnostico.')
				return
			}
			if (faltanSoluciones) {
				toast.error('Todos los equipos deben tener tipo de solucion.')
				return
			}
			if (costosInvalidos) {
				toast.error('El costo de solucion no puede ser negativo.')
				return
			}
		}
		setSaving(true)
		try {
			await Promise.all(orden.equipos_orden.map(equipo => ordenesApi.updateEquipo(id, equipo.id, equiposForm[equipo.id])))
			await ordenesApi.updateOrden(id, { ...form, mano_obra: totalServiciosPreview })
			await loadOrden()
			toast.success('Orden actualizada correctamente')
		} finally {
			setSaving(false)
		}
	}

	const addRepuesto = async (e) => {
		e.preventDefault()
		if (Number(repuesto.costo) <= 0 || Number(repuesto.cantidad) <= 0) {
			toast.error('El costo y la cantidad deben ser mayores a 0.')
			return
		}
		setRepuestoSaving(true)
		try {
			await repuestosApi.createRepuesto({ ...repuesto, costo: Number(repuesto.costo), cantidad: Number(repuesto.cantidad) })
			toast.success('Repuesto agregado correctamente')
			setRepuesto({ ...emptyRepuesto, equipo_orden_id: orden.equipos_orden?.[0]?.id || '' })
			await loadOrden()
		} finally {
			setRepuestoSaving(false)
		}
	}

	if (loading) return <div className="text-sm text-zinc-500">Cargando orden...</div>
	if (!orden) return <Card><div className="space-y-3 text-center"><h2 className="text-xl font-black">Orden no encontrada</h2><Button onClick={() => navigate('/ordenes')}>Volver a órdenes</Button></div></Card>

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
				<div>
					<Link to="/ordenes" className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-teal-700"><ArrowLeft size={16} /> Volver</Link>
					<div className="flex flex-wrap items-center gap-3">
						<h2 className="text-2xl font-black text-zinc-950 sm:text-3xl">Orden #{orden.id}</h2>
						<span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass(orden.estado)}`}>{orden.estado}</span>
					</div>
				</div>
				<div className="text-left sm:text-right"><div className="text-sm text-zinc-500">Total actual</div><div className="text-2xl font-black">{formatMoney(orden.precio_total)}</div></div>
			</div>

			<div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
				<div className="space-y-5">
					<Card className="space-y-5">
						<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
							<div><h3 className="text-lg font-black">Resumen de la orden</h3><p className="text-sm text-zinc-500">Información completa y costos actuales</p></div>
							<Button variant="secondary" onClick={() => downloadOrderPdf(orden)} className="w-full sm:w-auto"><Download size={16} /> Descargar PDF</Button>
						</div>
						<div className="grid gap-3 rounded-lg bg-zinc-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
							<Info label="Cliente" value={orden.clientes?.nombre} />
							<Info label="DNI/RUC" value={orden.clientes?.identificacion} />
							<Info label="Telefono" value={orden.clientes?.telefono} />
							<Info label="Numero de guia" value={orden.numero_guia} />
							<Info label="Ingreso" value={formatDateTime(orden.fecha_ingreso)} />
							<Info label="Finalización" value={formatDateTime(orden.fecha_finalizado)} />
							<Info label="Entrega" value={formatDateTime(orden.fecha_entrega)} />
							<Info label="Observación" value={orden.observacion_general} />
						</div>
					</Card>

					<Card className="space-y-4">
						<h3 className="flex items-center gap-2 text-lg font-black"><Wrench size={18} /> Equipos registrados</h3>
						{orden.equipos_orden?.map((equipo, index) => (
							<div key={equipo.id} className="rounded-lg border border-zinc-200 p-4">
								<div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><div className="font-black">Equipo {index + 1}: {equipo.tipo_equipo} {equipo.marca} {equipo.modelo}</div><span className="text-xs font-bold text-zinc-500">{equipo.serie || 'Sin serie'}</span></div>
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									<Info label="Técnico" value={equipo.tecnicos?.nombre} /><Info label="Accesorios" value={equipo.accesorios_entregados} /><Info label="Condiciones físicas" value={equipo.condiciones_fisicas} /><Info label="Motivo de ingreso" value={equipo.motivo_ingreso} /><Info label="Diagnóstico" value={cleanText(equipo.diagnostico_especifico)} />
									<Info label="Tipo de solución" value={cleanText(equipo.tipo_solucion)} />
									<Info label="Costo de solución" value={formatMoney(equipo.costo_solucion)} />
								</div>
							</div>
						))}
					</Card>

					<Card className="space-y-4">
						<h3 className="text-lg font-black">Repuestos y costos</h3>
						<div className="overflow-x-auto rounded-lg border border-zinc-200">
							<table className="w-full text-left text-sm"><thead className="bg-zinc-50 text-xs uppercase text-zinc-500"><tr><th className="px-3 py-3">Equipo</th><th className="px-3 py-3">Repuesto</th><th className="px-3 py-3">Tipo</th><th className="px-3 py-3">Cant.</th><th className="px-3 py-3">Unitario</th><th className="px-3 py-3">Subtotal</th></tr></thead>
								<tbody className="divide-y divide-zinc-200">{orden.repuestos?.map(item => <tr key={item.id}><td className="px-3 py-3">{item.equipo_nombre}</td><td className="px-3 py-3 font-bold">{item.nombre_repuesto}</td><td className="px-3 py-3">{item.tipo_repuesto || '-'}</td><td className="px-3 py-3">{item.cantidad}</td><td className="px-3 py-3">{formatMoney(item.precio_unitario)}</td><td className="px-3 py-3 font-bold">{formatMoney(item.subtotal)}</td></tr>)}
								{orden.repuestos?.length === 0 && <tr><td colSpan="6" className="px-3 py-8 text-center text-zinc-500">No hay repuestos agregados.</td></tr>}</tbody>
							</table>
						</div>
						<div className="grid gap-3 rounded-lg bg-zinc-50 p-4 sm:grid-cols-3"><Info label="Repuestos" value={formatMoney(orden.total_repuestos)} /><Info label="Servicios" value={formatMoney(orden.mano_obra)} /><Info label="Total sin IGV" value={formatMoney(orden.precio_total)} /></div>
					</Card>

					<Card className="space-y-3">
						<h3 className="flex items-center gap-2 text-lg font-black"><History size={18} /> Historial</h3>
						{orden.historial?.map(evento => <div key={evento.id} className="border-l-2 border-teal-400 pl-4"><div className="text-sm font-bold">{evento.descripcion}</div><div className="text-xs text-zinc-500">{formatDateTime(evento.creado_en)}</div></div>)}
						{orden.historial?.length === 0 && <div className="text-sm text-zinc-500">No hay eventos disponibles.</div>}
					</Card>
				</div>

				<div className="space-y-5">
					<Card>
						<h3 className="mb-4 flex items-center gap-2 text-lg font-black"><Save size={18} /> Actualizar orden</h3>
						<form onSubmit={updateOrden} className="grid gap-4">
							<div className="space-y-1.5"><label htmlFor="estado">Estado</label><select id="estado" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} disabled={delivered}>{estados.map(estado => <option key={estado}>{estado}</option>)}</select></div>
							{orden.equipos_orden?.map((equipo, index) => <div key={equipo.id} className="grid gap-3 rounded-lg border border-zinc-200 p-3">
								<div className="text-sm font-black">Equipo {index + 1}</div>
								<div className="space-y-1.5"><label>Técnico asignado</label><select value={equiposForm[equipo.id]?.tecnico_id || ''} onChange={e => updateEquipoField(equipo.id, 'tecnico_id', e.target.value)} disabled={delivered}><option value="">Sin asignar</option>{tecnicos.map(tecnico => <option key={tecnico.id} value={tecnico.id}>{tecnico.nombre}</option>)}</select></div>
								<div className="space-y-1.5"><label>Diagnóstico</label><textarea rows="3" value={equiposForm[equipo.id]?.diagnostico_especifico || ''} onChange={e => updateEquipoField(equipo.id, 'diagnostico_especifico', e.target.value)} disabled={delivered} /></div>
								<div className="space-y-1.5"><label>Tipo de solución</label><select value={equiposForm[equipo.id]?.tipo_solucion || ''} onChange={e => updateEquipoField(equipo.id, 'tipo_solucion', e.target.value)} disabled={delivered}><option value="">Seleccionar</option>{soluciones.map(solucion => <option key={solucion}>{solucion}</option>)}</select></div>
								<div className="space-y-1.5"><label>Costo de solución</label><input type="number" min="0" step="0.01" value={equiposForm[equipo.id]?.costo_solucion ?? 0} onChange={e => updateEquipoField(equipo.id, 'costo_solucion', e.target.value)} disabled={!canEditCosts || delivered} /></div>
							</div>)}
							<div className="rounded-lg bg-zinc-50 p-3 text-sm font-bold">Servicios: {formatMoney(totalServiciosPreview)} · Repuestos: {formatMoney(orden.total_repuestos)} · Total calculado: {formatMoney(totalPreview)}</div>
							<div className="space-y-1.5"><label htmlFor="observacion_general">Observación</label><textarea id="observacion_general" rows="4" value={form.observacion_general} onChange={e => setForm({ ...form, observacion_general: e.target.value })} disabled={delivered} /></div>
							<Button type="submit" disabled={saving || delivered} className="w-full">{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
						</form>
					</Card>

					<Card>
						<h3 className="mb-4 flex items-center gap-2 text-lg font-black"><PackagePlus size={18} /> Agregar repuesto</h3>
						<form onSubmit={addRepuesto} className="grid gap-3">
							{!canAddRepuesto && <div className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-700">Los repuestos solo pueden agregarse cuando la orden está en reparación.</div>}
							<div className="space-y-1.5"><label htmlFor="equipo_orden_id">Equipo</label><select id="equipo_orden_id" value={repuesto.equipo_orden_id} onChange={e => setRepuesto({ ...repuesto, equipo_orden_id: e.target.value })} disabled={!canAddRepuesto} required>{orden.equipos_orden?.map(equipo => <option key={equipo.id} value={equipo.id}>{equipo.tipo_equipo} {equipo.marca} {equipo.modelo}</option>)}</select></div>
							<Field label="Repuesto" value={repuesto.nombre_repuesto} onChange={e => setRepuesto({ ...repuesto, nombre_repuesto: e.target.value })} disabled={!canAddRepuesto} required />
							<Field label="Tipo / categoría" value={repuesto.tipo_repuesto} onChange={e => setRepuesto({ ...repuesto, tipo_repuesto: e.target.value })} disabled={!canAddRepuesto} />
							<div className="grid gap-3 sm:grid-cols-2"><Field label="Costo unitario" type="number" min="0.01" step="0.01" value={repuesto.costo} onChange={e => setRepuesto({ ...repuesto, costo: e.target.value })} disabled={!canAddRepuesto} required /><Field label="Cantidad" type="number" min="1" step="1" value={repuesto.cantidad} onChange={e => setRepuesto({ ...repuesto, cantidad: e.target.value })} disabled={!canAddRepuesto} required /></div>
							<div className="rounded-lg bg-zinc-50 p-3 text-sm font-bold">Subtotal: {formatMoney(subtotalRepuesto)}</div>
							<Button type="submit" variant="secondary" disabled={repuestoSaving || !canAddRepuesto} className="w-full">{repuestoSaving ? 'Agregando...' : 'Agregar repuesto'}</Button>
						</form>
					</Card>
				</div>
			</div>
		</div>
	)
}

const Info = ({ label, value }) => <div><div className="text-xs font-bold uppercase text-zinc-500">{label}</div><div className="mt-1 whitespace-pre-wrap text-sm font-semibold text-zinc-900">{value || '-'}</div></div>
const Field = ({ label, ...props }) => <div className="space-y-1.5"><label>{label}</label><input {...props} /></div>

export default DetalleOrden
