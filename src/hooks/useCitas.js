import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCitas(idCliente) {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    if (!idCliente) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('cita')
      .select(`
        id, estado, fecha_programada,
        hueco!cita_id_hueco_fkey (
          id, fecha, hora_inicio, hora_fin,
          sala ( id, nombre ),
          servicio ( id, nombre, precio )
        ),
        mascota ( id, nombre ),
        cita_hueco (
          id_hueco,
          orden,
          hueco ( id, hora_inicio, hora_fin )
        )
      `)
      .eq('id_cliente', idCliente)

    if (error) {
      setError(error.message)
      setCitas([])
    } else {
      const ordenadas = (data || []).sort((a, b) => {
        const fechaA = a.hueco?.fecha || ''
        const fechaB = b.hueco?.fecha || ''
        if (fechaA !== fechaB) return fechaB.localeCompare(fechaA)
        const horaA = a.hueco?.hora_inicio || ''
        const horaB = b.hueco?.hora_inicio || ''
        return horaB.localeCompare(horaA)
      })
      setCitas(ordenadas)
    }
    setLoading(false)
  }, [idCliente])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { citas, loading, error, recargar: cargar }
}
