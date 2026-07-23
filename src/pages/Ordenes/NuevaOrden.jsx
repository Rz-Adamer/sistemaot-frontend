import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Plus, Search, Trash2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import clientesApi from '../../api/clientesApi'
import ordenesApi from '../../api/ordenesApi'
import tecnicosApi from '../../api/tecnicosApi'
import Card from '../../components/UI/Card.jsx'
import Button from '../../components/UI/Button.jsx'
import { extractData } from '../../utils/formatters'

const createEmptyEquipo = () => ({
	tecnico_id: '',
	tipo_equipo: '',
	marca: '',
	modelo: '',
	serie: '',
	accesorios_entregados: '',
	condiciones_fisicas: '',
	motivo_ingreso: '',
})

const NuevaOrden = () => {
	const navigate = useNavigate()
	const [clientes, setClientes] = useState([])
	const [tecnicos, setTecnicos] = useState([])
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({ cliente_id: '', observacion_general: '', equipos: [createEmptyEquipo()] })

	useEffect(() => {
		Promise.all([clientesApi.getClientes({ limit: 100 }), tecnicosApi.getTecnicos({ limit: 100 })]).then(([clientesRes, tecnicosRes]) => {
			setClientes(extractData(clientesRes))
			setTecnicos(extractData(tecnicosRes))
		})
	}, [])

	const updateEquipo = (index, field, value) => {
		setForm((current) => ({
			...current,
			equipos: current.equipos.map((equipo, equipoIndex) => (equipoIndex === index ? { ...equipo, [field]: value } : equipo)),
		}))
	}

	const addEquipo = () => setForm(current => ({ ...current, equipos: [...current.equipos, createEmptyEquipo()] }))
	const removeEquipo = (index) => setForm(current => ({ ...current, equipos: current.equipos.filter((_, equipoIndex) => equipoIndex !== index) }))

	const submit = async (e) => {
		e.preventDefault()
		if (!form.cliente_id) {
			toast.error('Selecciona un cliente para crear la orden')
			return
		}
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

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-bold uppercase tracking-wide text-teal-700">Nueva recepcion</p>
				<h2 className="text-3xl font-black text-zinc-950">Crear orden</h2>
			</div>

			<form onSubmit={submit} className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
				<Card className="space-y-4">
					<h3 className="text-lg font-black">Datos generales</h3>
					<div className="space-y-1.5">
						<label htmlFor="cliente_id">Cliente</label>
						<ClienteAutocomplete
							clientes={clientes}
							value={form.cliente_id}
							onChange={(clienteId) => setForm({ ...form, cliente_id: clienteId })}
						/>
					</div>
					<div className="space-y-1.5">
						<label htmlFor="observacion_general">Observacion general</label>
						<textarea
							id="observacion_general"
							rows="5"
							value={form.observacion_general}
							onChange={(e) => setForm({ ...form, observacion_general: e.target.value })}
						/>
					</div>
				</Card>

				<Card className="space-y-4">
					<div className="flex items-center justify-between"><h3 className="text-lg font-black">Equipos recibidos</h3><Button variant="secondary" onClick={addEquipo}><Plus size={16} /> Agregar equipo</Button></div>
					{form.equipos.map((equipo, index) => (
						<div key={index} className="space-y-3 rounded-lg border border-zinc-200 p-4">
							<div className="flex items-center justify-between"><div className="font-black">Equipo {index + 1}</div>{form.equipos.length > 1 && <Button variant="ghost" onClick={() => removeEquipo(index)} title="Quitar equipo"><Trash2 size={16} /></Button>}</div>
							<div className="grid gap-3 md:grid-cols-2">
								<Field label="Tipo de equipo" value={equipo.tipo_equipo} onChange={(e) => updateEquipo(index, 'tipo_equipo', e.target.value)} required />
								<Field label="Marca" value={equipo.marca} onChange={(e) => updateEquipo(index, 'marca', e.target.value)} required />
								<Field label="Modelo" value={equipo.modelo} onChange={(e) => updateEquipo(index, 'modelo', e.target.value)} required />
								<Field label="Serie" value={equipo.serie} onChange={(e) => updateEquipo(index, 'serie', e.target.value)} />
								<div className="space-y-1.5">
									<label>Tecnico</label>
									<select value={equipo.tecnico_id} onChange={(e) => updateEquipo(index, 'tecnico_id', e.target.value)}>
										<option value="">Sin asignar</option>
										{tecnicos.map((tecnico) => <option key={tecnico.id} value={tecnico.id}>{tecnico.nombre}</option>)}
									</select>
								</div>
								<Field label="Accesorios" value={equipo.accesorios_entregados} onChange={(e) => updateEquipo(index, 'accesorios_entregados', e.target.value)} />
							</div>
							<div className="grid gap-3 md:grid-cols-2">
								<TextArea label="Condiciones fisicas" value={equipo.condiciones_fisicas} onChange={(e) => updateEquipo(index, 'condiciones_fisicas', e.target.value)} />
								<TextArea label="Motivo de ingreso" value={equipo.motivo_ingreso} onChange={(e) => updateEquipo(index, 'motivo_ingreso', e.target.value)} required />
							</div>
						</div>
					))}
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

const normalize = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const clienteLabel = (cliente) => (cliente ? `${cliente.nombre} - ${cliente.identificacion}` : '')

const ClienteAutocomplete = ({ clientes, value, onChange }) => {
	const wrapperRef = useRef(null)
	const selectedCliente = clientes.find((cliente) => String(cliente.id) === String(value))
	const [query, setQuery] = useState('')
	const [open, setOpen] = useState(false)

	useEffect(() => {
		const closeOnOutsideClick = (event) => {
			if (!wrapperRef.current?.contains(event.target)) setOpen(false)
		}
		document.addEventListener('mousedown', closeOnOutsideClick)
		return () => document.removeEventListener('mousedown', closeOnOutsideClick)
	}, [])

	const filteredClientes = useMemo(() => {
		const term = normalize(query)
		if (!term || (selectedCliente && query === clienteLabel(selectedCliente))) return clientes
		return clientes.filter((cliente) =>
			[cliente.nombre, cliente.identificacion, cliente.telefono, cliente.correo].some((field) => normalize(field).includes(term))
		)
	}, [clientes, query, selectedCliente])

	const selectCliente = (cliente) => {
		onChange(String(cliente.id))
		setQuery(clienteLabel(cliente))
		setOpen(false)
	}

	const clearCliente = () => {
		onChange('')
		setQuery('')
		setOpen(true)
	}

	return (
		<div ref={wrapperRef} className="relative">
			<div className="relative">
				<Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
				<input
					id="cliente_id"
					type="text"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value)
						onChange('')
						setOpen(true)
					}}
					onFocus={() => setOpen(true)}
					placeholder="Buscar por nombre, DNI/RUC, telefono o correo"
					className="pr-16 pl-9"
					autoComplete="off"
					role="combobox"
					aria-expanded={open}
					aria-controls="clientes-options"
				/>
				<div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
					{value && (
						<button type="button" onClick={clearCliente} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Limpiar cliente">
							<X size={14} />
						</button>
					)}
					<button type="button" onClick={() => setOpen((current) => !current)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Mostrar clientes">
						<ChevronDown size={16} />
					</button>
				</div>
			</div>
			{open && (
				<div id="clientes-options" className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-xl">
					{filteredClientes.length > 0 ? (
						filteredClientes.map((cliente) => (
							<button
								key={cliente.id}
								type="button"
								onClick={() => selectCliente(cliente)}
								className={`w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-teal-50 ${String(value) === String(cliente.id) ? 'bg-teal-50 text-teal-800' : 'text-zinc-700'}`}
							>
								<div className="font-bold text-zinc-900">{cliente.nombre}</div>
								<div className="text-xs text-zinc-500">{cliente.identificacion}{cliente.telefono ? ` - ${cliente.telefono}` : ''}</div>
							</button>
						))
					) : (
						<div className="px-3 py-6 text-center text-sm text-zinc-500">No se encontraron clientes.</div>
					)}
				</div>
			)}
		</div>
	)
}

const TextArea = ({ label, ...props }) => (
	<div className="space-y-1.5">
		<label>{label}</label>
		<textarea rows="4" {...props} />
	</div>
)

export default NuevaOrden
