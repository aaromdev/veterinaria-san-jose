import { useState, useMemo } from 'react'
import { CatalogoLayout } from '../../../components/catalogos/CatalogoLayout'
import { CatalogoModal } from '../../../components/catalogos/CatalogoModal'
import { ToggleActivoBtn } from '../../../components/catalogos/ToggleActivoBtn'
import { Badge } from '../../../components/ui/Badge'
import { BarraBusqueda } from '../../../components/ui/BarraBusqueda'
import { Input } from '../../../components/ui/Input'
import { useMedicamentosAll } from '../../../hooks/useMedicamentosAll'
import { useBuscarMedicamentos } from '../../../hooks/useBuscarMedicamentos'
import { LIMITES, validarLongitud } from '../../../lib/validaciones'

const FORM_VACIO = {
  nombre: '',
  descripcion: '',
  concentracion: '',
  presentacion: '',
}

function validar(f) {
  const e = {}
  if (!f.nombre.trim()) e.nombre = 'Requerido'
  let errLong = validarLongitud(f.nombre, LIMITES.MEDICAMENTO_NOMBRE, 'El nombre')
  if (errLong) e.nombre = errLong
  errLong = validarLongitud(f.concentracion, LIMITES.MEDICAMENTO_CONCENTRACION, 'La concentración')
  if (errLong) e.concentracion = errLong
  return e
}

const PRESENTACIONES = [
  { value: '', label: 'Seleccionar presentación' },
  { value: 'Tableta', label: 'Tableta' },
  { value: 'Cápsula', label: 'Cápsula' },
  { value: 'Jarabe', label: 'Jarabe' },
  { value: 'Suspensión', label: 'Suspensión' },
  { value: 'Inyectable', label: 'Inyectable' },
  { value: 'Pomada', label: 'Pomada' },
  { value: 'Crema', label: 'Crema' },
  { value: 'Gotas', label: 'Gotas' },
  { value: 'Spray', label: 'Spray' },
  { value: 'Polvo', label: 'Polvo' },
  { value: 'Otro', label: 'Otro' },
]

function EditBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7A6555] hover:bg-[#FAF7F2] hover:text-[#C2570F] transition-colors"
      title="Editar"
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M11.5 1.5L13.5 3.5L5 12L2 13L3 10L11.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M9 3L12 6" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    </button>
  )
}

function SugerenciasMedicamento({ resultados, loading, onSelect, destacar }) {
  if (!destacar && resultados.length === 0 && !loading) return null

  return (
    <div className="mt-1 border border-[#E8DDD0] rounded-lg bg-white overflow-hidden">
      {loading && (
        <p className="px-3 py-2 text-xs text-[#7A6555]">Buscando...</p>
      )}
      {!loading && resultados.length > 0 && (
        <div className="max-h-40 overflow-y-auto">
          {destacar && (
            <p className="px-3 py-1.5 text-[10px] font-medium text-[#7A6555] uppercase tracking-wide bg-[#FAF7F2] border-b border-[#E8DDD0]">
              Medicamentos existentes
            </p>
          )}
          {resultados.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m)}
              className="w-full text-left px-3 py-2 text-sm text-[#2C1A0E] hover:bg-[#FAF7F2] transition-colors border-b border-[#E8DDD0] last:border-b-0 flex items-center justify-between gap-2"
            >
              <span className="font-medium truncate">{m.nombre}</span>
              {m.concentracion && (
                <span className="text-xs text-[#7A6555] shrink-0">{m.concentracion}</span>
              )}
            </button>
          ))}
        </div>
      )}
      {!loading && resultados.length === 0 && destacar && (
        <p className="px-3 py-2 text-xs text-[#7A6555]">Sin coincidencias — se creará uno nuevo</p>
      )}
    </div>
  )
}

