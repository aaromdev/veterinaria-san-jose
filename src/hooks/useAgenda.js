import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const POLL_INTERVAL_MS = 20000

export function useAgenda(fecha) {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const channelRef = useRef(null)
  const pollRef = useRef(null)
  const cargandoRef = useRef(false)

  const cargar = useCallback(async (opts) => {
    if (cargandoRef.current) return
    cargandoRef.current = true
    setError(null)

    if (opts?.showLoading) setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      cargandoRef.current = false
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('cita')
        .select(`
          id, estado,
          hueco!cita_id_hueco_fkey!inner (
            id, fecha, hora_inicio, hora_fin,
            sala!inner ( id, nombre ),
            servicio ( id, nombre )
          ),
          mascota ( id, nombre ),
          cliente ( id, nombre, apellido, telefono ),
          cita_hueco (
            id_hueco,
            orden,
            hueco ( id, hora_inicio, hora_fin )
          )
        `)
        .eq('hueco.fecha', fecha)
        .in('estado', ['PROGRAMADA', 'EN_ESPERA', 'FINALIZADA'])
      if (error) {
        setError(error.message)
        setCitas([])
      } else {
        setCitas(data || [])
      }
      setLastUpdate(new Date())
    } catch (err) {
      setError(err.message)
      setCitas([])
    } finally {
      setLoading(false)
      cargandoRef.current = false
    }
  }, [fecha])

  const citasOrdenadas = useMemo(() => {
    return [...citas].sort((a, b) => {
      const aInicio = a.hueco?.hora_inicio || ''
      const bInicio = b.hueco?.hora_inicio || ''
      return aInicio.localeCompare(bInicio)
    })
  }, [citas])

  useEffect(() => {
    cargar({ showLoading: true })

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`agenda-${fecha}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cita' },
        () => cargar()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hueco' },
        () => cargar()
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => cargar(), POLL_INTERVAL_MS)

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
      if (pollRef.current) {
        clearInterval(pollRef.current)
      }
    }
  }, [cargar])

  return { citas: citasOrdenadas, loading, error, connected, lastUpdate, recargar: cargar }
}
