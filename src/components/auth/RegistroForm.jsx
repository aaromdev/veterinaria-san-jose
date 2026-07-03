import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FormCliente } from '../registro/FormCliente'
import { FormMascota } from '../registro/FormMascota'
import { useReveal } from '../../hooks/useReveal'
import { Button } from '../ui/Button'
import { LIMITES, validarLongitud } from '../../lib/validaciones'

const clienteVacio = {
  id_tipo_documento: '',
  numero_documento: '',
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  password: '',
  confirmarPassword: '',
}

const mascotaVacia = {
  nombre: '',
  id_especie: '',
  id_raza: '',
  fecha_nacimiento: '',
}

function validarCliente(d) {
  const e = {}
  if (!d.id_tipo_documento) e.id_tipo_documento = 'Selecciona un tipo de documento'
  if (!d.numero_documento.trim()) e.numero_documento = 'Campo obligatorio'
  else if (d.numero_documento.trim().length < 8) e.numero_documento = 'Debe tener mínimo 8 caracteres'
  let err = validarLongitud(d.numero_documento, LIMITES.CLIENTE_NUMERO_DOCUMENTO, 'El número de documento')
  if (err && !e.numero_documento) e.numero_documento = err
  if (!d.nombre.trim()) e.nombre = 'Campo obligatorio'
  err = validarLongitud(d.nombre, LIMITES.CLIENTE_NOMBRE, 'El nombre')
  if (err) e.nombre = err
  if (!d.apellido.trim()) e.apellido = 'Campo obligatorio'
  err = validarLongitud(d.apellido, LIMITES.CLIENTE_APELLIDO, 'El apellido')
  if (err) e.apellido = err
  if (!/^\d{9,11}$/.test(d.telefono)) e.telefono = 'Debe tener entre 9 y 11 dígitos'
  err = validarLongitud(d.telefono, LIMITES.CLIENTE_TELEFONO, 'El teléfono')
  if (err && !e.telefono) e.telefono = err
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = 'Email invalido'
  err = validarLongitud(d.email, LIMITES.EMAIL, 'El email')
  if (err) e.email = err
  const passwordOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"|<>?,.\/`~]).{6,}$/.test(d.password)
  if (!passwordOk) e.password = 'La contraseña no cumple los requisitos de seguridad'
  if (d.password !== d.confirmarPassword) e.confirmarPassword = 'Las contrasenas no coinciden'
  return e
}

function validarMascota(d) {
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

export function RegistroForm() {
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(clienteVacio)
  const [mascota, setMascota] = useState(mascotaVacia)
  const [errors, setErrors] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [loading, setLoading] = useState(false)

  const { ref, isVisible } = useReveal()

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setErrorGeneral('')

    const errCliente = validarCliente(cliente)
    const errMascota = validarMascota(mascota)
    const todosErrores = { ...errCliente, ...errMascota }
    setErrors(todosErrores)
    if (Object.keys(todosErrores).length > 0) return

    setLoading(true)

    const { data: docExistente } = await supabase
      .from('cliente')
      .select('id')
      .eq('id_tipo_documento', cliente.id_tipo_documento)
      .eq('numero_documento', cliente.numero_documento.trim())
      .maybeSingle()

    if (docExistente) {
      setErrorGeneral('Ya existe un cliente registrado con ese documento de identidad')
      setTimeout(() => setErrorGeneral(''), 8000)
      setLoading(false)
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cliente.email,
        password: cliente.password,
      })

      if (authError) throw new Error(authError.message)

      if (!authData.session) {
        setErrorGeneral('Debes confirmar tu email para continuar')
        setTimeout(() => setErrorGeneral(''), 8000)
        setLoading(false)
        return
      }

      const { error: registroError } = await supabase.rpc('register_cliente', {
        p_id_tipo_documento: cliente.id_tipo_documento,
        p_numero_documento: cliente.numero_documento,
        p_nombre: cliente.nombre,
        p_apellido: cliente.apellido,
        p_telefono: cliente.telefono,
        p_mascota_nombre: mascota.nombre,
        p_id_especie: mascota.id_especie,
        p_id_raza: mascota.id_raza || null,
        p_fecha_nacimiento: mascota.fecha_nacimiento,
      })

      if (registroError) throw new Error(registroError.message)

      navigate('/cliente/mascotas')
    } catch (err) {
      await supabase.auth.signOut()
      setCliente(clienteVacio)
      setMascota(mascotaVacia)
      setErrorGeneral(err.message || 'Error inesperado. Intenta de nuevo.')
      setTimeout(() => setErrorGeneral(''), 8000)
    } finally {
      setLoading(false)
    }
  }, [cliente, mascota, navigate])

  return (
    <section className="relative flex items-center justify-center px-4 py-16 overflow-hidden">
      <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-[#C2570F]/[0.04] blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-[#4A7C59]/[0.04] blur-3xl" />

      <div ref={ref} className={`w-full max-w-lg transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8DDD0] p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#FFF3EB] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#C2570F]" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.8" />
                <path d="M14 8V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M8 14H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#2C1A0E]">Crear cuenta</h1>
            <p className="text-sm text-[#7A6555] mt-1">Registrate y agrega a tu mascota</p>
          </div>

          {errorGeneral && (
            <p className="text-xs text-[#B91C1C] text-center bg-[#B91C1C]/5 py-2 px-3 rounded-lg mb-4">{errorGeneral}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormCliente
              data={cliente}
              onChange={setCliente}
              errors={errors}
              hideSubmit
            />

            <div className="border-t border-[#E8DDD0] pt-4">
              <h2 className="text-sm font-semibold text-[#2C1A0E] mb-4">Datos de la mascota</h2>
              <FormMascota
                data={mascota}
                onChange={setMascota}
                errors={errors}
                hideSubmit
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
