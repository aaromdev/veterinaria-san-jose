import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LIMITES, validarLongitud } from '../../lib/validaciones'

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-[#E8DDD0]/50 last:border-0">
      <span className="text-xs text-[#7A6555]">{label}</span>
      <span className="text-sm font-medium text-[#2C1A0E] text-right">{value || '—'}</span>
    </div>
  )
}

function validar(form) {
  const e = {}
  if (!form.nombre.trim()) e.nombre = 'Requerido'
  let err = validarLongitud(form.nombre, LIMITES.CLIENTE_NOMBRE, 'El nombre')
  if (err) e.nombre = err
  if (!form.apellido.trim()) e.apellido = 'Requerido'
  err = validarLongitud(form.apellido, LIMITES.CLIENTE_APELLIDO, 'El apellido')
  if (err) e.apellido = err
  if (!form.telefono.trim()) e.telefono = 'Requerido'
  else if (!/^\d{9}$/.test(form.telefono.trim())) e.telefono = 'Debe tener 9 dígitos'
  err = validarLongitud(form.telefono, LIMITES.CLIENTE_TELEFONO, 'El teléfono')
  if (err) e.telefono = err
  return e
}

function validarPassword(form) {
  const e = {}
  if (!form.nuevaPassword) e.nuevaPassword = 'Requerida'
  else if (form.nuevaPassword.length < 6) e.nuevaPassword = 'Mínimo 6 caracteres'
  if (!form.confirmarPassword) e.confirmarPassword = 'Requerida'
  else if (form.nuevaPassword !== form.confirmarPassword) e.confirmarPassword = 'Las contraseñas no coinciden'
  return e
}

export function EditarPerfil() {
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [documentoInfo, setDocumentoInfo] = useState(null)

  const [passwordForm, setPasswordForm] = useState({ nuevaPassword: '', confirmarPassword: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return setLoading(false)

        const { data, error: loadError } = await supabase
          .from('cliente')
          .select('nombre, apellido, telefono, numero_documento, tipo_documento(id, nombre)')
          .eq('id_cuenta', session.user.id)
          .maybeSingle()

        if (loadError) {
          setError('Error al cargar tus datos')
        } else if (data) {
          setForm({
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            telefono: data.telefono || '',
          })
          setDocumentoInfo({
            tipo: data.tipo_documento?.nombre || '',
            numero: data.numero_documento || '',
          })
        }
      } catch {
        setError('Error al cargar tus datos')
      }
      setLoading(false)
    })()
  }, [])

  const handleChange = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setSuccess(false)
    setError(null)
  }, [])

  const handleGuardar = useCallback(async () => {
    const e = validar(form)
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    const { data: { session } } = await supabase.auth.getSession()
    const { error: updateError } = await supabase
      .from('cliente')
      .update({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: form.telefono.trim(),
      })
      .eq('id_cuenta', session.user.id)

    setSaving(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
    }
  }, [form])

  const handlePasswordChange = useCallback((field) => (e) => {
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }))
    setPasswordSuccess(false)
    setPasswordError(null)
  }, [])

  const handleCambiarPassword = useCallback(async () => {
    const e = validarPassword(passwordForm)
    setPasswordErrors(e)
    if (Object.keys(e).length > 0) return

    setSavingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    const { error: authError } = await supabase.auth.updateUser({
      password: passwordForm.nuevaPassword,
    })

    setSavingPassword(false)
    if (authError) {
      setPasswordError(authError.message)
    } else {
      setPasswordSuccess(true)
      setPasswordForm({ nuevaPassword: '', confirmarPassword: '' })
    }
  }, [passwordForm])

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <Header />
        <div className="flex items-center justify-center py-20 text-sm text-[#7A6555]">
          Cargando...
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up max-w-xl mx-auto">
      <Header />

      {error && (
        <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#E8DDD0] rounded-xl p-6 space-y-5 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#2C1A0E] uppercase tracking-wide">
            Datos personales
          </h3>
          {success && (
            <span className="text-xs text-[#166534] bg-[#E8F5E9] px-2 py-0.5 rounded-full font-medium">
              Guardado
            </span>
          )}
        </div>

        <Input
          label="Nombre"
          value={form.nombre}
          onChange={handleChange('nombre')}
          error={errors.nombre}
          placeholder="Tu nombre"
          maxLength={LIMITES.CLIENTE_NOMBRE}
          filter="letters"
        />

        <Input
          label="Apellido"
          value={form.apellido}
          onChange={handleChange('apellido')}
          error={errors.apellido}
          placeholder="Tu apellido"
          maxLength={LIMITES.CLIENTE_APELLIDO}
          filter="letters"
        />

        <Input
          label="Teléfono"
          type="tel"
          value={form.telefono}
          onChange={handleChange('telefono')}
          error={errors.telefono}
          placeholder="999888777"
          maxLength={LIMITES.CLIENTE_TELEFONO}
          filter="digits"
        />

        <Button className="w-full" onClick={handleGuardar} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {documentoInfo && (
        <div className="bg-white border border-[#E8DDD0] rounded-xl p-6 space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-[#2C1A0E] uppercase tracking-wide">
            Documento de identidad
          </h3>
          <InfoRow label="Tipo de documento" value={documentoInfo.tipo} />
          <InfoRow label="Número" value={documentoInfo.numero} />
          <p className="text-[10px] text-[#7A6555]">
            Para modificar estos datos contacta al centro veterinario.
          </p>
        </div>
      )}

      <div className="bg-white border border-[#E8DDD0] rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#2C1A0E] uppercase tracking-wide">
            Cambiar contraseña
          </h3>
          {passwordSuccess && (
            <span className="text-xs text-[#166534] bg-[#E8F5E9] px-2 py-0.5 rounded-full font-medium">
              Actualizada
            </span>
          )}
        </div>

        {passwordError && (
          <div className="p-2.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#B91C1C]">
            {passwordError}
          </div>
        )}

        <Input
          label="Nueva contraseña"
          type="password"
          value={passwordForm.nuevaPassword}
          onChange={handlePasswordChange('nuevaPassword')}
          error={passwordErrors.nuevaPassword}
          placeholder="Mínimo 6 caracteres"
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          value={passwordForm.confirmarPassword}
          onChange={handlePasswordChange('confirmarPassword')}
          error={passwordErrors.confirmarPassword}
          placeholder="Repite la contraseña"
        />

        <Button className="w-full" onClick={handleCambiarPassword} disabled={savingPassword}>
          {savingPassword ? 'Actualizando...' : 'Cambiar contraseña'}
        </Button>
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-[#2C1A0E]">Mi perfil</h1>
      <p className="text-sm text-[#7A6555] mt-1">Administra tus datos personales</p>
    </div>
  )
}
