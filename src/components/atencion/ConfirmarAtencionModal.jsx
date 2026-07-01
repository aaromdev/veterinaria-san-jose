import { Button } from '../ui/Button'

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-[#E8DDD0]/50 last:border-0">
      <span className="text-xs text-[#7A6555]">{label}</span>
      <span className="text-sm font-medium text-[#2C1A0E] text-right">{value || '—'}</span>
    </div>
  )
}

export function ConfirmarAtencionModal({ open, onClose, onConfirm, data, cita, saving }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-[#2C1A0E]">Confirmar atención</h3>

          <div>
            <InfoRow label="Cliente" value={`${cita?.cliente?.nombre || ''} ${cita?.cliente?.apellido || ''}`} />
            <InfoRow label="Mascota" value={cita?.mascota?.nombre} />
            <InfoRow label="Servicio" value={cita?.hueco?.servicio?.nombre} />
            <InfoRow label="Hora" value={`${cita?.hueco?.hora_inicio?.slice(0, 5)} - ${cita?.hueco?.hora_fin?.slice(0, 5)}`} />
          </div>

          <div className="border-t border-[#E8DDD0] pt-4">
            <h4 className="text-sm font-semibold text-[#2C1A0E] mb-2">Resumen de la receta</h4>
            <div className="bg-[#FAF7F2] rounded-lg p-3 space-y-2 text-sm">
              <div>
                <span className="text-xs font-medium text-[#7A6555]">Diagnóstico: </span>
                <span className="text-[#2C1A0E]">{data?.diagnostico}</span>
              </div>
              {data?.observaciones && (
                <div>
                  <span className="text-xs font-medium text-[#7A6555]">Observaciones: </span>
                  <span className="text-[#2C1A0E]">{data.observaciones}</span>
                </div>
              )}
              {data?.medicamentos?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#7A6555] mb-1">Medicamentos ({data.medicamentos.length}):</p>
                  <ul className="space-y-1">
                    {data.medicamentos.map((m) => (
                      <li key={m.id} className="text-[#2C1A0E]">
                        {m.nombre}{m.dosis ? ` — ${m.dosis}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-1">
                <span className="text-xs font-medium text-[#7A6555]">Firma: </span>
                <span className={data?.firmado ? 'text-[#4A7C59]' : 'text-[#7A6555]'}>
                  {data?.firmado ? '✓ Firmada' : 'Sin firmar'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={onConfirm} disabled={saving}>
              {saving ? 'Finalizando...' : 'Confirmar y finalizar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
