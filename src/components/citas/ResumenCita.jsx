import { Button } from '../ui/Button'

function formatFecha(fechaStr) {
  if (!fechaStr) return '--'
  const d = new Date(fechaStr + 'T00:00:00')
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatHora(hora) {
  if (!hora) return '--:--'
  return hora.slice(0, 5)
}

export function ResumenCita({ mascotas, servicio, huecos, onConfirm, loading }) {
  const firstHueco = huecos?.[0]
  const lastHueco = huecos?.[huecos.length - 1]

  return (
    <div className="bg-white border border-[#E8DDD0] rounded-lg p-6 space-y-4">
      <h3 className="text-sm font-semibold text-[#2C1A0E] uppercase tracking-wide">
        Resumen de la reserva
      </h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-[#7A6555]">
            Mascota{mascotas?.length !== 1 ? 's' : ''}
          </p>
          {mascotas?.length > 0 ? (
            <ul className="mt-1 space-y-0.5">
              {mascotas.map((m) => (
                <li key={m.id} className="text-sm font-medium text-[#2C1A0E]">
                  {m.nombre}
                  {m.especie_mascota && (
                    <span className="text-xs text-[#7A6555] ml-1">· {m.especie_mascota.nombre}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-medium text-[#2C1A0E]">---</p>
          )}
        </div>

        <div>
          <p className="text-xs text-[#7A6555]">Servicio</p>
          <p className="text-sm font-medium text-[#2C1A0E]">{servicio?.nombre || '---'}</p>
          {servicio?.precio && (
            <p className="text-xs text-[#7A6555]">
              S/ {Number(servicio.precio).toFixed(2)}
            </p>
          )}
        </div>

        {firstHueco && (
          <div>
            <p className="text-xs text-[#7A6555]">Horario</p>
            <p className="text-sm font-medium text-[#2C1A0E]">
              {formatFecha(firstHueco.fecha)}
              {' — '}
              {formatHora(firstHueco.hora_inicio)} a {formatHora(lastHueco.hora_fin)}
            </p>
            {firstHueco.sala && !lastHueco.sala?.id === firstHueco.sala?.id ? (
              <p className="text-xs text-[#7A6555]">
                Sala: {firstHueco.sala.nombre}
                {lastHueco.sala && lastHueco.sala.id !== firstHueco.sala.id && ` → ${lastHueco.sala.nombre}`}
              </p>
            ) : (
              firstHueco.sala && (
                <p className="text-xs text-[#7A6555]">Sala: {firstHueco.sala.nombre}</p>
              )
            )}
            {huecos.length > 1 && (
              <p className="text-xs text-[#7A6555] mt-1">
                {huecos.length} hueco{huecos.length !== 1 ? 's' : ''} consecutivos
              </p>
            )}
          </div>
        )}
      </div>

      <div className="text-xs text-[#7A6555] text-center bg-[#FAF7F2] rounded-lg py-2">
        {mascotas?.length || 0} mascota{(mascotas?.length || 0) !== 1 ? 's' : ''} × {huecos?.length || 0} hueco{(huecos?.length || 0) !== 1 ? 's' : ''} = {(mascotas?.length || 0) * (huecos?.length || 0)} cita{((mascotas?.length || 0) * (huecos?.length || 0)) !== 1 ? 's' : ''}
      </div>

      <Button className="w-full" onClick={onConfirm} disabled={loading}>
        {loading ? 'Reservando...' : 'Confirmar reserva'}
      </Button>
    </div>
  )
}
