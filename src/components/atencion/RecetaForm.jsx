import { useState, useMemo } from 'react'
import { Button } from '../ui/Button'
import { sanitize } from '../../lib/validaciones'
import { MedicamentoModal } from './MedicamentoModal'
import { usePermisos } from '../../hooks/usePermisos'

function MedicamentoItem({ item, onRemove }) {
  return (
    <div className="flex items-start justify-between p-3 bg-[#FAF7F2] rounded-lg">
      <div>
        <p className="text-sm font-medium text-[#2C1A0E]">{item.nombre}</p>
        {item.dosis && <p className="text-xs text-[#7A6555]">Dosis: {item.dosis}</p>}
        {item.indicaciones && <p className="text-xs text-[#7A6555]">Ind: {item.indicaciones}</p>}
      </div>
      <button
        onClick={() => onRemove(item)}
        className="text-[#B91C1C] hover:text-[#991B1B] transition-colors shrink-0 ml-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4L12 12M12 4L4 12" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export function RecetaForm({ cita, onFinalizar, saving, error }) {
  const { can } = usePermisos()
  const puedeEscribirReceta = can('receta.escribir')

  const mascotas = useMemo(
    () => cita?.cita_mascota?.map(cm => cm.mascota).filter(Boolean) || [],
    [cita]
  )

  const [mascotaIndex, setMascotaIndex] = useState(0)
  const [porMascota, setPorMascota] = useState(() => {
    const map = {}
    ;(mascotas).forEach(m => {
      map[m.id] = { diagnostico: '', observaciones: '', medicamentos: [] }
    })
    return map
  })
  const [firmada, setFirmada] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)

  const mascotaActual = mascotas[mascotaIndex]
  const dataActual = porMascota[mascotaActual?.id] || { diagnostico: '', observaciones: '', medicamentos: [] }

  const actualizar = (campo, valor) => {
    setPorMascota(prev => ({
      ...prev,
      [mascotaActual.id]: { ...prev[mascotaActual.id], [campo]: valor }
    }))
  }

  const agregarMedicamento = (med) => {
    actualizar('medicamentos', [...dataActual.medicamentos, { ...med, id: Date.now() }])
    setModalOpen(false)
  }

  const eliminarMedicamento = (med) => {
    actualizar('medicamentos', dataActual.medicamentos.filter(m => m.id !== med.id))
  }

  const handleFinalizar = () => {
    const e = {}
    let allOk = true

    mascotas.forEach(m => {
      const d = porMascota[m.id]
      if (!d?.diagnostico?.trim()) {
        e[`diag_${m.id}`] = `Diagnóstico para ${m.nombre} es obligatorio`
        allOk = false
      }
      if (!d?.medicamentos?.length) {
        e[`meds_${m.id}`] = `Agrega al menos un medicamento para ${m.nombre}`
        allOk = false
      }
    })

    setErrors(e)
    if (!allOk) {
      setGlobalError('Completa todos los campos obligatorios para cada mascota')
      return
    }

    setGlobalError(null)
    if (typeof onFinalizar === 'function') {
      const mascotasAtencion = mascotas.map(m => ({
        id_mascota: m.id,
        diagnostico: (porMascota[m.id]?.diagnostico || '').trim(),
        observaciones: (porMascota[m.id]?.observaciones || '').trim() || null,
        medicamentos: (porMascota[m.id]?.medicamentos || []).map(med => ({
          medicamento: (med.nombre || '').trim(),
          dosis: (med.dosis || '').trim() || null,
          indicaciones: (med.indicaciones || '').trim() || null,
        })),
      }))
      onFinalizar({ mascotas_atencion: mascotasAtencion, firmado: firmada })
    }
  }

  if (mascotas.length === 0) {
    return (
      <div className="bg-white border border-[#E8DDD0] rounded-xl p-5">
        <p className="text-sm text-[#7A6555]">No hay mascotas asociadas a esta cita.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E8DDD0] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#2C1A0E]">Atención clínica</h3>
        {mascotas.length > 1 && (
          <span className="text-xs text-[#7A6555] bg-[#FAF7F2] px-2 py-1 rounded-full">
            {mascotaIndex + 1} de {mascotas.length}
          </span>
        )}
      </div>

      {mascotas.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {mascotas.map((m, i) => {
            const completo = porMascota[m.id]?.diagnostico?.trim() && porMascota[m.id]?.medicamentos?.length > 0
            return (
              <button
                key={m.id}
                onClick={() => setMascotaIndex(i)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  i === mascotaIndex
                    ? 'bg-[#C2570F] text-white'
                    : completo
                      ? 'bg-[#E8F5E9] text-[#166534]'
                      : 'bg-[#FAF7F2] text-[#7A6555] hover:bg-[#F0EDE6]'
                }`}
              >
                {m.nombre}
                {completo && <span className="ml-1">✓</span>}
              </button>
            )
          })}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[#7A6555] mb-1.5">
          Diagnóstico para {mascotaActual?.nombre} *
        </label>
        <textarea
          value={dataActual.diagnostico}
          onChange={(e) => actualizar('diagnostico', sanitize(e.target.value, 'text'))}
          placeholder="Describe el diagnóstico del paciente"
          rows={3}
          disabled={!puedeEscribirReceta}
          className={`w-full border border-[#E8DDD0] rounded-lg px-3 py-2 text-sm text-[#2C1A0E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C2570F] focus:border-transparent placeholder:text-[#7A6555] resize-none ${errors[`diag_${mascotaActual?.id}`] ? 'border-[#B91C1C]' : ''}`}
        />
        {errors[`diag_${mascotaActual?.id}`] && (
          <p className="text-xs text-[#B91C1C] mt-1">{errors[`diag_${mascotaActual?.id}`]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-[#7A6555] mb-1.5">
          Observaciones para {mascotaActual?.nombre}
        </label>
        <textarea
          value={dataActual.observaciones}
          onChange={(e) => actualizar('observaciones', sanitize(e.target.value, 'text'))}
          placeholder="Notas adicionales (opcional)"
          rows={2}
          disabled={!puedeEscribirReceta}
          className="w-full border border-[#E8DDD0] rounded-lg px-3 py-2 text-sm text-[#2C1A0E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C2570F] focus:border-transparent placeholder:text-[#7A6555] resize-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-[#7A6555]">
            Medicamentos para {mascotaActual?.nombre}
            {errors[`meds_${mascotaActual?.id}`] && <span className="text-[#B91C1C] ml-1">*</span>}
          </label>
          {puedeEscribirReceta && (
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-medium text-[#C2570F] hover:text-[#A8480C] transition-colors"
            >
              + Agregar medicamento
            </button>
          )}
        </div>
        {dataActual.medicamentos.length === 0 ? (
          <p className="text-xs text-[#7A6555] py-2">No hay medicamentos registrados para {mascotaActual?.nombre}</p>
        ) : (
          <div className="space-y-2">
            {dataActual.medicamentos.map((m) => (
              <MedicamentoItem key={m.id} item={m} onRemove={eliminarMedicamento} />
            ))}
          </div>
        )}
        {errors[`meds_${mascotaActual?.id}`] && (
          <p className="text-xs text-[#B91C1C] mt-1">{errors[`meds_${mascotaActual?.id}`]}</p>
        )}
      </div>

      {puedeEscribirReceta && (
        <>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={firmada}
              onChange={(e) => setFirmada(e.target.checked)}
              className="w-4 h-4 rounded border-[#E8DDD0] text-[#C2570F] focus:ring-[#C2570F]"
            />
            <span className="text-sm text-[#2C1A0E]">Marcar como firmada</span>
          </label>

          {globalError && <p className="text-xs text-[#B91C1C]">{globalError}</p>}
          {error && <p className="text-xs text-[#B91C1C]">{error}</p>}

          <Button
            className="w-full"
            onClick={handleFinalizar}
            disabled={saving}
          >
            {saving ? 'Finalizando...' : 'Finalizar atención'}
          </Button>
        </>
      )}

      <MedicamentoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAgregar={agregarMedicamento}
      />
    </div>
  )
}
