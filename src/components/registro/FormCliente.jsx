import { useMemo } from 'react'
import { useTipoDocumento } from '../../hooks/useTipoDocumento'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { PasswordStrengthIndicator } from '../ui/PasswordStrengthIndicator'
import { LIMITES } from '../../lib/validaciones'

export function FormCliente({ data, onChange, onSubmit, errors, loading = false, hideSubmit = false }) {
  const { tipos } = useTipoDocumento()

  const handleChange = (field) => (e) => onChange({ ...data, [field]: e.target.value })
  const tipoOptions = useMemo(() => tipos.map((t) => ({ value: t.id, label: t.nombre })), [tipos])

  const campos = (
    <>
      <Select
        label="Tipo de documento"
        placeholder="Seleccionar tipo"
        options={tipoOptions}
        value={data.id_tipo_documento}
        onChange={handleChange('id_tipo_documento')}
        error={errors.id_tipo_documento}
      />
      <Input
        label="Número de documento"
        placeholder="Ingresa tu número"
        value={data.numero_documento}
        onChange={handleChange('numero_documento')}
        error={errors.numero_documento}
        maxLength={LIMITES.CLIENTE_NUMERO_DOCUMENTO}
        filter="alphanumeric"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          placeholder="Tu nombre"
          value={data.nombre}
          onChange={handleChange('nombre')}
          error={errors.nombre}
          maxLength={LIMITES.CLIENTE_NOMBRE}
          filter="letters"
        />
        <Input
          label="Apellido"
          placeholder="Tu apellido"
          value={data.apellido}
          onChange={handleChange('apellido')}
          error={errors.apellido}
          maxLength={LIMITES.CLIENTE_APELLIDO}
          filter="letters"
        />
      </div>
      <Input
        label="Teléfono"
        type="tel"
        placeholder="999 999 999"
        value={data.telefono}
        onChange={handleChange('telefono')}
        error={errors.telefono}
        maxLength={LIMITES.CLIENTE_TELEFONO}
        filter="digits"
      />
      <Input
        label="Email"
        type="email"
        placeholder="correo@ejemplo.com"
        value={data.email}
        onChange={handleChange('email')}
        error={errors.email}
      />
      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        value={data.password}
        onChange={handleChange('password')}
        error={errors.password}
      />
      <PasswordStrengthIndicator password={data.password} />
      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="••••••••"
        value={data.confirmarPassword}
        onChange={handleChange('confirmarPassword')}
        error={errors.confirmarPassword}
      />
    </>
  )

  if (hideSubmit) return campos

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {campos}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Siguiente'}
      </Button>
    </form>
  )
}
