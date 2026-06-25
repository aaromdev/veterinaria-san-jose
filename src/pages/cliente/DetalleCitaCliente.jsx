import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePago } from '../../hooks/usePago'
import { useReceta } from '../../hooks/useReceta'
import { useHistoriaClinica } from '../../hooks/useHistoriaClinica'
import { TimelineHistoria } from '../../components/historia/TimelineHistoria'
import { Badge } from '../../components/ui/Badge'

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-[#E8DDD0]/50 last:border-0">
      <span className="text-xs text-[#7A6555]">{label}</span>
      <span className="text-sm font-medium text-[#2C1A0E] text-right">{value || '—'}</span>
    </div>
  )
}

function formatHora(hora) {
  return hora?.slice(0, 5) || '--:--'
}

function formatFecha(fecha) {
  if (!fecha) return '--'
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function DetalleCitaCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPagoDeCita } = usePago()
  const { getRecetaDeCita } = useReceta()

  const [cita, setCita] = useState(null)
  const [pagoInfo, setPagoInfo] = useState(null)
  const [recetaInfo, setRecetaInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)

  const { entradas, recetasMap, loading: loadingHistoria } = useHistoriaClinica(cita?.mascota?.id)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cita')
        .select(`
          id, estado,
          hueco!cita_id_hueco_fkey!inner ( id, fecha, hora_inicio, hora_fin, sala ( id, nombre ), servicio ( id, nombre, precio ) ),
          mascota ( id, nombre, especie_mascota ( nombre ) ),
          cliente ( id, nombre, apellido, telefono ),
          cita_hueco (
            id_hueco,
            orden,
            hueco ( id, hora_inicio, hora_fin )
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setCita(data)

      const [pago, receta] = await Promise.all([
        (data?.estado === 'EN_ESPERA' || data?.estado === 'FINALIZADA')
          ? getPagoDeCita(data.id)
          : Promise.resolve(null),
        data?.estado === 'FINALIZADA'
          ? getRecetaDeCita(data.id)
          : Promise.resolve(null),
      ])

      if (pago) setPagoInfo(pago)
      if (receta) setRecetaInfo(receta)
    } catch (err) {
      console.error('Error al cargar cita:', err)
      if (!cita) setErrorCarga(err.message || 'Error al cargar la cita')
    }
    setLoading(false)
  }, [id, getPagoDeCita, getRecetaDeCita])

  useEffect(() => { cargar() }, [cargar])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#7A6555]">Cargando...</p>
      </div>
    )
  }

  if (!cita) {
    return (
      <div className="animate-fade-in-up">
        <div className="bg-white rounded-2xl border border-[#E8DDD0] p-14 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-[#2C1A0E]">Cita no encontrada</h2>
          {errorCarga && <p className="text-sm text-red-600 mt-2">{errorCarga}</p>}
          <button
            onClick={() => navigate('/cliente/citas')}
            className="mt-4 text-xs text-[#C2570F] hover:text-[#A8480C] transition-colors"
          >
            Volver a mis citas
          </button>
        </div>
      </div>
    )
  }

  const hueco = cita.hueco
  const mascota = cita.mascota

  const extras = (cita?.cita_hueco || [])
    .map((ch) => ch.hueco)
    .filter(Boolean)
    .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
  const horaInicio = extras[0]?.hora_inicio || hueco?.hora_inicio
  const horaFin = extras[extras.length - 1]?.hora_fin || hueco?.hora_fin

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <button
          onClick={() => navigate('/cliente/citas')}
          className="text-xs text-[#7A6555] hover:text-[#C2570F] transition-colors mb-2 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 4L6 8L10 12" />
          </svg>
          Volver a mis citas
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-[#E8DDD0] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#2C1A0E]">Detalle de cita</h3>
              <Badge estado={cita.estado} />
            </div>
            <div>
              <InfoRow label="Mascota" value={mascota?.nombre} />
              <InfoRow label="Especie" value={mascota?.especie_mascota?.nombre} />
              <InfoRow label="Servicio" value={hueco?.servicio?.nombre} />
              <InfoRow label="Sala" value={hueco?.sala?.nombre} />
              <InfoRow label="Fecha" value={formatFecha(hueco?.fecha)} />
              <InfoRow label="Hora" value={`${formatHora(horaInicio)} - ${formatHora(horaFin)}`} />
              {cita.cliente?.telefono && <InfoRow label="Teléfono" value={cita.cliente.telefono} />}
              {hueco?.servicio?.precio && (
                <InfoRow label="Precio" value={`S/ ${Number(hueco.servicio.precio).toFixed(2)}`} />
              )}
            </div>

            {pagoInfo && (
              <div className="pt-2 border-t border-[#E8DDD0]">
                <div className="bg-[#FAF7F2] rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-medium text-[#7A6555] uppercase tracking-wide">Pago registrado</p>
                  <p className="text-sm font-semibold text-[#2C1A0E]">S/ {Number(pagoInfo.monto || 0).toFixed(2)}</p>
                  <p className="text-xs text-[#7A6555]">{pagoInfo.metodo_pago?.nombre}</p>
                </div>
              </div>
            )}
          </div>

          {cita.estado === 'FINALIZADA' && recetaInfo && (
            <div className="bg-white border border-[#E8DDD0] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#2C1A0E] mb-3">Receta</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-[#7A6555]">Diagnóstico: </span>
                  <span className="text-sm text-[#2C1A0E]">{recetaInfo.diagnostico}</span>
                </div>
                {recetaInfo.observaciones && (
                  <div>
                    <span className="text-xs font-medium text-[#7A6555]">Observaciones: </span>
                    <span className="text-sm text-[#2C1A0E]">{recetaInfo.observaciones}</span>
                  </div>
                )}
                {recetaInfo.receta_detalle?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#7A6555] mb-1">Medicamentos:</p>
                    <div className="space-y-1.5">
                      {recetaInfo.receta_detalle.map((det) => (
                        <div key={det.id} className="bg-[#FAF7F2] rounded-lg p-2.5">
                          <p className="text-sm font-medium text-[#2C1A0E]">{det.medicamento}</p>
                          {det.dosis && <p className="text-xs text-[#7A6555]">Dosis: {det.dosis}</p>}
                          {det.indicaciones && <p className="text-xs text-[#7A6555]">Ind: {det.indicaciones}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 pt-1 text-xs text-[#7A6555]">
                  {recetaInfo.personal?.nombre && (
                    <span>Veterinario: {recetaInfo.personal.nombre}</span>
                  )}
                  <span>{recetaInfo.firmado ? '✓ Firmada' : 'Sin firmar'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white border border-[#E8DDD0] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#2C1A0E] mb-4">Historia clínica</h3>
            <TimelineHistoria entradas={entradas} loading={loadingHistoria} recetasMap={recetasMap} />
          </div>
        </div>
      </div>
    </div>
  )
}
