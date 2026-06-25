import { useNavigate } from 'react-router-dom'
import { Badge } from '../ui/Badge'

function formatFecha(fecha) {
  if (!fecha) return '--'
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatHora(hora) {
  if (!hora) return '--:--'
  return hora.slice(0, 5)
}

function puedeCancelar(estado, fechaHueco) {
  if (estado !== 'PROGRAMADA') return false
  const hoy = new Date()
  const citaFecha = new Date(fechaHueco + 'T00:00:00')
  const diffMs = citaFecha.getTime() - hoy.getTime()
  const diffHoras = diffMs / (1000 * 60 * 60)
  return diffHoras >= 48
}

export function CitaCard({ cita, onCancel }) {
  const navigate = useNavigate()
  const hueco = cita?.hueco
  const mascota = cita?.mascota

  const extras = (cita?.cita_hueco || [])
    .map((ch) => ch.hueco)
    .filter(Boolean)
    .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
  const horaInicio = extras[0]?.hora_inicio || hueco?.hora_inicio
  const horaFin = extras[extras.length - 1]?.hora_fin || hueco?.hora_fin

  return (
    <div
      className="bg-white border border-[#E8DDD0] rounded-lg p-4 hover:shadow-sm hover:border-[#C2570F]/30 transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/cliente/citas/${cita.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-[#C2570F]">
            {formatFecha(hueco?.fecha)} — {formatHora(horaInicio)} a {formatHora(horaFin)}
          </p>
        </div>
        <Badge estado={cita?.estado} />
      </div>

      <div className="space-y-1 mb-3">
        <p className="text-sm font-medium text-[#2C1A0E]">
          {mascota?.nombre || 'Mascota'}
        </p>
        <p className="text-xs text-[#7A6555]">
          {hueco?.servicio?.nombre || ''}
        </p>
        <p className="text-xs text-[#7A6555]">
          Sala: {hueco?.sala?.nombre || ''}
        </p>
      </div>

      {puedeCancelar(cita.estado, hueco?.fecha) && onCancel && (
        <button
          onClick={(e) => { e.stopPropagation(); onCancel(cita) }}
          className="text-xs font-medium text-[#B91C1C] hover:text-[#991B1B] transition-colors"
        >
          Cancelar cita
        </button>
      )}
    </div>
  )
}
