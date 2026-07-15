import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { calcularEdad } from '../../lib/edad'

function MascotaCard({ mascota, onVerHistoria }) {
  const calcEdad = (fechaNac) => calcularEdad(fechaNac)

  return (
    <div className="bg-white border border-[#E8DDD0] rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-[#FFF3EB] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-[#C2570F]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9C3 6.5 5 4 7 4C9 4 10 6 10 6C10 6 11 4 13 4C15 4 17 6.5 17 9C17 13 10 17 10 17C10 17 3 13 3 9Z" />
          </svg>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${mascota.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
          {mascota.is_active ? 'Activa' : 'Inactiva'}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-[#2C1A0E]">{mascota.nombre}</h3>
      <p className="text-xs text-[#7A6555] mt-0.5">{mascota.especie_nombre}{mascota.raza_nombre ? ` · ${mascota.raza_nombre}` : ''}</p>
      <p className="text-xs text-[#7A6555]">{calcEdad(mascota.fecha_nacimiento)}</p>
      <button
        onClick={() => onVerHistoria(mascota.id)}
        className="mt-3 text-xs font-medium text-[#C2570F] hover:text-[#A8480C] transition-colors"
      >
        Ver historia clínica →
      </button>
    </div>
  )
}

export function DetalleCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data: c } = await supabase
      .from('cliente')
      .select(`
        id, nombre, apellido, numero_documento, telefono,
        tipo_documento ( id, nombre )
      `)
      .eq('id', id)
      .single()
    setCliente(c)

    if (c) {
      const { data: m } = await supabase
        .from('mascota')
        .select(`
          id, nombre, fecha_nacimiento, is_active,
          especie_mascota!inner ( nombre ),
          raza ( nombre )
        `)
        .eq('id_cliente', id)
        .order('nombre')
      setMascotas((m || []).map((item) => ({
        ...item,
        especie_nombre: item.especie_mascota?.nombre,
        raza_nombre: item.raza?.nombre,
      })))
    }
    setLoading(false)
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#7A6555]">Cargando...</p>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="animate-fade-in-up">
        <div className="bg-white rounded-2xl border border-[#E8DDD0] p-14 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-[#2C1A0E] mb-1">Cliente no encontrado</h2>
        </div>
      </div>
    )
  }

  const handleVerHistoria = (idMascota) => {
    navigate(`/admin/historia/${idMascota}`)
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/clientes')}
          className="text-xs text-[#7A6555] hover:text-[#C2570F] transition-colors mb-2 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 4L6 8L10 12" />
          </svg>
          Volver a clientes
        </button>
      </div>

      <div className="bg-white border border-[#E8DDD0] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-[#FFF3EB] rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-[#C2570F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C1A0E]">{cliente.nombre} {cliente.apellido}</h1>
            <p className="text-sm text-[#7A6555]">{cliente.tipo_documento?.nombre} {cliente.numero_documento}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-[#7A6555]">Teléfono</p>
            <p className="text-sm font-medium text-[#2C1A0E]">{cliente.telefono || '—'}</p>
          </div>

          <div>
            <p className="text-xs text-[#7A6555]">Mascotas registradas</p>
            <p className="text-sm font-medium text-[#2C1A0E]">{mascotas.length}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-[#2C1A0E] mb-4">
        Mascotas {mascotas.length > 0 && <span className="text-sm font-normal text-[#7A6555]">({mascotas.length})</span>}
      </h2>

      {mascotas.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8DDD0] p-10 flex flex-col items-center justify-center text-center">
          <svg className="w-10 h-10 text-[#E8DDD0] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9C3 6.5 5 4 7 4C9 4 10 6 10 6C10 6 11 4 13 4C15 4 17 6.5 17 9C17 13 10 17 10 17C10 17 3 13 3 9Z" />
          </svg>
          <p className="text-sm text-[#7A6555]">Este cliente no tiene mascotas registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mascotas.map((m) => (
            <MascotaCard
              key={m.id}
              mascota={m}
              onVerHistoria={handleVerHistoria}
            />
          ))}
        </div>
      )}
    </div>
  )
}
