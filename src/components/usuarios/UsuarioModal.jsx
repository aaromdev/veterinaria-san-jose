import { useCallback, useMemo } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { LIMITES } from '../../lib/validaciones'

const ROLES = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'VETERINARIO', label: 'Veterinario' },
  { value: 'ASISTENTE', label: 'Asistente' },
]

export function UsuarioModal({ open, onClose, titulo, form, setForm, onGuardar, cargando, tiposDocumento, editando }) {
  const handleChange = useCallback((field) => (e) => {
    const val = e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
  }, [setForm])

  const tiposDoc = useMemo(() =>
    (tiposDocumento || []).map((td) => ({
      value: td.id,
      label: td.nombre,
    })),
  [tiposDocumento])

  if (!open) return null

  const esCliente = form.tipo === 'CLIENTE'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-scale-in relative z-10 w-full max-w-lg">
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-[#C2570F] to-[#E89248]" />
          <div className="p-6">
            <h2 className="font-display text-xl leading-tight text-[#2C1A0E] mb-5">{titulo}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onGuardar()
              }}
              className="space-y-4"
            >
              <Input
                label="Email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={handleChange('email')}
                disabled={editando}
                required={!editando}
              />

              {!editando && (
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Min. 6 caracteres"
                  value={form.password}
                  onChange={handleChange('password')}
                  required
                />
              )}

              <Select
                label="Tipo de usuario"
                value={form.tipo}
                onChange={handleChange('tipo')}
                disabled={editando}
                options={[
                  { value: 'CLIENTE', label: 'Cliente' },
                  { value: 'PERSONAL', label: 'Personal' },
                ]}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nombre"
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={handleChange('nombre')}
                  required
                  maxLength={LIMITES.PERSONAL_NOMBRE}
                />
                {esCliente && (
                  <Input
                    label="Apellido"
                    placeholder="Apellido"
                    value={form.apellido}
                    onChange={handleChange('apellido')}
                    required
                    maxLength={LIMITES.CLIENTE_APELLIDO}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="999888777"
                  value={form.telefono}
                  onChange={handleChange('telefono')}
                  required
                  maxLength={LIMITES.PERSONAL_TELEFONO}
                />
                {!esCliente && (
                  <Select
                    label="Rol"
                    value={form.rol}
                    onChange={handleChange('rol')}
                    options={ROLES}
                  />
                )}
              </div>

              {esCliente && (
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Tipo documento"
                    value={form.id_tipo_documento}
                    onChange={handleChange('id_tipo_documento')}
                    options={tiposDoc}
                    placeholder="Seleccionar..."
                  />
                  <Input
                    label="Número documento"
                    placeholder="12345678"
                    value={form.numero_documento}
                    onChange={handleChange('numero_documento')}
                    maxLength={LIMITES.CLIENTE_NUMERO_DOCUMENTO}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={cargando}>
                  {cargando ? 'Guardando...' : (editando ? 'Guardar cambios' : 'Crear usuario')}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
