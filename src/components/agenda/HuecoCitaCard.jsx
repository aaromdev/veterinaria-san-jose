import { useNavigate } from 'react-router-dom'
import { Badge } from '../ui/Badge'

function getServiceAccent(nombre) {
  if (!nombre) return { border: 'border-l-[#C2570F]', text: 'text-[#C2570F]', dot: 'bg-[#C2570F]', light: 'bg-[#FFF3EB]' }
  const n = nombre.toLowerCase()
  if (n.includes('consulta')) return { border: 'border-l-[#C2570F]', text: 'text-[#C2570F]', dot: 'bg-[#C2570F]', light: 'bg-[#FFF3EB]' }
  if (n.includes('vacun') || n.includes('vaci')) return { border: 'border-l-[#4A7C59]', text: 'text-[#4A7C59]', dot: 'bg-[#4A7C59]', light: 'bg-[#F0F7F2]' }
  if (n.includes('baño') || n.includes('bano') || n.includes('esté')) return { border: 'border-l-[#8B5CF6]', text: 'text-[#8B5CF6]', dot: 'bg-[#8B5CF6]', light: 'bg-[#F5F3FF]' }
  if (n.includes('cirug') || n.includes('quir')) return { border: 'border-l-[#EF4444]', text: 'text-[#EF4444]', dot: 'bg-[#EF4444]', light: 'bg-[#FEF2F2]' }
  return { border: 'border-l-[#7A6555]', text: 'text-[#7A6555]', dot: 'bg-[#7A6555]', light: 'bg-[#FAF7F2]' }
}

const serviceEmoji = {
  consulta: '\u{1FA9A}',
  vacun: '\u{1F489}',
  'ba\u00F1o': '\u{1F6C1}',
  'est\u00E9': '\u{2702}\uFE0F',
  cirug: '\u{1F52C}',
  quir: '\u{1F52C}',
}

function getEmoji(nombre) {
  if (!nombre) return '\u{1F4CB}'
  const n = nombre.toLowerCase()
  for (const [key, emoji] of Object.entries(serviceEmoji)) {
    if (n.includes(key)) return emoji
  }
  return '\u{1F4CB}'
}

export function HuecoCitaCard({ cita, style }) {
  const navigate = useNavigate()

  const formatHora = (hora) => {
    if (!hora) return '--:--'
    return hora.slice(0, 5)
  }

  if (!cita) return null

  const horaInicio = cita.hueco?.hora_inicio
  const extras = (cita?.cita_hueco || [])
    .map((ch) => ch.hueco)
    .filter(Boolean)
    .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
  const horaFin = extras.length > 0
    ? extras[extras.length - 1].hora_fin
    : cita.hueco?.hora_fin
  const tieneMultiples = (cita?.cita_hueco || []).length > 1
  const servicioNombre = cita.hueco?.servicio?.nombre || ''
  const accent = getServiceAccent(servicioNombre)
  const emoji = getEmoji(servicioNombre)

  return (
    <div
      className={`bg-white border border-[#E8DDD0] border-l-4 ${accent.border} rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex items-stretch gap-0 overflow-hidden`}
      style={style}
      onClick={() => navigate(`/admin/citas/${cita.id}`)}
    >
      <div className="flex items-center gap-3 px-4 py-3.5 min-w-0 flex-1">
        <div className="text-center min-w-[52px] shrink-0">
          <p className="text-sm font-bold text-[#2C1A0E] leading-tight">{formatHora(horaInicio)}</p>
          <p className="text-[11px] text-[#7A6555]">{formatHora(horaFin)}</p>
          {tieneMultiples && (
            <span className="inline-block text-[9px] text-[#C2570F] bg-[#FFF3EB] rounded-full px-1.5 mt-0.5">
              x2
            </span>
          )}
        </div>

        <div className="w-px self-stretch bg-[#E8DDD0]" />

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-base leading-none shrink-0">{emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold truncate ${accent.text} group-hover:text-[#2C1A0E] transition-colors`}>
                {servicioNombre}
              </span>
              <Badge estado={cita.estado} />
            </div>
            <p className="text-sm font-medium text-[#2C1A0E] truncate mt-0.5">
              {cita.mascota?.nombre || 'Mascota'}
            </p>
            <p className="text-xs text-[#7A6555] truncate">
              {cita.cliente?.nombre || ''} {cita.cliente?.apellido || ''}
              <span className="text-[#BFB5A8] mx-1">·</span>
              {cita.hueco?.sala?.nombre || ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
