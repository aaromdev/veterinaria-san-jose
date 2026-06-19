export const LIMITES = {
  ESPECIE_NOMBRE: 30,
  RAZA_NOMBRE: 60,
  CATEGORIA_SALA_NOMBRE: 40,
  SALA_NOMBRE: 50,
  SERVICIO_NOMBRE: 80,
  TIPO_DOCUMENTO_NOMBRE: 20,
  TIPO_ENTRADA_NOMBRE: 50,
  METODO_PAGO_NOMBRE: 30,
  CLIENTE_NOMBRE: 100,
  CLIENTE_APELLIDO: 100,
  CLIENTE_NUMERO_DOCUMENTO: 20,
  CLIENTE_TELEFONO: 20,
  PERSONAL_NOMBRE: 100,
  PERSONAL_TELEFONO: 20,
  MASCOTA_NOMBRE: 50,
  MEDICAMENTO_NOMBRE: 100,
  MEDICAMENTO_DOSIS: 50,
  EMAIL: 254,
}

export function validarLongitud(valor, maximo, campoLabel) {
  if (valor && valor.length > maximo) {
    return `${campoLabel} debe tener máximo ${maximo} caracteres`
  }
  return null
}

export function limpiarErrorAlEscribir(setter) {
  return () => setter({})
}

const ERRORES_SUPABASE = {
  '22001': 'El valor ingresado es demasiado largo para este campo',
  '23505': 'Ya existe un registro con ese mismo valor',
  '23503': 'No se puede eliminar porque otros registros dependen de él',
  '23502': 'Completa todos los campos obligatorios',
}

export function formatearErrorSupabase(error) {
  if (!error) return 'Error desconocido'
  if (typeof error === 'string') return error
  const msg = ERRORES_SUPABASE[error.code]
  if (msg) return msg
  if (error.message?.includes('value too long')) return 'El valor ingresado es demasiado largo para este campo'
  return error.message || 'Error desconocido'
}
