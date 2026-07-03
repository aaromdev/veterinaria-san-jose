import { useState, useMemo } from 'react'

import { CatalogoLayout } from '../../../components/catalogos/CatalogoLayout'
import { CatalogoModal } from '../../../components/catalogos/CatalogoModal'
import { ToggleActivoBtn } from '../../../components/catalogos/ToggleActivoBtn'
import { Badge } from '../../../components/ui/Badge'
import { BarraBusqueda } from '../../../components/ui/BarraBusqueda'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'

import { usePlantillas } from '../../../hooks/usePlantillas'
import { useServiciosAll } from '../../../hooks/useServiciosAll'
import { useSalas } from '../../../hooks/useSalas'

const DIAS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

const DIA_OPTIONS = DIAS.map((d, i) => ({
  value: String(i),
  label: d,
}))

const DIAS_CHECKBOX = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
]

const FORM_VACIO = {
  id_servicio: '',
  id_sala: '',
  dia_semana: '',
  hora_inicio: '',
  hora_fin: '',
  intervalo_minutos: '',
}

function validar(f, servicios, salas, plantillas, editandoId) {
  const e = {}

  if (!f.id_servicio)
    e.id_servicio = 'Selecciona un servicio'

  if (!f.id_sala)
    e.id_sala = 'Selecciona una sala'

  if (f.id_servicio && f.id_sala) {
    const servicio = servicios.find((s) => s.id === f.id_servicio)
    const sala = salas.find((s) => s.id === f.id_sala)

    if (
      servicio &&
      sala &&
      servicio.categoria_sala?.id !== sala.categoria_sala?.id
    ) {
      e.id_sala = 'La sala no corresponde a la categoría del servicio'
    }

    // Validar intervalo >= duración del servicio
    if (
      servicio &&
      f.intervalo_minutos &&
      !isNaN(f.intervalo_minutos) &&
      parseInt(f.intervalo_minutos) < servicio.duracion_minutos
    ) {
      e.intervalo_minutos = `El intervalo no puede ser menor que la duración del servicio (${servicio.duracion_minutos} min)`
    }
  }

  if (f.dia_semana === '')
    e.dia_semana = 'Selecciona un día'

  // Validar solapamiento de horarios
  if (f.id_servicio && f.id_sala && f.dia_semana !== '' && f.hora_inicio && f.hora_fin) {
    const dia = parseInt(f.dia_semana)
    const solapada = plantillas.some(
      (p) =>
        p.id !== editandoId &&
        p.servicio?.id === f.id_servicio &&
        p.sala?.id === f.id_sala &&
        p.dia_semana === dia &&
        f.hora_inicio < p.hora_fin &&
        f.hora_fin > p.hora_inicio
    )
    if (solapada) {
      e.id_servicio = 'Ya existe una plantilla que se solapa con este horario para el mismo servicio, sala y día'
    }
  }

  if (!f.hora_inicio)
    e.hora_inicio = 'Requerido'

  if (!f.hora_fin)
    e.hora_fin = 'Requerido'

  if (
    f.hora_inicio &&
    f.hora_fin &&
    f.hora_fin <= f.hora_inicio
  ) {
    e.hora_fin = 'Debe ser después de la hora de inicio'
  }

  if (
    !f.intervalo_minutos ||
    isNaN(f.intervalo_minutos) ||
    parseInt(f.intervalo_minutos) <= 0
  ) {
    e.intervalo_minutos = 'Ingresa un intervalo válido'
  }

  return e
}

function EditBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7A6555] hover:bg-[#FAF7F2] hover:text-[#C2570F] transition-colors"
      title="Editar"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
      >
        <path
          d="M11.5 1.5L13.5 3.5L5 12L2 13L3 10L11.5 1.5Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M9 3L12 6"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    </button>
  )
}

