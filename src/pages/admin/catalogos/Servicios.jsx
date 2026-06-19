import { useState, useMemo } from 'react'
import { CatalogoLayout } from '../../../components/catalogos/CatalogoLayout'
import { CatalogoModal } from '../../../components/catalogos/CatalogoModal'
import { ToggleActivoBtn } from '../../../components/catalogos/ToggleActivoBtn'
import { Badge } from '../../../components/ui/Badge'
import { BarraBusqueda } from '../../../components/ui/BarraBusqueda'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { useServiciosAll } from '../../../hooks/useServiciosAll'
import { useCategoriaSala } from '../../../hooks/useCategoriaSala'
import { LIMITES, validarLongitud } from '../../../lib/validaciones'

const FORM_VACIO = {
  nombre: '',
  descripcion: '',
  duracion_minutos: '',
  precio: '',
  id_categoria_sala: '',
}

function validar(f) {
  const e = {}
  if (!f.nombre.trim()) e.nombre = 'Requerido'
  const errLong = validarLongitud(f.nombre, LIMITES.SERVICIO_NOMBRE, 'El nombre')
  if (errLong) e.nombre = errLong
  if (!f.duracion_minutos || isNaN(f.duracion_minutos) || parseInt(f.duracion_minutos) <= 0)
    e.duracion_minutos = 'Ingresa una duración válida en minutos'
  if (!f.precio || isNaN(f.precio) || parseFloat(f.precio) <= 0)
    e.precio = 'Ingresa un precio válido'
  if (!f.id_categoria_sala) e.id_categoria_sala = 'Selecciona una categoría'
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

export function Servicios() {
  const { servicios, loading, agregar, actualizar, toggleActivo } = useServiciosAll()
  const { categorias } = useCategoriaSala()

  const [modal, setModal] = useState({ open: false, editando: null })
  const [form, setForm] = useState(FORM_VACIO)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const categoriaOptions = categorias.map((c) => ({ value: c.id, label: c.nombre }))

  const filtrados = useMemo(() => {
    let data = servicios
    if (filtroCategoria) {
      data = data.filter((s) => s.categoria_sala?.id === filtroCategoria)
    }
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase()
      data = data.filter((s) =>
        s.nombre.toLowerCase().includes(q) ||
        (s.descripcion || '').toLowerCase().includes(q)
      )
    }
    return data
  }, [servicios, busqueda, filtroCategoria])

  const abrirCrear = () => {
    setForm(FORM_VACIO)
    setErrors({})
    setModal({ open: true, editando: null })
  }

  const abrirEditar = (s) => {
    setForm({
      nombre: s.nombre,
      descripcion: s.descripcion || '',
      duracion_minutos: String(s.duracion_minutos),
      precio: String(s.precio),
      id_categoria_sala: s.categoria_sala?.id || '',
    })
    setErrors({})
    setModal({ open: true, editando: s })
  }

  const guardar = async () => {
    const e = validar(form)
    setErrors(e)
    if (Object.keys(e).length > 0) return

    const existe = servicios.some(s =>
      s.nombre.toLowerCase().trim() === form.nombre.toLowerCase().trim() &&
      (!modal.editando || s.id !== modal.editando.id)
    )
    if (existe) {
      setErrors({ nombre: 'Ya existe un servicio con ese nombre' })
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
      titulo="Servicios"
      descripcion="Administración de servicios ofrecidos"
      onAgregar={abrirCrear}
      total={servicios.length}
    >
      <BarraBusqueda
        placeholder="Buscar por nombre o descripción..."
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
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Duración</th>
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Precio</th>
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Estado</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-[#7A6555]">Cargando...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-[#7A6555]">{busqueda ? 'Sin resultados para esta búsqueda' : 'Sin registros'}</td></tr>
            ) : filtrados.map((s) => (
              <tr key={s.id} className="border-t border-[#E8DDD0] hover:bg-[#FAF7F2] transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium text-[#2C1A0E]">{s.nombre}</p>
                  {s.descripcion && <p className="text-xs text-[#7A6555] mt-0.5 line-clamp-1">{s.descripcion}</p>}
                </td>
                <td className="px-5 py-3.5 text-sm text-[#2C1A0E]">{s.categoria_sala?.nombre || '—'}</td>
                <td className="px-5 py-3.5 text-sm text-[#2C1A0E]">{s.duracion_minutos} min</td>
                <td className="px-5 py-3.5 text-sm text-[#2C1A0E]">S/ {parseFloat(s.precio).toFixed(2)}</td>
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
        titulo={modal.editando ? 'Editar servicio' : 'Nuevo servicio'}
        onGuardar={guardar}
        cargando={saving}
      >
        <Input label="Nombre" value={form.nombre} onChange={handleChange('nombre')} error={errors.nombre} placeholder="Ej: Consulta general" maxLength={LIMITES.SERVICIO_NOMBRE} />
        <Input label="Descripción (opcional)" value={form.descripcion} onChange={handleChange('descripcion')} placeholder="Breve descripción del servicio" />
        <Select
          label="Categoría"
          placeholder="Seleccionar categoría"
          options={categoriaOptions}
          value={form.id_categoria_sala}
          onChange={handleChange('id_categoria_sala')}
          error={errors.id_categoria_sala}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Duración (min)" type="number" min="1" value={form.duracion_minutos} onChange={handleChange('duracion_minutos')} error={errors.duracion_minutos} placeholder="30" />
          <Input label="Precio (S/)" type="number" min="0" step="0.01" value={form.precio} onChange={handleChange('precio')} error={errors.precio} placeholder="50.00" />
        </div>
      </CatalogoModal>
    </CatalogoLayout>
  )
}