export function Medicamentos() {
  const { medicamentos, loading, agregar, actualizar, toggleActivo } = useMedicamentosAll()

  const [modal, setModal] = useState({ open: false, editando: null })
  const [form, setForm] = useState(FORM_VACIO)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const { resultados: sugerencias, loading: buscando } = useBuscarMedicamentos(
    modal.open ? form.nombre : '',
    { soloActivos: false, limite: 6 }
  )

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return medicamentos
    const q = busqueda.trim().toLowerCase()
    return medicamentos.filter((m) =>
      m.nombre.toLowerCase().includes(q) ||
      (m.descripcion || '').toLowerCase().includes(q) ||
      (m.concentracion || '').toLowerCase().includes(q) ||
      (m.presentacion || '').toLowerCase().includes(q)
    )
  }, [medicamentos, busqueda])

  const abrirCrear = () => {
    setForm(FORM_VACIO)
    setErrors({})
    setModal({ open: true, editando: null })
  }

  const abrirEditar = (m) => {
    setForm({
      nombre: m.nombre,
      descripcion: m.descripcion || '',
      concentracion: m.concentracion || '',
      presentacion: m.presentacion || '',
    })
    setErrors({})
    setModal({ open: true, editando: m })
  }

  const seleccionarSugerencia = (med) => {
    setForm((prev) => ({
      ...prev,
      nombre: med.nombre,
      concentracion: med.concentracion || prev.concentracion,
      presentacion: med.presentacion || prev.presentacion,
      descripcion: med.descripcion || prev.descripcion,
    }))
    setErrors({})
  }

  const guardar = async () => {
    const e = validar(form)
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSaving(true)
    try {
      if (modal.editando) {
        await actualizar(modal.editando.id, form)
      } else {
        await agregar(form)
      }
      setModal({ open: false, editando: null })
    } catch (err) {
      setErrors({ nombre: err.message })
    }
    setSaving(false)
  }

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const presentacionValue = PRESENTACIONES.some((p) => p.value === form.presentacion) ? form.presentacion : 'Otro'

  return (
    <CatalogoLayout
      titulo="Medicamentos"
      descripcion="Catálogo de medicamentos disponibles"
      onAgregar={abrirCrear}
      total={medicamentos.length}
    >
      <BarraBusqueda
        placeholder="Buscar por nombre, descripción, concentración..."
        value={busqueda}
        onChange={setBusqueda}
      />
      <div className="w-full overflow-hidden rounded-xl border border-[#E8DDD0] bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAF7F2]">
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Nombre</th>
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Concentración</th>
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Presentación</th>
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Estado</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[#7A6555]">Cargando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[#7A6555]">{busqueda ? 'Sin resultados para esta búsqueda' : 'Sin registros'}</td></tr>
            ) : filtrados.map((m) => (
              <tr key={m.id} className="border-t border-[#E8DDD0] hover:bg-[#FAF7F2] transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium text-[#2C1A0E]">{m.nombre}</p>
                  {m.descripcion && <p className="text-xs text-[#7A6555] mt-0.5 line-clamp-1">{m.descripcion}</p>}
                </td>
                <td className="px-5 py-3.5 text-sm text-[#2C1A0E]">{m.concentracion || '—'}</td>
                <td className="px-5 py-3.5 text-sm text-[#2C1A0E]">{m.presentacion || '—'}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Badge activo={m.is_active} />
                    <ToggleActivoBtn activo={m.is_active} onToggle={() => toggleActivo(m.id)} nombre={m.nombre} />
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <EditBtn onClick={() => abrirEditar(m)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CatalogoModal
        open={modal.open}
        onClose={() => setModal({ open: false, editando: null })}
        titulo={modal.editando ? 'Editar medicamento' : 'Nuevo medicamento'}
        onGuardar={guardar}
        cargando={saving}
      >
        <div>
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={handleChange('nombre')}
            error={errors.nombre}
            placeholder="Ej: Amoxicilina"
            maxLength={LIMITES.MEDICAMENTO_NOMBRE}
            filter="alphanumeric"
          />
          <SugerenciasMedicamento
            resultados={sugerencias.filter((s) => !modal.editando || s.id !== modal.editando.id)}
            loading={buscando}
            onSelect={seleccionarSugerencia}
            destacar={!modal.editando}
          />
        </div>
        <Input
          label="Concentración (opcional)"
          value={form.concentracion}
          onChange={handleChange('concentracion')}
          error={errors.concentracion}
          placeholder="Ej: 500 mg, 100 mg/ml"
          maxLength={LIMITES.MEDICAMENTO_CONCENTRACION}
          filter="dosis"
        />
        <div>
          <label className="block text-xs font-medium text-[#7A6555] mb-1">Presentación (opcional)</label>
          <div className="flex gap-2">
            <select
              value={presentacionValue}
              onChange={(e) => setForm((prev) => ({ ...prev, presentacion: e.target.value }))}
              className="flex-1 border border-[#E8DDD0] rounded-lg px-3 py-2 text-sm text-[#2C1A0E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C2570F] focus:border-transparent"
            >
              {PRESENTACIONES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
        <Input
          label="Descripción (opcional)"
          value={form.descripcion}
          onChange={handleChange('descripcion')}
          placeholder="Indicaciones, notas o uso del medicamento"
          filter="text"
        />
      </CatalogoModal>
    </CatalogoLayout>
  )
}
