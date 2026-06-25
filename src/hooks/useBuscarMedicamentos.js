import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useBuscarMedicamentos(query, { soloActivos = true, limite = 8 } = {}) {
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = query?.trim()
    if (!q || q.length < 1) {
      setResultados([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      let builder = supabase
        .from('medicamento')
        .select('id, nombre, descripcion, concentracion, presentacion, is_active')
        .ilike('nombre', `%${q}%`)
        .order('nombre')
        .limit(limite)

      if (soloActivos) {
        builder = builder.eq('is_active', true)
      }

      const { data, error } = await builder
      if (!error) setResultados(data || [])
      setLoading(false)
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, soloActivos, limite])

  return { resultados, loading }
}
