export function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'No definido'
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)

  let años = hoy.getFullYear() - nac.getFullYear()
  let meses = hoy.getMonth() - nac.getMonth()
  if (meses < 0 || (meses === 0 && hoy.getDate() < nac.getDate())) {
    años--
    meses += 12
  }

  if (años >= 1) {
    return `${años} ${años === 1 ? 'año' : 'años'}`
  }
  return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
}
