import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FormMascota } from '../../components/registro/FormMascota'
import { useMascota } from '../../hooks/useMascota'
import { useMascotas } from '../../hooks/useMascotas'
import { LIMITES, validarLongitud } from '../../lib/validaciones'

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

export function EditarMascota() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { mascota, loading } = useMascota(id)
  const { actualizar } = useMascotas()

  const [data, setData] = useState(null)
  const [errors, setErrors] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (mascota) {
      setData({
        nombre: mascota.nombre,
        id_especie: mascota.especie_mascota?.id || '',
        id_raza: mascota.raza?.id || '',
        fecha_nacimiento: mascota.fecha_nacimiento,
      })
    }
  }, [mascota])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const erroresValidacion = validar(data)
    setErrors(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    setErrorGeneral('')
    setGuardando(true)
    try {
      await actualizar(id, data)
      navigate('/cliente/mascotas')
    } catch (err) {
      setErrorGeneral(err.message || 'Error al actualizar la mascota')
    }
    setGuardando(false)
  }

  if (loading || !data) {
    return (
      <div className="animate-fade-in-up">
        <p className="text-sm text-[#7A6555]">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <Link to="/cliente/mascotas" className="text-xs text-[#7A6555] hover:text-[#C2570F] transition-colors mb-2 inline-block">
          ← Volver a mis mascotas
        </Link>
        <h1 className="text-2xl font-bold text-[#2C1A0E]">Editar mascota</h1>
        <p className="text-sm text-[#7A6555] mt-1">Actualiza los datos de {mascota.nombre}</p>
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
          submitLabel={guardando ? 'Guardando...' : 'Guardar cambios'}
        />
      </div>
    </div>
  )
}
