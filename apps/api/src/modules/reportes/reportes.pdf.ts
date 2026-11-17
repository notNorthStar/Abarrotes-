import PDFDocument from 'pdfkit'
import type { ReporteSemanal } from './reportes.service'

const color = { tinta: '#1A1916', piedra: '#6B675F', linea: '#E4E1DA', crema: '#F3F1EC' }
const fecha = (valor: string) =>
  new Date(valor).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'short',
    timeStyle: 'short',
  })
const pesos = (valor: string) => `$${valor}`

/** Tablas paginadas con filas indivisibles y encabezados repetidos. No depende del navegador. */
export function generarPdf(reporte: ReporteSemanal): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
      info: { Title: `Reporte semanal - ${reporte.sucursal.nombre}`, Author: 'Abarrotes+' },
    })
    const partes: Buffer[] = []
    doc.on('data', (parte: Buffer) => partes.push(parte))
    doc.on('end', () => resolve(Buffer.concat(partes)))
    doc.on('error', reject)
    const ancho = doc.page.width - 80
    const limite = doc.page.height - 60
    const cabecera = () => {
      doc
        .fillColor(color.tinta)
        .font('Helvetica-Bold')
        .fontSize(18)
        .text('Abarrotes+ | Reporte semanal', 40, 40)
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(color.piedra)
        .text(
          `${reporte.sucursal.nombre} | ${reporte.semana.inicio} al ${reporte.semana.fin}`,
          40,
          65,
        )
      doc
        .moveTo(40, 86)
        .lineTo(40 + ancho, 86)
        .strokeColor(color.linea)
        .stroke()
      doc.y = 100
    }
    const pagina = () => {
      doc.addPage()
      cabecera()
    }
    cabecera()
    doc
      .fillColor(color.tinta)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Ingresos netos por forma de pago')
    doc.font('Helvetica').fontSize(10)
    for (const [etiqueta, monto] of [
      ['Efectivo (descontando cambio)', reporte.ingresos.EFECTIVO],
      ['Tarjeta', reporte.ingresos.TARJETA],
      ['Transferencia', reporte.ingresos.TRANSFERENCIA],
      ['Total de ingresos', reporte.ingresos.total],
    ]) {
      doc.text(`${etiqueta}: ${pesos(monto)}`, { lineGap: 4 })
    }
    doc.moveDown()
    const tabla = (
      titulo: string,
      columnas: string[],
      proporciones: number[],
      filas: string[][],
    ) => {
      const anchuras = proporciones.map((p) => ancho * p)
      const encabezados = () => {
        doc.font('Helvetica-Bold').fontSize(12).fillColor(color.tinta).text(titulo, 40, doc.y)
        doc.y += 8
        const y = doc.y
        doc.rect(40, y, ancho, 28).fill(color.crema)
        let x = 40
        columnas.forEach((columna, i) => {
          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor(color.tinta)
            .text(columna, x + 6, y + 7, { width: anchuras[i] - 12 })
          x += anchuras[i]
        })
        doc.y = y + 28
      }
      if (doc.y + 80 > limite) pagina()
      encabezados()
      if (filas.length === 0) {
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(color.piedra)
          .text('Sin operaciones en esta semana.', 46, doc.y + 10)
        doc.y += 20
      }
      for (const fila of filas) {
        doc.font('Helvetica').fontSize(9)
        const alto = Math.max(
          30,
          ...fila.map(
            (texto, i) => doc.heightOfString(texto, { width: anchuras[i] - 12, lineGap: 2 }) + 14,
          ),
        )
        if (doc.y + alto > limite) {
          pagina()
          encabezados()
        }
        const y = doc.y
        doc.font('Helvetica').fontSize(9)
        let x = 40
        fila.forEach((texto, i) => {
          doc
            .fillColor(color.tinta)
            .text(texto, x + 6, y + 7, { width: anchuras[i] - 12, lineGap: 2 })
          x += anchuras[i]
        })
        doc
          .moveTo(40, y + alto)
          .lineTo(40 + ancho, y + alto)
          .strokeColor(color.linea)
          .stroke()
        doc.y = y + alto
      }
      doc.y += 22
    }
    tabla(
      'Ventas',
      ['Fecha / operación', 'Responsable', 'Ingresos por método', 'Total'],
      [0.21, 0.23, 0.39, 0.17],
      reporte.ventas.map((v) => [
        `${fecha(v.fecha)}\nVenta #${v.id}`,
        `${v.usuario.nombre}\n${v.usuario.usuario}`,
        `Efectivo: ${pesos(v.pagos.EFECTIVO)}\nTarjeta: ${pesos(v.pagos.TARJETA)}\nTransferencia: ${pesos(v.pagos.TRANSFERENCIA)}`,
        pesos(v.total),
      ]),
    )
    tabla(
      'Pagos a proveedores',
      ['Fecha / operación', 'Responsable', 'Proveedor / detalle', 'Monto'],
      [0.21, 0.23, 0.39, 0.17],
      reporte.pagosProveedor.map((p) => [
        `${fecha(p.fecha)}\nPago #${p.id}`,
        `${p.usuario.nombre}\n${p.usuario.usuario}`,
        `${p.proveedor}\n${p.metodo}${p.comentario ? `\n${p.comentario}` : ''}`,
        pesos(p.monto),
      ]),
    )
    const movimientos = (titulo: string, filas: ReporteSemanal['mermas']) =>
      tabla(
        titulo,
        ['Fecha / operación', 'Responsable', 'Producto / detalle', 'Cantidad'],
        [0.21, 0.23, 0.39, 0.17],
        filas.map((m) => [
          `${fecha(m.fecha)}\nMovimiento #${m.id}`,
          `${m.usuario.nombre}\n${m.usuario.usuario}`,
          `${m.producto.nombre}\n${m.producto.codigoBarras}\n${m.motivo === 'DANADO' ? 'Dañado' : m.motivo === 'CADUCADO' ? 'Caducado' : m.tipo === 'ALTA' ? 'Alta' : 'Entrada'}${m.comentario ? `\n${m.comentario}` : ''}`,
          `${m.cantidad}\n${m.producto.unidad === 'KILO' ? 'kg' : 'pzas'}`,
        ]),
      )
    movimientos('Productos agregados', reporte.productosAgregados)
    movimientos('Mermas (salidas de inventario)', reporte.mermas)
    const rango = doc.bufferedPageRange()
    for (let i = rango.start; i < rango.start + rango.count; i++) {
      doc.switchToPage(i)
      doc.page.margins.bottom = 0
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(color.piedra)
        .text(`Abarrotes+ | Página ${i + 1} de ${rango.count}`, 40, doc.page.height - 38, {
          width: ancho,
          align: 'right',
          lineBreak: false,
        })
    }
    doc.end()
  })
}
