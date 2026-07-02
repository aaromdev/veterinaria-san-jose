import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAdmin } from '../../context/AdminContext'
import { InfoCitaPanel } from '../../components/atencion/InfoCitaPanel'
import { PagoModal } from '../../components/atencion/PagoModal'
import { RecetaForm } from '../../components/atencion/RecetaForm'
import { ConfirmarAtencionModal } from '../../components/atencion/ConfirmarAtencionModal'
import { HistoriaClinicaPanel } from '../../components/atencion/HistoriaClinicaPanel'
import { usePago } from '../../hooks/usePago'
import { useReceta } from '../../hooks/useReceta'
import { useHistoriaClinica } from '../../hooks/useHistoriaClinica'
import { useGenerarPdfReceta } from '../../hooks/useGenerarPdfReceta'

export function DetalleCita() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { personal } = useAdmin()
  const { registrarPago, getPagoDeCita, saving: savingPago, error: errorPago } = usePago()
  const { getRecetaDeCita, error: errorReceta } = useReceta()
  const { generarPdf, generando: generandoPdf, error: errorPdf } = useGenerarPdfReceta()

  const [cita, setCita] = useState(null)
  const [pagoInfo, setPagoInfo] = useState(null)
  const [recetaInfo, setRecetaInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [mostrandoAtencion, setMostrandoAtencion] = useState(false)
  const [confirmacionData, setConfirmacionData] = useState(null)
  const [errorCarga, setErrorCarga] = useState(null)
  const [saving, setSaving] = useState(false)
  const [selectedMascotaId, setSelectedMascotaId] = useState(null)

  const mascotasDelCita = cita?.cita_mascota?.map(cm => cm.mascota) || []
  const { entradas, recetasMap, loading: loadingHistoria } = useHistoriaClinica(selectedMascotaId)

  useEffect(() => {
    if (mascotasDelCita.length > 0) {
      setSelectedMascotaId(prev => {
        if (prev && mascotasDelCita.some(m => m.id === prev)) return prev
        return mascotasDelCita[0].id
      })
    }
  }, [mascotasDelCita])

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cita')
        .select(`
          id, estado, precio_total,
          hueco!cita_id_hueco_fkey!inner ( id, fecha, hora_inicio, hora_fin, sala ( id, nombre ), servicio ( id, nombre, precio ) ),
          cita_mascota (
            mascota ( id, nombre, especie_mascota ( nombre ) )
          ),
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

  const handleRegistrarPago = () => setShowPagoModal(true)

  const handleConfirmarPago = async ({ id_metodo_pago, monto }) => {
    const ok = await registrarPago({
      id_cita: id,
      id_metodo_pago,
      monto,
      confirmado_por: personal?.id,
    })
    if (ok) {
      setShowPagoModal(false)
      cargar()
    }
  }

  const handleIniciarAtencion = () => setMostrandoAtencion(true)

  const handleFinalizarAtencion = ({ mascotas_atencion, firmado }) => {
    setConfirmacionData({ mascotas_atencion, firmado })
  }

  const handleConfirmarAtencion = async () => {
    if (!confirmacionData) return
    setSaving(true)
    const { error: rpcError } = await supabase.rpc('finalizar_atencion_multi', {
      p_id_cita: id,
      p_id_veterinario: personal?.id,
      p_firmado: confirmacionData.firmado ?? false,
      p_mascotas_atencion: confirmacionData.mascotas_atencion || [],
    })
    if (rpcError) {
      alert('Error al finalizar atención: ' + rpcError.message)
      setSaving(false)
      return
    }
    setConfirmacionData(null)
    setMostrandoAtencion(false)
    setSaving(false)
    cargar()
  }

  const handleCancelarCita = async () => {
    if (!window.confirm('¿Estás seguro? Esta acción no se puede deshacer')) return
    const { error } = await supabase.rpc('cancelar_cita', { p_id_cita: id })
    if (error) {
      alert('Error al cancelar cita: ' + error.message)
      return
    }
    navigate('/admin/agenda')
  }

  const handleGenerarPdf = useCallback(() => {
    generarPdf({ cita, recetaInfo, personal })
  }, [cita, recetaInfo, personal, generarPdf])

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
          {errorCarga && (
            <p className="text-sm text-red-600 mt-2">{errorCarga}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/agenda')}
          className="text-xs text-[#7A6555] hover:text-[#C2570F] transition-colors mb-2 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 4L6 8L10 12" />
          </svg>
          Volver a agenda
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <InfoCitaPanel
            cita={cita}
            pagoInfo={pagoInfo}
            onRegistrarPago={handleRegistrarPago}
            onIniciarAtencion={handleIniciarAtencion}
            onCancelarCita={handleCancelarCita}
            onGenerarPdf={handleGenerarPdf}
            generando={generandoPdf}
            errorPdf={errorPdf}
          />

          {mostrandoAtencion && (
            <RecetaForm
              cita={cita}
              onFinalizar={handleFinalizarAtencion}
              saving={saving}
              error={errorReceta}
            />
          )}

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
                <p className="text-xs text-[#7A6555]">
                  {recetaInfo.firmado ? '✓ Firmada' : 'Sin firmar'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {mascotasDelCita.length > 1 && (
            <div className="bg-white border border-[#E8DDD0] rounded-xl p-4">
              <h4 className="text-xs font-semibold text-[#2C1A0E] mb-3">Ver historia de</h4>
              <div className="space-y-2">
                {mascotasDelCita.map(m => (
                  <label key={m.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="mascota-historia"
                      checked={selectedMascotaId === m.id}
                      onChange={() => setSelectedMascotaId(m.id)}
                      className="accent-[#C2570F] w-3.5 h-3.5"
                    />
                    <span className="text-sm text-[#2C1A0E] group-hover:text-[#C2570F] transition-colors">{m.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <HistoriaClinicaPanel entradas={entradas} loading={loadingHistoria} recetasMap={recetasMap} />
        </div>
      </div>

      <PagoModal
        open={showPagoModal}
        onClose={() => setShowPagoModal(false)}
        onConfirm={handleConfirmarPago}
        montoSugerido={cita?.precio_total || cita?.hueco?.servicio?.precio || ''}
        saving={savingPago}
        error={errorPago}
      />

      <ConfirmarAtencionModal
        open={!!confirmacionData}
        onClose={() => setConfirmacionData(null)}
        onConfirm={handleConfirmarAtencion}
        data={confirmacionData}
        cita={cita}
        saving={saving}
      />
    </div>
  )
}
