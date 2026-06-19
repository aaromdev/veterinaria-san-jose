import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePlantillas() {
  const [plantillas, setPlantillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('plantilla_horario')
      .select(`
        id, dia_semana, hora_inicio, hora_fin, intervalo_minutos, is_active,
        servicio ( id, nombre ),
        sala ( id, nombre )
      `)
      .order('dia_semana')
    if (error) setError(error.message)
    else setPlantillas(data)
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const agregar = useCallback(async (datos) => {
    const { data, error } = await supabase.rpc('crear_plantilla', {
      p_id_servicio: datos.id_servicio,
      p_id_sala: datos.id_sala,
      p_dia_semana: parseInt(datos.dia_semana),
      p_hora_inicio: datos.hora_inicio,
      p_hora_fin: datos.hora_fin,
      p_intervalo_minutos: parseInt(datos.intervalo_minutos),
    })
    if (error) throw error
    setPlantillas((prev) => [...prev, data])
  }, [])

  const actualizar = useCallback(async (id, datos) => {
    const { data: sv } = await supabase
      .from('servicio')
      .select('id_categoria_sala')
      .eq('id', datos.id_servicio)
      .single()

    const { data: sl } = await supabase
      .from('sala')
      .select('id_categoria')
      .eq('id', datos.id_sala)
      .single()

    if (sv && sl && sv.id_categoria_sala !== sl.id_categoria) {
      throw new Error('La sala no corresponde a la categoría del servicio')
    }

    const { data, error } = await supabase
      .from('plantilla_horario')
      .update({
        id_servicio: datos.id_servicio,
        id_sala: datos.id_sala,
        dia_semana: parseInt(datos.dia_semana),
        hora_inicio: datos.hora_inicio,
        hora_fin: datos.hora_fin,
        intervalo_minutos: parseInt(datos.intervalo_minutos),
      })
      .eq('id', id)
      .select(`
        id, dia_semana, hora_inicio, hora_fin, intervalo_minutos, is_active,
        servicio ( id, nombre ),
        sala ( id, nombre )
      `)
      .single()
    if (error) throw error
    setPlantillas((prev) => prev.map((p) => (p.id === id ? data : p)))
  }, [])

  const toggleActivo = useCallback(async (id) => {
    const plantilla = plantillas.find((p) => p.id === id)
    if (!plantilla) return
    if (plantilla.is_active) {
      const today = new Date().toISOString().split('T')[0]
      const { data: citas } = await supabase
        .from('cita')
        .select('id, hueco!inner(fecha, id_servicio, id_sala)')
        .in('estado', ['PROGRAMADA', 'EN_ESPERA'])
        .gte('hueco.fecha', today)
        .eq('hueco.id_servicio', plantilla.id_servicio)
        .eq('hueco.id_sala', plantilla.id_sala)
        .limit(1)
      if (citas?.length > 0) {
        throw new Error('No se puede desactivar la plantilla porque tiene citas programadas')
      }
    }
    const { data, error } = await supabase
      .from('plantilla_horario')
      .update({ is_active: !plantilla.is_active })
      .eq('id', id)
      .select(`
        id, dia_semana, hora_inicio, hora_fin, intervalo_minutos, is_active,
        servicio ( id, nombre ),
        sala ( id, nombre )
      `)
      .single()
    if (error) throw error
    setPlantillas((prev) => prev.map((p) => (p.id === id ? data : p)))
  }, [plantillas])

  return { plantillas, loading, error, agregar, actualizar, toggleActivo }
}
