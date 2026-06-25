import { useState, useCallback, useMemo } from 'react'
import { useUsuarios } from '../../hooks/useUsuarios'
import { useTipoDocumento } from '../../hooks/useTipoDocumento'
import { UsuarioModal } from '../../components/usuarios/UsuarioModal'
import { BarraBusqueda } from '../../components/ui/BarraBusqueda'
import { Badge } from '../../components/ui/Badge'
import { CatalogoLayout } from '../../components/catalogos/CatalogoLayout'
import { ToggleActivoBtn } from '../../components/catalogos/ToggleActivoBtn'

const ROL_COLORS = {
  ADMINISTRADOR: 'bg-purple-100 text-purple-700',
  VETERINARIO: 'bg-blue-100 text-blue-700',
  ASISTENTE: 'bg-amber-100 text-amber-700',
}

function BadgeRol({ rol }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROL_COLORS[rol] || 'bg-gray-100 text-gray-700'}`}>
      {rol}
    </span>
  )
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

export function Usuarios() {
  const { usuarios, loading, saving, error, crear, actualizar, toggleEstado, USUARIO_VACIO } = useUsuarios()
  const { tipos: tiposDocumento } = useTipoDocumento()
  const [modal, setModal] = useState({ open: false, editando: null })
  const [form, setForm] = useState(USUARIO_VACIO)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  const filtrados = useMemo(() => {
    let data = usuarios
    if (filtroTipo) {
      data = data.filter((u) => u.tipo === filtroTipo)
    }
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase()
      data = data.filter((u) =>
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.apellido || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      )
    }
    return data
  }, [usuarios, busqueda, filtroTipo])

  const abrirCrear = useCallback(() => {
    setForm(USUARIO_VACIO)
    setModal({ open: true, editando: null })
  }, [USUARIO_VACIO])

  const abrirEditar = useCallback((usuario) => {
    setForm({
      email: usuario.email,
      password: '',
      tipo: usuario.tipo,
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      telefono: usuario.telefono || '',
      id_tipo_documento: usuario.id_tipo_documento || '',
      numero_documento: usuario.numero_documento || '',
      rol: usuario.rol || 'VETERINARIO',
    })
    setModal({ open: true, editando: usuario })
  }, [])

  const guardar = useCallback(async () => {
    if (modal.editando) {
      const ok = await actualizar(modal.editando, form)
      if (ok) setModal({ open: false, editando: null })
    } else {
      const ok = await crear(form)
      if (ok) setModal({ open: false, editando: null })
    }
  }, [modal.editando, form, actualizar, crear])

  const handleToggle = useCallback((cuentaId) => toggleEstado(cuentaId), [toggleEstado])

  return (
    <CatalogoLayout
      titulo="Usuarios"
      descripcion="Gestión completa de clientes y personal del sistema"
      onAgregar={abrirCrear}
      botonTexto="Nuevo usuario"
      total={usuarios.length}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <BarraBusqueda
        placeholder="Buscar por nombre, apellido o email..."
        value={busqueda}
        onChange={setBusqueda}
        filtros={[
          { label: 'Todos los tipos', value: filtroTipo, onChange: setFiltroTipo, options: [
            { value: 'CLIENTE', label: 'Cliente' },
            { value: 'PERSONAL', label: 'Personal' },
          ]},
        ]}
      />

      <div className="w-full overflow-hidden rounded-xl border border-[#E8DDD0] bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAF7F2]">
              <Th>Nombre</Th>
              <Th>Email</Th>
              <Th>Tipo</Th>
              <Th>Teléfono</Th>
              <Th>Doc. identidad</Th>
              <Th>Rol</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-[#7A6555]">Cargando usuarios...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-[#7A6555]">{busqueda ? 'Sin resultados para esta búsqueda' : 'Sin registros'}</td></tr>
            ) : filtrados.map((u) => (
              <tr key={u.cuenta_id} className="border-t border-[#E8DDD0] hover:bg-[#FAF7F2] transition-colors">
                <Td>
                  <span className="font-medium text-[#2C1A0E]">{u.nombre}</span>
                  {u.apellido && <span className="text-[#7A6555] ml-1">{u.apellido}</span>}
                </Td>
                <Td className="text-[#7A6555]">{u.email}</Td>
                <Td>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    u.tipo === 'PERSONAL'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {u.tipo === 'PERSONAL' ? 'Personal' : 'Cliente'}
                  </span>
                </Td>
                <Td className="text-[#7A6555]">{u.telefono || '—'}</Td>
                <Td className="text-[#7A6555] text-xs">
                  {u.tipo_documento_nombre && (
                    <span>{u.tipo_documento_nombre}: {u.numero_documento}</span>
                  )}
                  {u.tipo === 'PERSONAL' && !u.tipo_documento_nombre && <span>—</span>}
                </Td>
                <Td>
                  {u.rol ? <BadgeRol rol={u.rol} /> : <span className="text-[#7A6555] text-xs">—</span>}
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Badge activo={u.is_active} />
                    <ToggleActivoBtn
                      activo={u.is_active}
                      onToggle={() => handleToggle(u.cuenta_id)}
                      nombre={u.nombre}
                    />
                  </div>
                </Td>
                <Td className="text-right">
                  <EditBtn onClick={() => abrirEditar(u)} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UsuarioModal
        open={modal.open}
        onClose={() => setModal({ open: false, editando: null })}
        titulo={modal.editando ? 'Editar usuario' : 'Nuevo usuario'}
        form={form}
        setForm={setForm}
        onGuardar={guardar}
        cargando={saving}
        tiposDocumento={tiposDocumento}
        editando={modal.editando}
      />
    </CatalogoLayout>
  )
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-5 py-3.5 text-left text-xs font-semibold text-[#7A6555] uppercase tracking-wide ${className}`}>
      {children}
    </th>
  )
}

function Td({ children, className = '' }) {
  return (
    <td className={`px-5 py-3.5 text-sm ${className}`}>
      {children}
    </td>
  )
}
