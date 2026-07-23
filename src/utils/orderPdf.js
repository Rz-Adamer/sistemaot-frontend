import { jsPDF } from 'jspdf'
import { formatDateTime, formatMoney } from './formatters'

const STATE_LEVEL = { 'En revision': 1, 'En reparacion': 2, 'Listo para entregar': 3, Entregado: 4 }

export const downloadOrderPdf = (orden) => {
	const doc = new jsPDF()
	const level = STATE_LEVEL[orden.estado] || 1
	let y = 18

	const ensureSpace = (height = 12) => {
		if (y + height > 280) {
			doc.addPage()
			y = 18
		}
	}

	const title = (text) => {
		ensureSpace(14)
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(13)
		doc.text(text, 14, y)
		y += 8
	}

	const line = (label, value) => {
		ensureSpace(12)
		doc.setFontSize(9)
		doc.setFont('helvetica', 'bold')
		doc.text(`${label}:`, 14, y)
		doc.setFont('helvetica', 'normal')
		const lines = doc.splitTextToSize(String(value || '-'), 145)
		doc.text(lines, 48, y)
		y += Math.max(lines.length * 5, 6)
	}

	doc.setFillColor(24, 24, 27)
	doc.rect(0, 0, 210, 34, 'F')
	doc.setTextColor(255, 255, 255)
	doc.setFont('helvetica', 'bold')
	doc.setFontSize(18)
	doc.text('STI Servicio Tecnico', 14, 16)
	doc.setFontSize(10)
	doc.text(`Orden #${orden.id} | ${orden.estado}`, 14, 25)
	doc.setTextColor(24, 24, 27)
	y = 44

	title('Datos del cliente')
	line('Cliente', orden.clientes?.nombre)
	line('Identificacion', orden.clientes?.identificacion)
	line('Fecha de ingreso', formatDateTime(orden.fecha_ingreso))
	if (level === 4) line('Fecha de entrega', formatDateTime(orden.fecha_entrega))

	title('Equipos')
	orden.equipos_orden?.forEach((equipo, index) => {
		ensureSpace(40)
		line(`Equipo ${index + 1}`, `${equipo.tipo_equipo} ${equipo.marca} ${equipo.modelo}`)
		line('Serie', equipo.serie)
		line('Motivo de ingreso', equipo.motivo_ingreso)
		line('Accesorios', equipo.accesorios_entregados)
		line('Condiciones fisicas', equipo.condiciones_fisicas)
		if (level >= 2) {
			line('Tecnico', equipo.tecnicos?.nombre)
			line('Diagnostico', equipo.diagnostico_especifico)
			if (level >= 3) line('Tipo de solucion', equipo.tipo_solucion)
		}
	})

	if (level >= 2) {
		title('Detalle tecnico')
		line('Observaciones', orden.observacion_general)
	}

	if (level >= 3) {
		title('Repuestos y costos')
		orden.repuestos?.forEach(repuesto => {
			line(repuesto.equipo_nombre, `${repuesto.nombre_repuesto} | ${repuesto.cantidad} x ${formatMoney(repuesto.precio_unitario)} = ${formatMoney(repuesto.subtotal)}`)
		})
		line('Total repuestos', formatMoney(orden.total_repuestos))
		line('Mano de obra', formatMoney(orden.mano_obra))
		line('TOTAL', formatMoney(orden.precio_total))
	}

	ensureSpace(12)
	y += 6
	doc.setFontSize(8)
	doc.setTextColor(113, 113, 122)
	doc.text(`Documento generado: ${formatDateTime(new Date().toISOString())}`, 14, y)
	doc.save(`orden-${orden.id}.pdf`)
}
