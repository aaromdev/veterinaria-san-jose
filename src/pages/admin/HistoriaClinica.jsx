import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { TimelineHistoria } from '../../components/historia/TimelineHistoria'
import { useHistoriaClinica } from '../../hooks/useHistoriaClinica'
import { calcularEdad } from '../../lib/edad'

export function HistoriaClinica() {
  const { idMascota } = useParams()
  const navigate = useNavigate()
  const [mascota, setMascota] = useState(null)
  const [loadingMascota, setLoadingMascota] = useState(true)
  const { entradas, recetasMap, loading: loadingEntradas } = useHistoriaClinica(idMascota)

  const cargarMascota = useCallback(async () => {
    if (!idMascota) return
    setLoadingMascota(true)
    const { data } = await supabase
      .from('mascota')
      .select(`
        id, nombre, fecha_nacimiento, is_active,
        especie_mascota ( nombre ),
        raza ( nombre )
      `)
      .eq('id', idMascota)
      .single()
    if (data) {
      setMascota({
        ...data,
        especie_nombre: data.especie_mascota?.nombre,
        raza_nombre: data.raza?.nombre,
      })
    }
    setLoadingMascota(false)
  }, [idMascota])

  useEffect(() => { cargarMascota() }, [cargarMascota])

  const calcEdad = (fechaNac) => calcularEdad(fechaNac)

  const loading = loadingMascota || loadingEntradas

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#7A6555]">Cargando...</p>
      </div>
    )
  }

  if (!mascota) {
    return (
      <div className="animate-fade-in-up">
        <div className="bg-white rounded-2xl border border-[#E8DDD0] p-14 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-[#2C1A0E]">Mascota no encontrada</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-[#7A6555] hover:text-[#C2570F] transition-colors mb-2 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 4L6 8L10 12" />
          </svg>
          Volver
        </button>
      </div>

      <div className="bg-white border border-[#E8DDD0] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#FFF3EB] rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-[#C2570F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9C3 6.5 5 4 7 4C9 4 10 6 10 6C10 6 11 4 13 4C15 4 17 6.5 17 9C17 13 10 17 10 17C10 17 3 13 3 9Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C1A0E]">{mascota.nombre}</h1>
            <p className="text-sm text-[#7A6555]">
              {mascota.especie_nombre}{mascota.raza_nombre ? ` · ${mascota.raza_nombre}` : ''}
              {calcEdad(mascota.fecha_nacimiento) ? ` · ${calcEdad(mascota.fecha_nacimiento)}` : ''}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${mascota.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {mascota.is_active ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-[#2C1A0E] mb-4">
        Historia clínica
        {entradas.length > 0 && <span className="text-sm font-normal text-[#7A6555] ml-1">({entradas.length} registros)</span>}
      </h2>

      <div className="bg-white border border-[#E8DDD0] rounded-xl p-6">
        <TimelineHistoria entradas={entradas} loading={loadingEntradas} recetasMap={recetasMap} />
      </div>
    </div>
  )
}