export function Plantillas() {
  const {
  plantillas,
 filtrarPlantillas,

  loading,
  agregar,
  actualizar,
  toggleActivo,

  filtroFechaDesde,
  setFiltroFechaDesde,

  filtroFechaHasta,
  setFiltroFechaHasta,

  limpiarFiltrosFecha,
  hayFiltroFecha,
} = usePlantillas()

  const { servicios } = useServiciosAll()
  const { salas } = useSalas()

  const [modal, setModal] = useState({
    open: false,
    editando: null,
  })

  const [form, setForm] = useState(FORM_VACIO)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [diasSeleccionados, setDiasSeleccionados] = useState([])

  const toggleDia = (dia) => {
    setDiasSeleccionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    )
  }

  const resetFiltros = () => {
    setBusqueda('')
    setDiasSeleccionados([])
    limpiarFiltrosFecha()
  }

  const servicioOptions = useMemo(
    () =>
      servicios
        .filter((s) => s.is_active)
        .map((s) => ({
          value: s.id,
          label: s.nombre,
        })),
    [servicios]
  )

  const salaOptions = useMemo(
    () =>
      salas
        .filter((s) => s.is_active)
        .map((s) => ({
          value: s.id,
          label: s.nombre,
        })),
    [salas]
  )

  const filtrados = useMemo(
    () => filtrarPlantillas(busqueda, diasSeleccionados),
    [filtrarPlantillas, busqueda, diasSeleccionados]
  )

  const abrirCrear = () => {
    setForm(FORM_VACIO)
    setErrors({})
    setModal({
      open: true,
      editando: null,
    })
  }

  const abrirEditar = (p) => {
    setForm({
      id_servicio: p.servicio?.id || '',
      id_sala: p.sala?.id || '',
      dia_semana: String(p.dia_semana),
      hora_inicio: p.hora_inicio,
      hora_fin: p.hora_fin,
      intervalo_minutos: String(p.intervalo_minutos),
    })

    setErrors({})

    setModal({
      open: true,
      editando: p,
    })
  }

  const guardar = async () => {
    const e = validar(form, servicios, salas, plantillas, modal.editando?.id)

    setErrors(e)

    if (Object.keys(e).length > 0) return

    setSaving(true)

    try {
      if (modal.editando) {
        await actualizar(modal.editando.id, form)
      } else {
        await agregar(form)
      }

      setModal({
        open: false,
        editando: null,
      })
    } catch (err) {
      setErrors({
        id_servicio: err.message,
      })
    }

    setSaving(false)
  }

  const handleChange = (field) => (e) => {
    const val = e.target.value

    setForm((prev) => {
      const next = {
        ...prev,
        [field]: val,
      }

      if (field === 'id_servicio') {
        const s = servicios.find(
          (sv) => sv.id === val
        )

        if (s?.duracion_minutos) {
          next.intervalo_minutos = String(
            s.duracion_minutos
          )
        }
      }

      return next
    })
  }

  return (
    <CatalogoLayout
      titulo="Plantillas de horario"
      descripcion="Define los horarios recurrentes por día y servicio"
      onAgregar={abrirCrear}
      total={plantillas.length}
    >
      <BarraBusqueda
        placeholder="Buscar por servicio o sala..."
        value={busqueda}
        onChange={setBusqueda}
        filtros={[]}
      />

      {/* Checkboxes de días */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-[#7A6555]">Días:</span>
        {DIAS_CHECKBOX.map((dia) => {
          const activo = diasSeleccionados.includes(dia.value)
          return (
            <button
              key={dia.value}
              type="button"
              onClick={() => toggleDia(dia.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                activo
                  ? 'bg-[#C2570F] text-white border-[#C2570F]'
                  : 'bg-white text-[#7A6555] border-[#D9C6B5] hover:border-[#C2570F] hover:text-[#C2570F]'
              }`}
            >
              {dia.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4 rounded-xl border border-[#E8DDD0] bg-[#FAF9F6] p-4">

  <div>
    <label className="mb-1 block text-xs font-medium text-[#7A6555]">
      Desde
    </label>

    <Input
      type="date"
      value={filtroFechaDesde}
      onChange={(e) => setFiltroFechaDesde(e.target.value)}
    />
  </div>

  <div>
    <label className="mb-1 block text-xs font-medium text-[#7A6555]">
      Hasta
    </label>

    <Input
      type="date"
      value={filtroFechaHasta}
      onChange={(e) => setFiltroFechaHasta(e.target.value)}
    />
  </div>

  <button
    onClick={resetFiltros}
    className="rounded-lg border border-[#D9C6B5] px-4 py-2 text-sm text-[#7A6555] hover:bg-white transition-colors"
  >
    Limpiar filtros
  </button>

  <div className="ml-auto text-sm font-medium text-[#7A6555]">
    {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
  </div>

</div>
      <div className="w-full overflow-hidden rounded-xl border border-[#E8DDD0] bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAF7F2]">
              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">
                Servicio
              </th>

              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">
                Sala
              </th>

              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">
                Día
              </th>

              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">
                Horario
              </th>

              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">
                Intervalo
              </th>

              <th className="text-xs font-semibold text-[#7A6555] uppercase tracking-wide px-5 py-3.5 text-left">
                Estado
              </th>

              <th className="px-5 py-3.5" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-sm text-[#7A6555]"
                >
                  Cargando...
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-sm text-[#7A6555]"
                >
                  {busqueda || diasSeleccionados.length > 0 || hayFiltroFecha
                    ? 'Sin resultados para esta búsqueda'
                    : 'Sin registros'}
                </td>
              </tr>
            ) : (
              filtrados.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-[#E8DDD0] hover:bg-[#FAF7F2] transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-[#2C1A0E]">
                    {p.servicio?.nombre || '—'}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-[#2C1A0E]">
                    {p.sala?.nombre || '—'}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-[#2C1A0E]">
                    {DIAS[p.dia_semana]}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-[#2C1A0E]">
                    {p.hora_inicio?.slice(0, 5)} – {p.hora_fin?.slice(0, 5)}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-[#2C1A0E]">
                    {p.intervalo_minutos} min
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Badge activo={p.is_active} />

                      <ToggleActivoBtn
                        activo={p.is_active}
                        onToggle={() => toggleActivo(p.id)}
                        nombre="plantilla"
                      />
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <EditBtn
                      onClick={() => abrirEditar(p)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CatalogoModal
        open={modal.open}
        onClose={() =>
          setModal({
            open: false,
            editando: null,
          })
        }
        titulo={
          modal.editando
            ? 'Editar plantilla'
            : 'Nueva plantilla'
        }
        onGuardar={guardar}
        cargando={saving}
      >
        <Select
          label="Servicio"
          placeholder="Seleccionar servicio"
          options={servicioOptions}
          value={form.id_servicio}
          onChange={handleChange('id_servicio')}
          error={errors.id_servicio}
        />

        <Select
          label="Sala"
          placeholder="Seleccionar sala"
          options={salaOptions}
          value={form.id_sala}
          onChange={handleChange('id_sala')}
          error={errors.id_sala}
        />

        <Select
          label="Día de la semana"
          placeholder="Seleccionar día"
          options={DIA_OPTIONS}
          value={form.dia_semana}
          onChange={handleChange('dia_semana')}
          error={errors.dia_semana}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Hora inicio"
            type="time"
            value={form.hora_inicio}
            onChange={handleChange('hora_inicio')}
            error={errors.hora_inicio}
          />

          <Input
            label="Hora fin"
            type="time"
            value={form.hora_fin}
            onChange={handleChange('hora_fin')}
            error={errors.hora_fin}
          />
        </div>

        <Input
          label="Intervalo (min)"
          type="number"
          min="1"
          value={form.intervalo_minutos}
          onChange={handleChange('intervalo_minutos')}
          error={errors.intervalo_minutos}
          placeholder="30"
          filter="digits"
        />
        {form.id_servicio && (() => {
          const sv = servicios.find(s => s.id === form.id_servicio)
          if (!sv?.duracion_minutos) return null
          return (
            <p className="text-xs text-[#7A6555] -mt-1">
              Duración del servicio: {sv.duracion_minutos} min. El intervalo debe ser mayor o igual.
            </p>
          )
        })()}
      </CatalogoModal>
    </CatalogoLayout>
  )
}