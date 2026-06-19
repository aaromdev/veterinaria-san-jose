import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { LIMITES, validarLongitud } from '../../lib/validaciones'

const VACIO = { nombre: '', dosis: '', indicaciones: '' }

export function MedicamentoModal({ open, onClose, onAgregar }) {
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleAgregar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    let err = validarLongitud(form.nombre, LIMITES.MEDICAMENTO_NOMBRE, 'El nombre')
    if (err) e.nombre = err
    err = validarLongitud(form.dosis, LIMITES.MEDICAMENTO_DOSIS, 'La dosis')
    if (err) e.dosis = err
    setErrors(e)
    if (Object.keys(e).length > 0) return
    onAgregar({ ...form })
    setForm(VACIO)
    setErrors({})
  }

  const handleClose = () => {
    setForm(VACIO)
    setErrors({})
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#FFF3EB] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-[#C2570F]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="6" y="2" width="8" height="16" rx="2" />
              <circle cx="10" cy="8" r="1.5" />
              <path d="M10 10V14" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#2C1A0E]">Agregar medicamento</h2>
            <p className="text-xs text-[#7A6555]">Registra un medicamento en la receta</p>
          </div>
        </div>

        <Input label="Nombre del medicamento" value={form.nombre} onChange={handleChange('nombre')} error={errors.nombre} placeholder="Ej: Amoxicilina" maxLength={LIMITES.MEDICAMENTO_NOMBRE} />
        <div className="mt-4">
          <Input label="Dosis" value={form.dosis} onChange={handleChange('dosis')} error={errors.dosis} placeholder="Ej: 500mg cada 12h" maxLength={LIMITES.MEDICAMENTO_DOSIS} />
        </div>
        <div className="mt-4">
          <Input label="Indicaciones" value={form.indicaciones} onChange={handleChange('indicaciones')} placeholder="Ej: Tomar después de comer" />
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleAgregar} className="flex-1">
            Agregar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
