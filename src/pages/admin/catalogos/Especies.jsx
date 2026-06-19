import { useState, Fragment, useMemo } from 'react'
import { CatalogoLayout } from '../../../components/catalogos/CatalogoLayout'
import { CatalogoModal } from '../../../components/catalogos/CatalogoModal'
import { ToggleActivoBtn } from '../../../components/catalogos/ToggleActivoBtn'
import { Badge } from '../../../components/ui/Badge'
import { BarraBusqueda } from '../../../components/ui/BarraBusqueda'
import { Input } from '../../../components/ui/Input'
import { useEspeciesAll } from '../../../hooks/useEspeciesAll'
import { useRazasAdmin } from '../../../hooks/useRazasAdmin'
import { LIMITES, validarLongitud } from '../../../lib/validaciones'

function EditBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7A6555] hover:bg-[#FAF7F2] hover:text-[#C2570F] transition-colors"
      title="Editar"
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.5 1.5L13.5 3.5L5 12L2 13L3 10L11.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M9 3L12 6" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    </button>
  )
}

export function Especies() {
  const { especies, agregar, actualizar, toggleActivo } = useEspeciesAll()
  const [expandida, setExpandida] = useState(null)
  const { razas, loading: loadingRazas, agregarRaza, toggleRaza } = useRazasAdmin(expandida)

  const [modal, setModal] = useState({ open: false, editando: null })
  const [form, setForm] = useState({ nombre: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const filtradas = useMemo(() => {
    if (!busqueda.trim()) return especies
    const q = busqueda.trim().toLowerCase()
    return especies.filter((e) => e.nombre.toLowerCase().includes(q))
  }, [especies, busqueda])

  const [modalRaza, setModalRaza] = useState(false)
  const [razaNombre, setRazaNombre] = useState('')
  const [razaError, setRazaError] = useState('')
  const [savingRaza, setSavingRaza] = useState(false)

  const abrirCrear = () => {
    setForm({ nombre: '' })
    setErrors({})
    setModal({ open: true, editando: null })
  }

  const abrirEditar = (e) => {
    setForm({ nombre: e.nombre })
    setErrors({})
    setModal({ open: true, editando: e })
  }

  const guardar = async () => {
    if (!form.nombre.trim()) {
      setErrors({ nombre: 'El nombre es requerido' })
      return
    }

    const errLong = validarLongitud(form.nombre, LIMITES.ESPECIE_NOMBRE, 'El nombre')
    if (errLong) {
      setErrors({ nombre: errLong })
      return
    }

    const yaExiste = especies.some(e =>
      e.nombre.toLowerCase().trim() === form.nombre.toLowerCase().trim() &&
      (!modal.editando || e.id !== modal.editando.id)
    )
    if (yaExiste) {
      setErrors({ nombre: 'Ya existe una especie con ese nombre' })
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
      setErrors({ nombre: err.message || 'Error al guardar' })
    }
    setSaving(false)
  }

  const toggleExpandir = (id) => {
    setExpandida((prev) => (prev === id ? null : id))
  }

  const abrirModalRaza = () => {
    setRazaNombre('')
    setRazaError('')
    setModalRaza(true)
  }

  const guardarRaza = async () => {
    if (!razaNombre.trim()) {
      setRazaError('El nombre es requerido')
      return
    }

    const errLong = validarLongitud(razaNombre, LIMITES.RAZA_NOMBRE, 'El nombre')
    if (errLong) {
      setRazaError(errLong)
      return
    }

    const yaExiste = razas.some(
      (r) => r.nombre.trim().toLowerCase() === razaNombre.trim().toLowerCase()
    )
    if (yaExiste) {
      setRazaError(`Ya existe una raza llamada "${razaNombre.trim()}" en esta especie`)
      return
    }
    setSavingRaza(true)
    try {
      await agregarRaza(razaNombre)
      setModalRaza(false)
    } catch (err) {
      setRazaError(err.message || 'Error al guardar')
    }
    setSavingRaza(false)
  }

  return (
    <CatalogoLayout titulo="Especies y razas" descripcion="Administración de especies y sus razas asociadas" onAgregar={abrirCrear} total={especies.length}>
      <BarraBusqueda
        placeholder="Buscar especie..."
        value={busqueda}
        onChange={setBusqueda}
      />
      <div className="w-full overflow-hidden rounded-xl border border-[#E8DDD0] bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAF7F2]">
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Nombre</th>
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">Estado</th>
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-sm text-[#7A6555]">
                  {busqueda ? 'Sin resultados para esta búsqueda' : 'Sin registros'}
                </td>
              </tr>
            ) : filtradas.map((e) => (
              <Fragment key={e.id}>
                <tr className="border-t border-[#E8DDD0] hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-[#2C1A0E]">{e.nombre}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Badge activo={e.is_active} />
                      <ToggleActivoBtn activo={e.is_active} onToggle={() => toggleActivo(e.id)} nombre={e.nombre} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <EditBtn onClick={() => abrirEditar(e)} />
                      <button
                        onClick={() => toggleExpandir(e.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          expandida === e.id
                            ? 'bg-[#FAF7F2] text-[#7A6555]'
                            : 'text-[#7A6555] hover:bg-[#FAF7F2] hover:text-[#4A7C59]'
                        }`}
                        title={expandida === e.id ? 'Ocultar razas' : 'Ver razas'}
                      >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.5 3C4.5 3 2 7.5 2 7.5C2 7.5 4.5 12 7.5 12C10.5 12 13 7.5 13 7.5C13 7.5 10.5 3 7.5 3Z" stroke="currentColor" strokeWidth="1.3"/>
                          <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                {expandida === e.id && (
                  <tr className="animate-slide-up">
                    <td colSpan={3} className="px-0 py-0 bg-[#FAF7F2]">
                      <div className="mx-5 mb-4 mt-2 overflow-hidden rounded-lg border border-[#E8DDD0] bg-white">
                        <div className="flex items-center justify-between border-b border-[#E8DDD0] px-4 py-2.5">
                          <span className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide">Razas de {e.nombre}</span>
                          <button
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#C2570F] hover:bg-[#FFF3EB] transition-colors"
                            onClick={abrirModalRaza}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            Agregar
                          </button>
                        </div>
                        {loadingRazas ? (
                          <p className="px-4 py-6 text-sm text-[#7A6555]">Cargando...</p>
                        ) : razas.length === 0 ? (
                          <p className="px-4 py-6 text-sm text-[#7A6555]">Sin razas registradas</p>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#E8DDD0] bg-[#FAF7F2]">
                                <th className="text-xs font-semibold text-[#7A6555] px-4 py-2.5 text-left">Nombre</th>
                                <th className="text-xs font-semibold text-[#7A6555] px-4 py-2.5 text-left">Estado</th>
                                <th className="text-xs font-semibold text-[#7A6555] px-4 py-2.5 text-left"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {razas.map((r) => (
                                <tr key={r.id} className="border-b border-[#E8DDD0] hover:bg-[#FAF7F2] transition-colors">
                                  <td className="px-4 py-2.5 text-sm text-[#2C1A0E]">{r.nombre}</td>
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <Badge activo={r.is_active} />
                                      <ToggleActivoBtn activo={r.is_active} onToggle={() => toggleRaza(r.id)} nombre={r.nombre} />
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5"></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal especie */}
      <CatalogoModal
        open={modal.open}
        onClose={() => setModal({ open: false, editando: null })}
        titulo={modal.editando ? 'Editar especie' : 'Nueva especie'}
        onGuardar={guardar}
        cargando={saving}
      >
        <Input
          label="Nombre"
          value={form.nombre}
          onChange={(e) => {
            setForm({ ...form, nombre: e.target.value })
            setErrors({})
          }}
          error={errors.nombre}
          placeholder="Ej: Canino"
          maxLength={LIMITES.ESPECIE_NOMBRE}
          filter="letters"
        />
      </CatalogoModal>

      {/* Modal raza */}
      <CatalogoModal
        open={modalRaza}
        onClose={() => setModalRaza(false)}
        titulo="Agregar raza"
        onGuardar={guardarRaza}
        cargando={savingRaza}
        botonTexto="Agregar"
      >
        <Input
          label="Nombre"
          value={razaNombre}
          onChange={(e) => {
            setRazaNombre(e.target.value)
            setRazaError('')
          }}
          error={razaError}
          placeholder="Ej: Labrador Retriever"
          maxLength={LIMITES.RAZA_NOMBRE}
          filter="letters"
        />
      </CatalogoModal>
    </CatalogoLayout>
  )
}
