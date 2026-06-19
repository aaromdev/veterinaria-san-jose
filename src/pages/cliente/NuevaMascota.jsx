import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormMascota } from '../../components/registro/FormMascota'
import { useMascotas } from '../../hooks/useMascotas'
import { LIMITES, validarLongitud } from '../../lib/validaciones'

const mascotaVacia = {
  nombre: '',
  id_especie: '',
  id_raza: '',
  fecha_nacimiento: '',
}

function validar(d) {
  const e = {}
  if (!d.nombre.trim()) e.nombre = 'Campo obligatorio'
  const errLong = validarLongitud(d.nombre, LIMITES.MASCOTA_NOMBRE, 'El nombre')
  if (errLong) e.nombre = errLong
  if (!d.id_especie) e.id_especie = 'Selecciona una especie'
  if (!d.fecha_nacimiento) {
    e.fecha_nacimiento = 'Campo obligatorio'
  } else if (d.fecha_nacimiento > new Date().toISOString().split('T')[0]) {
    e.fecha_nacimiento = 'La fecha no puede ser futura'
  }
  return e
}

export function NuevaMascota() {
  const navigate = useNavigate()
  const { agregar } = useMascotas()
  const [data, setData] = useState(mascotaVacia)
  const [errors, setErrors] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const erroresValidacion = validar(data)
    setErrors(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setErrorGeneral('')
    setGuardando(true)
    try {
      await agregar(data)
      navigate('/cliente/mascotas')
    } catch (err) {
      setErrorGeneral(err.message || 'Error al registrar la mascota')
    }
    setGuardando(false)
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2C1A0E]">Nueva mascota</h1>
        <p className="text-sm text-[#7A6555] mt-1">Registra una nueva mascota</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8DDD0] p-6 max-w-lg">
        {errorGeneral && (
          <p className="text-xs text-[#B91C1C] text-center bg-[#B91C1C]/5 py-2 px-3 rounded-lg mb-4">{errorGeneral}</p>
        )}
        <FormMascota
          data={data}
          onChange={setData}
          onSubmit={handleSubmit}
          errors={errors}
          submitLabel={guardando ? 'Guardando...' : 'Registrar mascota'}
        />
      </div>
    </div>
  )
}
