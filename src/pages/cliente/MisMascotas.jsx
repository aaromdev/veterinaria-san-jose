import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMascotas } from '../../hooks/useMascotas'
import { ConfirmModal } from '../../components/ui/ConfirmModal'

function calcularEdad(fechaNacimiento) {
  const nacimiento = new Date(fechaNacimiento)
  const hoy = new Date()
  let años = hoy.getFullYear() - nacimiento.getFullYear()
  let meses = hoy.getMonth() - nacimiento.getMonth()
  if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
    años--
    meses += 12
  }
  if (años < 1) {
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  }
  return `${años} ${años === 1 ? 'año' : 'años'}`
}

function MascotaCard({ mascota, onEliminar }) {
  const [confirmando, setConfirmando] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await onEliminar(mascota.id)
      setConfirmando(false)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-[#FFF3EB] rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-[#C2570F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="14" r="4.5" />
            <path d="M5 8C5 8 7 4 12 4C17 4 19 8 19 8" strokeLinecap="round" />
            <circle cx="7.5" cy="7.5" r="1.2" />
            <circle cx="16.5" cy="7.5" r="1.2" />
          </svg>
        </div>
        <button
          onClick={() => setConfirmando(true)}
          className="text-[#7A6555] hover:text-[#B91C1C] transition-colors p-1.5 rounded-lg hover:bg-[#B91C1C]/5"
          title="Eliminar mascota"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4H14M5.5 4V2.5C5.5 2.22386 5.72386 2 6 2H10C10.2761 2 10.5 2.22386 10.5 2.5V4M6.5 7V11M9.5 7V11M3.5 4L4 13C4 13.5523 4.44772 14 5 14H11C11.5523 14 12 13.5523 12 13L12.5 4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <h3 className="text-base font-bold text-[#2C1A0E] mb-1">{mascota.nombre}</h3>
      <p className="text-sm text-[#7A6555] mb-3">
        {mascota.especie_mascota?.nombre}
        {mascota.raza?.nombre && ` · ${mascota.raza.nombre}`}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-[#E8DDD0]">
        <span className="text-xs text-[#7A6555]">
          {calcularEdad(mascota.fecha_nacimiento)}
        </span>
        <Link
          to={`/cliente/mascotas/${mascota.id}/editar`}
          className="text-xs text-[#C2570F] font-medium hover:underline"
        >
          Editar
        </Link>
      </div>

      <ConfirmModal
        open={confirmando}
        onClose={() => { setConfirmando(false); setDeleteError(null) }}
        onConfirm={handleDelete}
        titulo="Eliminar mascota"
        mensaje={`¿Seguro que deseas eliminar a ${mascota.nombre}? Esta acción no se puede deshacer.`}
        confirmarTexto="Eliminar"
        variant="destructive"
        loading={deleting}
        error={deleteError}
      />
    </div>
  )
}

export function MisMascotas() {
  const { mascotas, loading, error, desactivar } = useMascotas()

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#2C1A0E]">Mis mascotas</h1>
          <p className="text-sm text-[#7A6555] mt-1">Administra tus mascotas registradas</p>
        </div>
        <Link
          to="/cliente/mascotas/nueva"
          className="inline-flex items-center gap-2 bg-[#C2570F] text-white font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-[#A8480C] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 3V13M3 8H13" />
          </svg>
          Nueva mascota
        </Link>
      </div>

      {error && (
        <p className="text-sm text-[#B91C1C] bg-[#B91C1C]/5 px-4 py-3 rounded-lg mb-6">{error}</p>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E8DDD0] p-14 flex items-center justify-center">
          <p className="text-sm text-[#7A6555]">Cargando mascotas...</p>
        </div>
      ) : mascotas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8DDD0] p-14 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#FFF3EB] rounded-2xl flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-[#C2570F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="14" r="4.5" />
              <path d="M5 8C5 8 7 4 12 4C17 4 19 8 19 8" strokeLinecap="round" />
              <circle cx="7.5" cy="7.5" r="1.2" />
              <circle cx="16.5" cy="7.5" r="1.2" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#2C1A0E] mb-1">Aún no tienes mascotas</h2>
          <p className="text-sm text-[#7A6555] max-w-xs mb-5">Registra a tu primera mascota para empezar a agendar citas.</p>
          <Link
            to="/cliente/mascotas/nueva"
            className="inline-flex items-center gap-2 bg-[#C2570F] text-white font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-[#A8480C] transition-colors"
          >
            Registrar mascota
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mascotas.map((m) => (
            <MascotaCard key={m.id} mascota={m} onEliminar={desactivar} />
          ))}
        </div>
      )}
    </div>
  )
}
