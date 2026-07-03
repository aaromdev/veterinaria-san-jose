import { useState, useCallback, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

/** Detecta si dos rangos horarios (HH:MM:SS) se solapan */
function rangesOverlap(aInicio, aFin, bInicio, bFin) {
  return aInicio < bFin && bInicio < aFin
}

export function usePlantillas() {
  const [plantillas, setPlantillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Filtros de fecha ──────────────────────────────────────
  const [modoFecha, setModoFecha]                 = useState('todas')  // 'todas' | 'exacta' | 'rango'
  const [filtroFechaExacta, setFiltroFechaExacta] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde]   = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta]   = useState('')

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

  /**
   * Devuelve Set con los días de semana (0-6) presentes en un rango.
   * Si el rango >= 7 días ya cubre toda la semana, corta antes.
   */
  const diasEnRango = useCallback((desde, hasta) => {
    const dias = new Set()
    const cursor = new Date(desde + 'T00:00:00')
    const fin    = new Date(hasta  + 'T00:00:00')
    while (cursor <= fin && dias.size < 7) {
      dias.add(cursor.getDay())
      cursor.setDate(cursor.getDate() + 1)
    }
    return dias
  }, [])

  // ── Filtrado combinado (día + fecha) ──────────────────────
  const filtrarPlantillas = useCallback((busqueda = '', diasSeleccionados = []) => {
    let data = plantillas

    // Filtro por días de semana (checkboxes)
    if (diasSeleccionados.length > 0) {
      data = data.filter((p) => diasSeleccionados.includes(p.dia_semana))
    }

    // Filtro por fecha exacta
    if (modoFecha === 'exacta' && filtroFechaExacta) {
      const dia = new Date(filtroFechaExacta + 'T00:00:00').getDay()
      data = data.filter((p) => p.dia_semana === dia)
    }

    // Filtro por rango
    if (
  filtroFechaDesde &&
  filtroFechaHasta &&
  filtroFechaDesde <= filtroFechaHasta
  ) {
    const dias = diasEnRango(
      filtroFechaDesde,
      filtroFechaHasta
    )

    data = data.filter((p) =>
      dias.has(p.dia_semana)
    )
  }

    // Filtro por texto
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase()
      data = data.filter((p) =>
        (p.servicio?.nombre || '').toLowerCase().includes(q) ||
        (p.sala?.nombre    || '').toLowerCase().includes(q)
      )
    }

    return data
  }, [plantillas, modoFecha, filtroFechaExacta, filtroFechaDesde, filtroFechaHasta, diasEnRango])

  const limpiarFiltrosFecha = useCallback(() => {
  setFiltroFechaDesde('')
  setFiltroFechaHasta('')
}, [])

  const hayFiltroFecha =
  !!filtroFechaDesde || !!filtroFechaHasta

  // ── CRUD (sin cambios) ────────────────────────────────────
  const agregar = useCallback(async (datos) => {
    // Validar solapamiento localmente (feedback inmediato)
    const dia = parseInt(datos.dia_semana)
    const solapada = plantillas.some(
      (p) =>
        p.servicio?.id === datos.id_servicio &&
        p.sala?.id === datos.id_sala &&
        p.dia_semana === dia &&
        rangesOverlap(
          p.hora_inicio, p.hora_fin,
          datos.hora_inicio, datos.hora_fin
        )
    )
    if (solapada) {
      throw new Error('Ya existe una plantilla que se solapa con este horario para el mismo servicio, sala y día')
    }

    try {
      const { data, error } = await supabase.rpc('crear_plantilla', {
        p_id_servicio:       datos.id_servicio,
        p_id_sala:           datos.id_sala,
        p_dia_semana:        dia,
        p_hora_inicio:       datos.hora_inicio,
        p_hora_fin:          datos.hora_fin,
        p_intervalo_minutos: parseInt(datos.intervalo_minutos),
      })
      if (error) throw error
      setPlantillas((prev) => [...prev, data])
    } catch (err) {
      if (err?.code === '23P01' || err?.message?.includes('solapa')) {
        throw new Error('Ya existe una plantilla que se solapa con este horario para el mismo servicio, sala y día')
      }
      throw err
    }
  }, [plantillas])

  const actualizar = useCallback(async (id, datos) => {
    // Verificar que la nueva combinación no solape otra plantilla existente
    const dia = parseInt(datos.dia_semana)
    const conflicto = plantillas.some(
      (p) =>
        p.id !== id &&
        p.servicio?.id === datos.id_servicio &&
        p.sala?.id === datos.id_sala &&
        p.dia_semana === dia &&
        rangesOverlap(
          p.hora_inicio, p.hora_fin,
          datos.hora_inicio, datos.hora_fin
        )
    )
    if (conflicto) {
      throw new Error('Ya existe otra plantilla que se solapa con este horario para el mismo servicio, sala y día')
    }

    const { data: sv } = await supabase.from('servicio').select('id_categoria_sala').eq('id', datos.id_servicio).single()
    const { data: sl } = await supabase.from('sala').select('id_categoria').eq('id', datos.id_sala).single()
    if (sv && sl && sv.id_categoria_sala !== sl.id_categoria)
      throw new Error('La sala no corresponde a la categoría del servicio')

    try {
      const { data, error } = await supabase
        .from('plantilla_horario')
        .update({
          id_servicio:       datos.id_servicio,
          id_sala:           datos.id_sala,
          dia_semana:        dia,
          hora_inicio:       datos.hora_inicio,
          hora_fin:          datos.hora_fin,
          intervalo_minutos: parseInt(datos.intervalo_minutos),
        })
        .eq('id', id)
        .select(`id, dia_semana, hora_inicio, hora_fin, intervalo_minutos, is_active, servicio ( id, nombre ), sala ( id, nombre )`)
        .single()
      if (error) throw error
      setPlantillas((prev) => prev.map((p) => (p.id === id ? data : p)))
    } catch (err) {
      if (err?.code === '23P01') {
        throw new Error('Ya existe otra plantilla que se solapa con este horario para el mismo servicio, sala y día')
      }
      throw err
    }
  }, [plantillas])

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
        .eq('hueco.id_servicio', plantilla.servicio?.id)
        .eq('hueco.id_sala', plantilla.sala?.id)
        .limit(1)
      if (citas?.length > 0)
        throw new Error('No se puede desactivar: tiene citas programadas')
    }
    const { data, error } = await supabase
      .from('plantilla_horario')
      .update({ is_active: !plantilla.is_active })
      .eq('id', id)
      .select(`id, dia_semana, hora_inicio, hora_fin, intervalo_minutos, is_active, servicio ( id, nombre ), sala ( id, nombre )`)
      .single()
    if (error) throw error
    setPlantillas((prev) => prev.map((p) => (p.id === id ? data : p)))
  }, [plantillas])

  return {
    plantillas,
    filtrarPlantillas,
    loading, error,
    agregar, actualizar, toggleActivo,
    // filtros fecha
    modoFecha, setModoFecha,
    filtroFechaExacta, setFiltroFechaExacta,
    filtroFechaDesde,  setFiltroFechaDesde,
    filtroFechaHasta,  setFiltroFechaHasta,
    limpiarFiltrosFecha,
    hayFiltroFecha,
  }
}