import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatearErrorSupabase } from '../lib/validaciones'

export function useMedicamentosAll() {
  const [medicamentos, setMedicamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('medicamento')
      .select('id, nombre, descripcion, concentracion, presentacion, is_active')
      .order('nombre')
    if (error) setError(error.message)
    else setMedicamentos(data)
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  /**
   * Verifica si ya existe un medicamento con el mismo nombre (sin importar
   * mayúsculas/minúsculas ni espacios al inicio/fin).
   * Excluye el id actual al editar para no bloquearse a sí mismo.
   */
  const existeNombre = useCallback((nombre, excludeId = null) => {
    const normalizado = nombre.trim().toLowerCase()
    return medicamentos.some(
      (m) => m.nombre.trim().toLowerCase() === normalizado && m.id !== excludeId
    )
  }, [medicamentos])

  const agregar = useCallback(async (datos) => {
    if (existeNombre(datos.nombre)) {
      throw { message: `Ya existe un medicamento llamado "${datos.nombre.trim()}"` }
    }
    const { data, error } = await supabase
      .from('medicamento')
      .insert({
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion?.trim() || null,
        concentracion: datos.concentracion?.trim() || null,
        presentacion: datos.presentacion?.trim() || null,
      })
      .select()
      .single()
    if (error) throw new Error(formatearErrorSupabase(error))
    setMedicamentos((prev) => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
  }, [existeNombre])

  const actualizar = useCallback(async (id, datos) => {
    if (existeNombre(datos.nombre, id)) {
      throw { message: `Ya existe un medicamento llamado "${datos.nombre.trim()}"` }
    }
    const { data, error } = await supabase
      .from('medicamento')
      .update({
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion?.trim() || null,
        concentracion: datos.concentracion?.trim() || null,
        presentacion: datos.presentacion?.trim() || null,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(formatearErrorSupabase(error))
    setMedicamentos((prev) => prev.map((m) => (m.id === id ? data : m)))
  }, [existeNombre])

  const toggleActivo = useCallback(async (id) => {
    const med = medicamentos.find((m) => m.id === id)
    if (!med) return
    const { data, error } = await supabase
      .from('medicamento')
      .update({ is_active: !med.is_active })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(formatearErrorSupabase(error))
    setMedicamentos((prev) => prev.map((m) => (m.id === id ? data : m)))
  }, [medicamentos])

  return { medicamentos, loading, error, agregar, actualizar, toggleActivo, cargar }
}
