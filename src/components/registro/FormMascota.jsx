import { useMemo } from 'react'
import { useEspecies } from '../../hooks/useEspecies'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { SelectRazaFiltrada } from './SelectRazaFiltrada'
import { LIMITES } from '../../lib/validaciones'

const hoyISO = () => new Date().toISOString().split('T')[0]

export function FormMascota({ data, onChange, onSubmit, errors, submitLabel = 'Finalizar registro' }) {
  const { especies } = useEspecies()

  const handleChange = (field) => (e) => onChange({ ...data, [field]: e.target.value })
  const especieOptions = useMemo(() => especies.map((e) => ({ value: e.id, label: e.nombre })), [especies])

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Nombre de la mascota"
        placeholder="Ej: Firulais"
        value={data.nombre}
        onChange={handleChange('nombre')}
        error={errors.nombre}
        maxLength={LIMITES.MASCOTA_NOMBRE}
        filter="letters"
      />
      <Select
        label="Especie"
        placeholder="Seleccionar especie"
        options={especieOptions}
        value={data.id_especie}
        onChange={handleChange('id_especie')}
        error={errors.id_especie}
      />
      <SelectRazaFiltrada
        idEspecie={data.id_especie}
        value={data.id_raza}
        onChange={handleChange('id_raza')}
        error={errors.id_raza}
      />
      <Input
        label="Fecha de nacimiento"
        type="date"
        max={hoyISO()}
        value={data.fecha_nacimiento}
        onChange={handleChange('fecha_nacimiento')}
        error={errors.fecha_nacimiento}
      />
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
