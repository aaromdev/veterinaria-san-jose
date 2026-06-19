import { useState, useMemo } from 'react'
import { CatalogoLayout } from '../../../components/catalogos/CatalogoLayout'
import { CatalogoModal } from '../../../components/catalogos/CatalogoModal'
import { ToggleActivoBtn } from '../../../components/catalogos/ToggleActivoBtn'
import { Badge } from '../../../components/ui/Badge'
import { BarraBusqueda } from '../../../components/ui/BarraBusqueda'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { useSalas } from '../../../hooks/useSalas'
import { useCategoriaSala } from '../../../hooks/useCategoriaSala'
import { LIMITES, validarLongitud } from '../../../lib/validaciones'

const FORM_VACIO = { nombre: '', capacidad: '', id_categoria: '' }

function validar(f) {
  const e = {}
  if (!f.nombre.trim()) e.nombre = 'Requerido'
  const errLong = validarLongitud(f.nombre, LIMITES.SALA_NOMBRE, 'El nombre')
  if (errLong) e.nombre = errLong
  if (!f.capacidad || isNaN(f.capacidad) || parseInt(f.capacidad) <= 0)
    e.capacidad = 'Ingresa una capacidad válida'
  if (!f.id_categoria) e.id_categoria = 'Selecciona una categoría'
  return e
}

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

export function Salas() {
  const { salas, loading, agregar, actualizar, toggleActivo } = useSalas()
  const { categorias } = useCategoriaSala()

  const [modal, setModal] = useState({ open: false, editando: null })
  const [form, setForm] = useState(FORM_VACIO)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const categoriaOptions = categorias.map((c) => ({ value: c.id, label: c.nombre }))

  const filtrados = useMemo(() => {
    let data = salas
    if (filtroCategoria) {
      data = data.filter((s) => s.categoria_sala?.id === filtroCategoria)
    }
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase()
      data = data.filter((s) => s.nombre.toLowerCase().includes(q))
    }
    return data
  }, [salas, busqueda, filtroCategoria])

  const abrirCrear = () => {
    setForm(FORM_VACIO)
    setErrors({})
    setModal({ open: true, editando: null })
  }

  const abrirEditar = (s) => {
    setForm({
      nombre: s.nombre,
      capacidad: String(s.capacidad),
      id_categoria: s.categoria_sala?.id || '',
    })
    setErrors({})
    setModal({ open: true, editando: s })
  }

  const guardar = async () => {
    const e = validar(form)
    setErrors(e)
    if (Object.keys(e).length > 0) return

    const existe = salas.some(s =>
      s.nombre.toLowerCase().trim() === form.nombre.toLowerCase().trim() &&
      (!modal.editando || s.id !== modal.editando.id)
    )
    if (existe) {
      setErrors({ nombre: 'Ya existe una sala con ese nombre' })
      return
    }

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

  return (
    <CatalogoLayout
      titulo="Salas"
      descripcion="Administración de salas y consultorios"
      onAgregar={abrirCrear}
      total={salas.length}
    >
      <BarraBusqueda
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={setBusqueda}
        filtros={[
          { label: 'Todas las categorías', value: filtroCategoria, onChange: setFiltroCategoria, options: categoriaOptions },
        ]}
      />
      <div className="w-full overflow-hidden rounded-xl border border-[#E8DDD0] bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAF7F2]">
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Nombre</th>
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Categoría</th>
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Capacidad</th>
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Estado</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[#7A6555]">Cargando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[#7A6555]">{busqueda ? 'Sin resultados para esta búsqueda' : 'Sin registros'}</td></tr>
            ) : filtrados.map((s) => (
              <tr key={s.id} className="border-t border-[#E8DDD0] hover:bg-[#FAF7F2] transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-[#2C1A0E]">{s.nombre}</td>
                <td className="px-5 py-3.5 text-sm text-[#2C1A0E]">{s.categoria_sala?.nombre || '—'}</td>
                <td className="px-5 py-3.5 text-sm text-[#2C1A0E]">{s.capacidad}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Badge activo={s.is_active} />
                    <ToggleActivoBtn activo={s.is_active} onToggle={() => toggleActivo(s.id)} nombre={s.nombre} />
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <EditBtn onClick={() => abrirEditar(s)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CatalogoModal
        open={modal.open}
        onClose={() => setModal({ open: false, editando: null })}
        titulo={modal.editando ? 'Editar sala' : 'Nueva sala'}
        onGuardar={guardar}
        cargando={saving}
      >
        <Input label="Nombre" value={form.nombre} onChange={handleChange('nombre')} error={errors.nombre} placeholder="Ej: Consultorio 1" maxLength={LIMITES.SALA_NOMBRE} filter="alphanumeric" />
        <Select
          label="Categoría"
          placeholder="Seleccionar categoría"
          options={categoriaOptions}
          value={form.id_categoria}
          onChange={handleChange('id_categoria')}
          error={errors.id_categoria}
        />
        <Input label="Capacidad" type="number" min="1" value={form.capacidad} onChange={handleChange('capacidad')} error={errors.capacidad} placeholder="1" filter="digits" />
      </CatalogoModal>
    </CatalogoLayout>
  )
}
