import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const USUARIO_VACIO = {
  email: '',
  password: '',
  tipo: 'CLIENTE',
  nombre: '',
  apellido: '',
  telefono: '',
  id_tipo_documento: '',
  numero_documento: '',
  rol: 'VETERINARIO',
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: rpcError } = await supabase
      .rpc('admin_listar_usuarios')
    if (rpcError) {
      setError(rpcError.message)
    } else {
      setUsuarios(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crear = useCallback(async (datos) => {
    setSaving(true)
    setError(null)
    try {
      if (datos.tipo === 'CLIENTE' && datos.id_tipo_documento && datos.numero_documento) {
        const { data: docExistente } = await supabase
          .from('cliente')
          .select('id')
          .eq('id_tipo_documento', datos.id_tipo_documento)
          .eq('numero_documento', datos.numero_documento.trim())
          .maybeSingle()
        if (docExistente) {
          throw new Error('Ya existe un cliente registrado con ese documento de identidad')
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: datos.email,
        password: datos.password,
        options: datos.tipo === 'PERSONAL'
          ? { data: { tipo: 'personal', rol: datos.rol, nombre: datos.nombre } }
          : undefined,
      })

      if (authError) throw new Error(authError.message)
      const cuentaId = authData.user?.id
      if (!cuentaId) throw new Error('No se pudo crear la cuenta')

      const { error: perfilError } = await supabase
        .rpc('admin_crear_perfil', {
          p_cuenta_id: cuentaId,
          p_tipo: datos.tipo,
          p_nombre: datos.nombre.trim(),
          p_apellido: datos.tipo === 'CLIENTE' ? datos.apellido.trim() : null,
          p_telefono: datos.telefono.trim() || null,
          p_id_tipo_documento: datos.tipo === 'CLIENTE' ? datos.id_tipo_documento || null : null,
          p_numero_documento: datos.tipo === 'CLIENTE' ? datos.numero_documento.trim() || null : null,
          p_rol: datos.tipo === 'PERSONAL' ? datos.rol : null,
        })

      if (perfilError) throw new Error(perfilError.message)
      await cargar()
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }, [cargar])

  const actualizar = useCallback(async (usuario, datos) => {
    setSaving(true)
    setError(null)
    try {
      const { error: rpcError } = await supabase
        .rpc('admin_actualizar_perfil', {
          p_cuenta_id: usuario.cuenta_id,
          p_tipo: usuario.tipo,
          p_nombre: datos.nombre.trim(),
          p_apellido: usuario.tipo === 'CLIENTE' ? datos.apellido.trim() : null,
          p_telefono: datos.telefono.trim() || null,
          p_id_tipo_documento: usuario.tipo === 'CLIENTE' ? datos.id_tipo_documento || null : null,
          p_numero_documento: usuario.tipo === 'CLIENTE' ? datos.numero_documento.trim() || null : null,
          p_rol: usuario.tipo === 'PERSONAL' ? datos.rol : null,
        })

      if (rpcError) throw new Error(rpcError.message)
      await cargar()
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }, [cargar])

  const toggleEstado = useCallback(async (cuentaId) => {
    setError(null)

    const usuario = usuarios.find((u) => u.cuenta_id === cuentaId)
    if (usuario?.tipo === 'CLIENTE') {
      const { data: citas } = await supabase
        .from('cita')
        .select('id')
        .eq('id_cliente', cuentaId)
        .in('estado', ['PROGRAMADA', 'EN_ESPERA'])
        .limit(1)
      if (citas?.length > 0) {
        setError('No se puede desactivar el usuario porque tiene citas pendientes')
        return false
      }
    }

    const { error: rpcError } = await supabase
      .rpc('admin_toggle_estado', { p_cuenta_id: cuentaId })
    if (rpcError) {
      setError(rpcError.message)
      return false
    }
    await cargar()
    return true
  }, [cargar, usuarios])

  return { usuarios, loading, saving, error, crear, actualizar, toggleEstado, recargar: cargar, USUARIO_VACIO }
}
