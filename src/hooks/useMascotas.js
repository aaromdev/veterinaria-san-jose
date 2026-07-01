import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatearErrorSupabase } from '../lib/validaciones'

export function useMascotas() {
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setMascotas([])
      setLoading(false)
      return
    }

    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .select('id')
      .eq('id_cuenta', session.user.id)
      .single()

    if (clienteError || !cliente) {
      setError('No se pudo identificar al cliente')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('mascota')
      .select(`
        id, nombre, fecha_nacimiento, is_active,
        especie_mascota ( id, nombre ),
        raza ( id, nombre )
      `)
      .eq('id_cliente', cliente.id)
      .eq('is_active', true)
      .order('nombre')

    if (error) setError(error.message)
    else setMascotas(data)
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const agregar = useCallback(async (datos) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No autenticado')

    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .select('id')
      .eq('id_cuenta', session.user.id)
      .single()
    if (clienteError || !cliente) throw new Error('No se pudo identificar al cliente')

    const { data: mascota, error: mascotaError } = await supabase
      .rpc('crear_mascota', {
        p_id_cliente: cliente.id,
        p_id_especie: datos.id_especie,
        p_id_raza: datos.id_raza || null,
        p_nombre: datos.nombre.trim(),
        p_fecha_nacimiento: datos.fecha_nacimiento,
      })
    if (mascotaError) throw new Error(formatearErrorSupabase(mascotaError))

    setMascotas((prev) => [...prev, mascota].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    return mascota
  }, [])

  const actualizar = useCallback(async (id, datos) => {
    const { data: current } = await supabase
      .from('mascota')
      .select('id_especie, id_raza')
      .eq('id', id)
      .single()

    if (current) {
      const especieChanged = datos.id_especie !== current.id_especie
      const razaChanged = (datos.id_raza || null) !== (current.id_raza || null)
      if (especieChanged || razaChanged) {
        const { data: citas } = await supabase
          .from('cita')
          .select('id')
          .eq('id_mascota', id)
          .in('estado', ['PROGRAMADA', 'EN_ESPERA'])
          .limit(1)
        if (citas?.length > 0) {
          throw new Error('No se puede cambiar la especie o raza porque la mascota tiene citas programadas o en espera')
        }
      }
    }

    const { data, error } = await supabase
      .from('mascota')
      .update({
        nombre: datos.nombre.trim(),
        id_especie: datos.id_especie,
        id_raza: datos.id_raza || null,
        fecha_nacimiento: datos.fecha_nacimiento,
      })
      .eq('id', id)
      .select(`
        id, nombre, fecha_nacimiento, is_active,
        especie_mascota ( id, nombre ),
        raza ( id, nombre )
      `)
      .single()
    if (error) throw new Error(formatearErrorSupabase(error))
    setMascotas((prev) => prev.map((m) => (m.id === id ? data : m)))
    return data
  }, [])

  const desactivar = useCallback(async (id) => {
    const { data: citas } = await supabase
      .from('cita')
      .select('id')
      .eq('id_mascota', id)
      .in('estado', ['PROGRAMADA', 'EN_ESPERA'])
      .limit(1)
    if (citas?.length > 0) {
      throw new Error('No se puede desactivar la mascota porque tiene citas programadas o en espera')
    }
    const { error } = await supabase
      .from('mascota')
      .update({ is_active: false })
      .eq('id', id)
    if (error) throw new Error(formatearErrorSupabase(error))
    setMascotas((prev) => prev.filter((m) => m.id !== id))
  }, [])

  return { mascotas, loading, error, agregar, actualizar, desactivar, recargar: cargar }
}
