function formatHora(hora) {
  if (!hora) return '--:--'
  return hora.slice(0, 5)
}

function getPeriodo(hora) {
  const h = parseInt(hora.split(':')[0], 10)
  if (h < 12) return 'mañana'
  if (h < 18) return 'tarde'
  return 'noche'
}

const PERIODOS = [
  {
    key: 'mañana',
    label: 'Mañana',
    rango: '8:00 — 11:59',
    bgBar: 'bg-[#FEF3C7]',
    borderBar: 'border-[#F59E0B]/30',
    dotColor: 'bg-[#F59E0B]',
  },
  {
    key: 'tarde',
    label: 'Tarde',
    rango: '12:00 — 17:59',
    bgBar: 'bg-[#FFEDD5]',
    borderBar: 'border-[#C2570F]/20',
    dotColor: 'bg-[#C2570F]',
  },
  {
    key: 'noche',
    label: 'Noche',
    rango: '18:00 — 19:59',
    bgBar: 'bg-[#E0E7FF]',
    borderBar: 'border-[#6366F1]/20',
    dotColor: 'bg-[#6366F1]',
  },
]

export function HuecoPicker({ agrupadosPorFecha, selected, onChange, maxSeleccion }) {
  const fechas = Object.keys(agrupadosPorFecha || {}).sort()
  if (fechas.length === 0) return null

  const huecos = agrupadosPorFecha[fechas[0]]
  const selectedSet = new Set(selected || [])
  const canSelectMore = (selected || []).length < (maxSeleccion || 2)

  const handleClick = (h) => {
    const prev = selected || []
    const max = maxSeleccion || 2
    const clickedIdx = huecos.indexOf(h)

    if (selectedSet.has(h.id)) {
      onChange(prev.filter((id) => id !== h.id))
      return
    }

    if (prev.length === 0) {
      onChange([h.id])
      return
    }

    const selectedIndices = prev
      .map((id) => huecos.findIndex((x) => x.id === id))
      .filter((i) => i !== -1)
      .sort((a, b) => a - b)

    const minIdx = selectedIndices[0]
    const maxIdx = selectedIndices[selectedIndices.length - 1]
    const isAdjacent = clickedIdx === minIdx - 1 || clickedIdx === maxIdx + 1

    if (isAdjacent && prev.length < max) {
      const allIndices = [...selectedIndices, clickedIdx].sort((a, b) => a - b)
      onChange(allIndices.map((i) => huecos[i].id))
      return
    }

    onChange([h.id])
  }

  const agrupadosPorPeriodo = {}
  for (const p of PERIODOS) {
    agrupadosPorPeriodo[p.key] = []
  }
  for (const h of huecos) {
    const p = getPeriodo(h.hora_inicio)
    agrupadosPorPeriodo[p]?.push(h)
  }

  return (
    <div className="space-y-4">
      {PERIODOS.map((periodo) => {
        const slots = agrupadosPorPeriodo[periodo.key]
        if (!slots || slots.length === 0) return null

        return (
          <div key={periodo.key}>
            <div
              className={`rounded-xl border ${periodo.borderBar} overflow-hidden transition-shadow duration-200`}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#E8DDD0]/60">
                <span className={`w-2 h-2 rounded-full ${periodo.dotColor} shrink-0`} />
                <span className="text-sm font-semibold text-[#2C1A0E]">
                  {periodo.label}
                </span>
                <span className="text-xs text-[#7A6555]">{periodo.rango}</span>
                <span className="ml-auto text-xs text-[#7A6555] tabular-nums">
                  {slots.length} cupo{slots.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="p-3 bg-white">
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((h) => {
                    const activo = selectedSet.has(h.id)
                    const isMaxed = !activo && !canSelectMore
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => { if (!isMaxed) handleClick(h) }}
                        disabled={isMaxed}
                        className={`
                          group relative text-xs rounded-lg border transition-all duration-200
                          ${isMaxed
                            ? 'border-[#E8DDD0] bg-[#FAF7F2] text-[#7A6555] opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                          }
                          ${
                            activo
                              ? 'border-[#C2570F] bg-[#C2570F] text-white shadow-sm shadow-[#C2570F]/20 scale-105'
                              : isMaxed
                                ? ''
                                : 'border-[#E8DDD0] bg-white text-[#2C1A0E] hover:border-[#C2570F]/40 hover:bg-[#FAF7F2] hover:shadow-sm hover:-translate-y-0.5'
                          }
                        `}
                      >
                        <div className="px-2.5 py-1.5">
                          <span className="font-medium tabular-nums">
                            {formatHora(h.hora_inicio)}
                          </span>
                          <span className={`mx-1 ${activo ? 'opacity-60' : 'opacity-40'}`}>—</span>
                          <span className="tabular-nums">{formatHora(h.hora_fin)}</span>
                          {!activo && h.sala && (
                            <span className="block text-[10px] leading-tight opacity-50 mt-0.5">
                              {h.sala.nombre}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
