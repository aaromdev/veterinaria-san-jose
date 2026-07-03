import { useMemo } from 'react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { usePermisos } from '../../hooks/usePermisos'

function timestampCita(fecha, hora) {
  // Construye la fecha de la cita como Peru (UTC-5) y devuelve timestamp absoluto
  return new Date(`${fecha}T${(hora || '').slice(0, 5)}:00.000-05:00`).getTime()
}

function diffMinutos(fecha, hora) {
  const ts = timestampCita(fecha, hora)
  if (isNaN(ts)) return null
  return Math.round((ts - Date.now()) / 60000)
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-[#E8DDD0]/50 last:border-0">
      <span className="text-xs text-[#7A6555]">{label}</span>
      <span className="text-sm font-medium text-[#2C1A0E] text-right">{value || '—'}</span>
    </div>
  )
}

export function InfoCitaPanel({
  cita,
  pagoInfo,
  onRegistrarPago,
  onIniciarAtencion,
  onCancelarCita,
  onGenerarPdf,
  generando,
  errorPdf,
}) {
  const { can } = usePermisos()

  const formatFecha = (fecha) => {
    if (!fecha) return '—'
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatHora = (hora) => hora?.slice(0, 5) || '--:--'

  const mascotas = cita?.cita_mascota?.map(cm => cm.mascota).filter(Boolean) || []
  const precioBase = Number(cita?.hueco?.servicio?.precio || 0)
  const precioTotal = Number(cita?.precio_total || precioBase)

  const extras = (cita?.cita_hueco || [])
    .map((ch) => ch.hueco)
    .filter(Boolean)
    .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
  const horaInicio = extras[0]?.hora_inicio || cita?.hueco?.hora_inicio
  const horaFin = extras[extras.length - 1]?.hora_fin || cita?.hueco?.hora_fin

  const minutosParaCita = useMemo(() => {
    if (!cita?.hueco?.fecha || !horaInicio) return null
    return diffMinutos(cita.hueco.fecha, horaInicio)
  }, [cita, horaInicio])

  const puedePagar = minutosParaCita !== null && minutosParaCita <= 60
  const puedeIniciar = minutosParaCita !== null && minutosParaCita <= 5

  return (
    <div className="bg-white border border-[#E8DDD0] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#2C1A0E]">Detalle de cita</h3>
        <Badge estado={cita?.estado} />
      </div>

      <div>
        <InfoRow label="Cliente" value={`${cita?.cliente?.nombre || ''} ${cita?.cliente?.apellido || ''}`} />
        <InfoRow label="Mascota(s)" value={mascotas.length > 0 ? mascotas.map(m => m.nombre).join(', ') : '—'} />
        <InfoRow label="Servicio" value={cita?.hueco?.servicio?.nombre} />
        <InfoRow label="Sala" value={cita?.hueco?.sala?.nombre} />
        <InfoRow label="Fecha" value={formatFecha(cita?.hueco?.fecha)} />
        <InfoRow label="Hora" value={`${formatHora(horaInicio)} - ${formatHora(horaFin)}`} />
        <InfoRow label="Teléfono" value={cita?.cliente?.telefono} />
        {precioTotal > 0 && <InfoRow label="Total" value={`S/ ${precioTotal.toFixed(2)}`} />}
      </div>

      {cita?.estado === 'PROGRAMADA' && can('pago.registrar') && (
        <div className="space-y-2 pt-2 border-t border-[#E8DDD0]">
          <Button
            className="w-full"
            onClick={onRegistrarPago}
            disabled={!puedePagar}
          >
            Marcar presencia y registrar pago
          </Button>
          {!puedePagar && minutosParaCita !== null && (
            <p className="text-xs text-[#7A6555] text-center">
              Solo se puede marcar y pagar estando a 1 hora de la hora de inicio de la cita.
            </p>
          )}
          <Button
            variant="destructive"
            className="w-full"
            onClick={onCancelarCita}
          >
            Cancelar cita
          </Button>
        </div>
      )}

      {cita?.estado === 'EN_ESPERA' && (
        <div className="space-y-3 pt-2 border-t border-[#E8DDD0]">
          {pagoInfo && (
            <div className="bg-[#FAF7F2] rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium text-[#7A6555] uppercase tracking-wide">Pago registrado</p>
              <p className="text-sm font-semibold text-[#2C1A0E]">S/ {Number(pagoInfo.monto || 0).toFixed(2)}</p>
              <p className="text-xs text-[#7A6555]">{pagoInfo.metodo_pago?.nombre}</p>
              {precioTotal > 0 && Number(pagoInfo.monto) > precioTotal && (
                <p className="text-xs font-medium text-green-700">
                  Vuelto: S/ {(Number(pagoInfo.monto) - precioTotal).toFixed(2)}
                </p>
              )}
            </div>
          )}
          {can('atencion.iniciar') && (
            <Button className="w-full" onClick={onIniciarAtencion} disabled={!puedeIniciar}>
              Iniciar atención
            </Button>
          )}
          {!puedeIniciar && minutosParaCita !== null && (
            <p className="text-xs text-[#7A6555] text-center">
              Solo puede iniciar la atencion a 5 minutos de la hora de inicio de la cita.
            </p>
          )}
        </div>
      )}

      {cita?.estado === 'FINALIZADA' && (
        <div className="pt-2 border-t border-[#E8DDD0]">
          <Button
            variant="secondary"
            className="w-full"
            onClick={onGenerarPdf}
            disabled={generando}
          >
            {generando ? 'Generando PDF...' : 'Ver / Generar PDF receta'}
          </Button>
          {errorPdf && (
            <p className="text-xs text-[#B91C1C] mt-2 text-center">{errorPdf}</p>
          )}
        </div>
      )}
    </div>
  )
}
