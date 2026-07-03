import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const POLL_INTERVAL_MS = 20000

function getLocalDateString(date) {
  const d = date || new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function timeToMinutes(str) {
  if (!str) return 0
  const parts = str.split(':')
  if (parts.length < 2) return 0
  return Number(parts[0]) * 60 + Number(parts[1])
}

export function useHuecosDisponibles(idServicio, fecha) {
  const [huecos, setHuecos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)
  const pollRef = useRef(null)
  const cargandoRef = useRef(false)

  const load = useCallback(async () => {
    if (!idServicio || !fecha || cargandoRef.current) return
    cargandoRef.current = true
    setError(null)

    const { data, error: err } = await supabase
      .from('hueco')
      .select(`
        id, fecha, hora_inicio, hora_fin,
        sala ( id, nombre )
      `)
      .eq('id_servicio', idServicio)
      .eq('bloqueado', false)
      .eq('fecha', fecha)
      .order('hora_inicio', { ascending: true })

    cargandoRef.current = false
    if (err) {
      setError(err.message)
      setHuecos([])
    } else {
      setHuecos(data || [])
    }
  }, [idServicio, fecha])

  useEffect(() => {
    if (!idServicio || !fecha) {
      setHuecos([])
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    load().finally(() => {
      if (isMounted) setLoading(false)
    })

    // Suscripción en tiempo real a cambios en la tabla hueco
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`huecos-disponibles-${idServicio}-${fecha}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hueco' },
        () => { if (isMounted) load() }
      )
      .subscribe()

    channelRef.current = channel

    // Polling como respaldo
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      if (isMounted) load()
    }, POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [idServicio, fecha, load])

  const huecosFiltrados = useMemo(() => {
    const ahora = new Date()
    const hoyLocal = getLocalDateString()
    const ahoraMinutos = ahora.getHours() * 60 + ahora.getMinutes()
    return huecos.filter((h) => {
      if (h.fecha < hoyLocal) return false
      if (h.fecha !== hoyLocal) return true
      return timeToMinutes(h.hora_inicio) > ahoraMinutos
    })
  }, [huecos])

  const agrupadosPorFecha = useMemo(() => {
    return huecosFiltrados.reduce((acc, h) => {
      const key = h.fecha
      if (!acc[key]) acc[key] = []
      acc[key].push(h)
      return acc
    }, {})
  }, [huecosFiltrados])

  return { huecos: huecosFiltrados, agrupadosPorFecha, loading, error, recargar: load }
}
