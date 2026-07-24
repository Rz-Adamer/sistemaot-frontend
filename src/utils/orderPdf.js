import { jsPDF } from 'jspdf'
import { formatDateTime, formatMoney } from './formatters'

const STATE_LEVEL = { 'En revision': 1, 'En reparacion': 2, 'Listo para entregar': 3, Entregado: 4 }
const PAGE = { width: 210, height: 297, margin: 14 }
const COLORS = {
	ink: [24, 24, 27],
	muted: [113, 113, 122],
	line: [228, 228, 231],
	soft: [244, 244, 245],
	teal: [13, 148, 136],
	tealSoft: [240, 253, 250],
	amber: [245, 158, 11],
}

const textValue = (value) => String(value || '-')

export const downloadOrderPdf = (orden) => {
	const doc = new jsPDF()
	const level = STATE_LEVEL[orden.estado] || 1
	let y = 16

	const setColor = (color) => doc.setTextColor(...color)
	const fill = (color) => doc.setFillColor(...color)
	const stroke = (color) => doc.setDrawColor(...color)

	const addFooter = () => {
		const totalPages = doc.getNumberOfPages()
		for (let page = 1; page <= totalPages; page += 1) {
			doc.setPage(page)
			stroke(COLORS.line)
			doc.line(PAGE.margin, 282, PAGE.width - PAGE.margin, 282)
			doc.setFont('helvetica', 'normal')
			doc.setFontSize(8)
			setColor(COLORS.muted)
			doc.text(`Generado: ${formatDateTime(new Date().toISOString())}`, PAGE.margin, 288)
			doc.text(`Pagina ${page} de ${totalPages}`, PAGE.width - PAGE.margin, 288, { align: 'right' })
		}
	}

	const newPage = () => {
		doc.addPage()
		y = 18
	}

	const ensureSpace = (height = 18) => {
		if (y + height > 276) newPage()
	}

	const header = () => {
		fill(COLORS.ink)
		doc.rect(0, 0, PAGE.width, 38, 'F')
		fill(COLORS.teal)
		doc.roundedRect(PAGE.margin, 10, 9, 9, 2, 2, 'F')
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(17)
		doc.setTextColor(255, 255, 255)
		doc.text('STI Servicio Tecnico', 27, 17)
		doc.setFontSize(9)
		doc.setFont('helvetica', 'normal')
		doc.text('Orden de trabajo y constancia de servicio', 27, 25)

		fill(COLORS.tealSoft)
		doc.roundedRect(145, 10, 49, 16, 3, 3, 'F')
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(9)
		setColor(COLORS.teal)
		doc.text(`ORDEN #${orden.id}`, 169.5, 16, { align: 'center' })
		doc.setFontSize(7)
		doc.text(textValue(orden.estado).toUpperCase(), 169.5, 22, { align: 'center' })
		y = 50
	}

	const sectionTitle = (title) => {
		ensureSpace(14)
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(12)
		setColor(COLORS.ink)
		doc.text(title, PAGE.margin, y)
		fill(COLORS.teal)
		doc.rect(PAGE.margin, y + 2, 22, 1.2, 'F')
		y += 8
	}

	const card = (x, top, width, height) => {
		fill([255, 255, 255])
		stroke(COLORS.line)
		doc.roundedRect(x, top, width, height, 3, 3, 'FD')
	}

	const info = (label, value, x, top, width) => {
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(7.5)
		setColor(COLORS.muted)
		doc.text(label.toUpperCase(), x, top)
		doc.setFont('helvetica', 'normal')
		doc.setFontSize(9)
		setColor(COLORS.ink)
		const lines = doc.splitTextToSize(textValue(value), width)
		doc.text(lines, x, top + 5)
		return 8 + lines.length * 4
	}

	const detailsGrid = () => {
		sectionTitle('Datos generales')
		const top = y
		card(PAGE.margin, top, 182, 58)
		info('Cliente', orden.clientes?.nombre, 20, top + 9, 52)
		info('DNI/RUC', orden.clientes?.identificacion, 82, top + 9, 38)
		info('Telefono', orden.clientes?.telefono, 130, top + 9, 55)
		info('Nro. guia', orden.numero_guia, 20, top + 26, 52)
		info('Ingreso', formatDateTime(orden.fecha_ingreso), 82, top + 26, 38)
		info('Finalizacion', formatDateTime(orden.fecha_finalizado), 130, top + 26, 55)
		info('Entrega', formatDateTime(orden.fecha_entrega), 20, top + 43, 52)
		info('Observacion', orden.observacion_general, 82, top + 43, 103)
		y = top + 68
	}

	const rowText = (label, value, x, top, width) => {
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(8)
		setColor(COLORS.muted)
		doc.text(`${label}:`, x, top)
		doc.setFont('helvetica', 'normal')
		setColor(COLORS.ink)
		const lines = doc.splitTextToSize(textValue(value), width)
		doc.text(lines, x + 28, top)
		return Math.max(6, lines.length * 4.5)
	}

	const equipmentBlock = (equipo, index) => {
		const title = `${equipo.tipo_equipo || 'Equipo'} ${equipo.marca || ''} ${equipo.modelo || ''}`.trim()
		const estimatedHeight = level >= 3 ? 82 : 62
		ensureSpace(estimatedHeight)
		const top = y
		card(PAGE.margin, top, 182, estimatedHeight - 8)
		fill(COLORS.soft)
		doc.roundedRect(PAGE.margin, top, 182, 12, 3, 3, 'F')
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(10)
		setColor(COLORS.ink)
		doc.text(`Equipo ${index + 1}`, 20, top + 8)
		doc.setFont('helvetica', 'normal')
		doc.text(title || '-', 47, top + 8)
		let cursor = top + 22
		cursor += rowText('Serie', equipo.serie, 20, cursor, 130)
		cursor += rowText('Motivo', equipo.motivo_ingreso, 20, cursor, 130)
		cursor += rowText('Accesorios', equipo.accesorios_entregados, 20, cursor, 130)
		cursor += rowText('Condiciones', equipo.condiciones_fisicas, 20, cursor, 130)
		if (level >= 2) {
			cursor += rowText('Tecnico', equipo.tecnicos?.nombre, 20, cursor, 130)
			cursor += rowText('Diagnostico', equipo.diagnostico_especifico, 20, cursor, 130)
		}
		if (level >= 3) {
			cursor += rowText('Solucion', equipo.tipo_solucion, 20, cursor, 130)
			rowText('Costo', formatMoney(equipo.costo_solucion), 20, cursor, 130)
		}
		y = top + estimatedHeight
	}

	const table = (headers, rows, widths) => {
		ensureSpace(20)
		fill(COLORS.ink)
		doc.roundedRect(PAGE.margin, y, 182, 10, 2, 2, 'F')
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(7.5)
		doc.setTextColor(255, 255, 255)
		let x = PAGE.margin + 4
		headers.forEach((head, index) => {
			doc.text(head, x, y + 6.5)
			x += widths[index]
		})
		y += 10

		rows.forEach((row, rowIndex) => {
			const height = 9
			ensureSpace(height + 2)
			fill(rowIndex % 2 === 0 ? [255, 255, 255] : COLORS.soft)
			doc.rect(PAGE.margin, y, 182, height, 'F')
			doc.setFont('helvetica', 'normal')
			doc.setFontSize(7.5)
			setColor(COLORS.ink)
			x = PAGE.margin + 4
			row.forEach((cell, index) => {
				const lines = doc.splitTextToSize(textValue(cell), widths[index] - 3)
				doc.text(lines.slice(0, 2), x, y + 5)
				x += widths[index]
			})
			y += height
		})
		stroke(COLORS.line)
		doc.rect(PAGE.margin, y - rows.length * 9 - 10, 182, rows.length * 9 + 10)
		y += 8
	}

	const costsSummary = () => {
		ensureSpace(36)
		const top = y
		card(108, top, 88, 34)
		info('Total repuestos', formatMoney(orden.total_repuestos), 114, top + 9, 34)
		info('Servicios', formatMoney(orden.mano_obra), 154, top + 9, 34)
		fill(COLORS.teal)
		doc.roundedRect(108, top + 22, 88, 12, 2, 2, 'F')
		doc.setFont('helvetica', 'bold')
		doc.setFontSize(11)
		doc.setTextColor(255, 255, 255)
		doc.text('TOTAL SIN IGV', 114, top + 30)
		doc.text(formatMoney(orden.precio_total), 190, top + 30, { align: 'right' })
		y = top + 42
	}

	header()
	detailsGrid()

	sectionTitle('Equipos recibidos')
	orden.equipos_orden?.forEach(equipmentBlock)

	if (level >= 3) {
		sectionTitle('Repuestos')
		const repuestos = orden.repuestos || []
		if (repuestos.length > 0) {
			table(
				['Equipo', 'Repuesto', 'Tipo', 'Cant.', 'Unit.', 'Subtotal'],
				repuestos.map(item => [
					item.equipo_nombre,
					item.nombre_repuesto,
					item.tipo_repuesto || '-',
					item.cantidad,
					formatMoney(item.precio_unitario),
					formatMoney(item.subtotal),
				]),
				[48, 40, 28, 15, 24, 24],
			)
		} else {
			card(PAGE.margin, y, 182, 18)
			doc.setFont('helvetica', 'normal')
			doc.setFontSize(9)
			setColor(COLORS.muted)
			doc.text('No hay repuestos agregados.', 20, y + 11)
			y += 26
		}
		costsSummary()
	}

	addFooter()
	doc.save(`orden-${orden.id}.pdf`)
}
