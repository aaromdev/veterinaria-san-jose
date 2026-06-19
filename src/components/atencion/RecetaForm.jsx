import { useState } from 'react'
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

export function RecetaForm({ onFinalizar, saving, error }) {
  const { can } = usePermisos()
  const [diagnostico, setDiagnostico] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [firmada, setFirmada] = useState(false)
  const [medicamentos, setMedicamentos] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [errors, setErrors] = useState({})

  const puedeEscribirReceta = can('receta.escribir')

  const agregarMedicamento = (med) => {
    setMedicamentos((prev) => [...prev, { ...med, id: Date.now() }])
    setModalOpen(false)
  }

  const eliminarMedicamento = (med) => {
    setMedicamentos((prev) => prev.filter((m) => m.id !== med.id))
  }

  const handleFinalizar = () => {
    const e = {}
    if (!diagnostico.trim()) e.diagnostico = 'El diagnóstico es obligatorio'
    if (medicamentos.length === 0) e.medicamentos = 'Agrega al menos un medicamento'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    if (typeof onFinalizar === 'function') {
      onFinalizar({ diagnostico, observaciones, medicamentos, firmado: firmada })
    }
  }

  return (
    <div className="bg-white border border-[#E8DDD0] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#2C1A0E]">Atención clínica</h3>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#7A6555] mb-1.5">Diagnóstico *</label>
        <textarea
          value={diagnostico}
          onChange={(e) => setDiagnostico(sanitize(e.target.value, 'text'))}
          placeholder="Describe el diagnóstico del paciente"
          rows={3}
          disabled={!puedeEscribirReceta}
          className={`w-full border border-[#E8DDD0] rounded-lg px-3 py-2 text-sm text-[#2C1A0E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C2570F] focus:border-transparent placeholder:text-[#7A6555] resize-none ${errors.diagnostico ? 'border-[#B91C1C]' : ''}`}
        />
        {errors.diagnostico && <p className="text-xs text-[#B91C1C] mt-1">{errors.diagnostico}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-[#7A6555] mb-1.5">Observaciones</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(sanitize(e.target.value, 'text'))}
          placeholder="Notas adicionales (opcional)"
          rows={2}
          disabled={!puedeEscribirReceta}
          className="w-full border border-[#E8DDD0] rounded-lg px-3 py-2 text-sm text-[#2C1A0E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C2570F] focus:border-transparent placeholder:text-[#7A6555] resize-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-[#7A6555]">Medicamentos {errors.medicamentos && <span className="text-[#B91C1C] ml-1">*</span>}</label>
          {puedeEscribirReceta && (
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-medium text-[#C2570F] hover:text-[#A8480C] transition-colors"
            >
              + Agregar medicamento
            </button>
          )}
        </div>
        {medicamentos.length === 0 ? (
          <p className="text-xs text-[#7A6555] py-2">No hay medicamentos registrados</p>
        ) : (
          <div className="space-y-2">
            {medicamentos.map((m) => (
              <MedicamentoItem key={m.id} item={m} onRemove={eliminarMedicamento} />
            ))}
          </div>
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
