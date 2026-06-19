import { useState } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { IconMapPin, IconPhone, IconMail } from '../ui/icons'
import { sanitize } from '../../lib/validaciones'
import contactSrc from '../../assets/contact.png'

const INITIAL = { nombre: '', email: '', mensaje: '' }

function validar(form) {
  const e = {}
  if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
  if (!form.email.trim()) {
    e.email = 'El email es obligatorio'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    e.email = 'Email inválido'
  }
  if (!form.mensaje.trim()) {
    e.mensaje = 'El mensaje no puede estar vacío'
  } else if (form.mensaje.trim().length < 10) {
    e.mensaje = 'El mensaje debe tener al menos 10 caracteres'
  }
  return e
}

export function ContactoSection() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  const { ref: refForm, isVisible: visForm } = useReveal()

  const handleChange = (e) => {
    const { name, value } = e.target
    const clean = name === 'nombre'
      ? sanitize(value, 'letters')
      : name === 'mensaje'
        ? sanitize(value, 'text')
        : value
    setForm((prev) => ({ ...prev, [name]: clean }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validar(form)
    setErrors(v)
    if (Object.keys(v).length) return

    setStatus('sending')
    try {
      const response = await fetch('https://formspree.io/f/xyzdlqjg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error('Error al enviar')
      setStatus('success')
      setForm(INITIAL)
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contacto" className="py-24 relative overflow-hidden bg-[#FAF7F2]">
      <div className="absolute inset-0">
        <img
          src={contactSrc}
          alt=""
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2]/80 via-[#FAF7F2]/40 to-[#FAF7F2]/60 mix-blend-multiply" />
      </div>

      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-[#4A7C59]/[0.03] blur-3xl" />
      <div className="absolute top-0 left-0 w-[25rem] h-[25rem] rounded-full bg-[#C2570F]/[0.03] blur-3xl" />

      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      <div className="max-w-5xl mx-auto px-8 relative z-10">
        <div className="text-center mb-12">
          <span className="text-[#C2570F] text-xs font-semibold tracking-[0.2em] uppercase mb-3 block">
            Comunicate con nosotros
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C1A0E]">Contactanos</h2>
        </div>

        <div ref={refForm} className={`max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[#E8DDD0] p-8 md:p-10 transition-all duration-700 ${visForm ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="font-bold text-[#2C1A0E] text-lg">Informacion de contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-[#C2570F] mt-0.5 shrink-0"><IconMapPin className="w-5 h-5" /></span>
                    <div>
                      <p className="text-sm font-medium text-[#2C1A0E]">Direccion</p>
                      <p className="text-sm text-[#7A6555]">Av. Principal 123, San Miguel</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C2570F] mt-0.5 shrink-0"><IconPhone className="w-5 h-5" /></span>
                    <div>
                      <p className="text-sm font-medium text-[#2C1A0E]">Telefono</p>
                      <p className="text-sm text-[#7A6555]">(01) 555 1234</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#C2570F] mt-0.5 shrink-0"><IconMail className="w-5 h-5" /></span>
                    <div>
                      <p className="text-sm font-medium text-[#2C1A0E]">Email</p>
                      <p className="text-sm text-[#7A6555]">contacto@veterinaria-san-jose.pe</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#E8DDD0] pt-6">
                  <p className="text-xs text-[#7A6555] leading-relaxed">
                    Horario de atencion:
                    <br />
                    Lun - Vie: 9:00 am - 7:00 pm
                    <br />
                    Sab: 9:00 am - 1:00 pm
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-[#2C1A0E] text-lg">Envia un mensaje</h3>
                <div>
                  <label className="text-xs text-[#7A6555] font-medium block mb-1">Nombre</label>
                  <input
                    name="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm text-[#2C1A0E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C2570F]/30 focus:border-[#C2570F] transition-all placeholder:text-[#7A6555] ${errors.nombre ? 'border-[#B91C1C]' : 'border-[#E8DDD0]'}`}
                  />
                  {errors.nombre && <p className="text-xs text-[#B91C1C] mt-1">{errors.nombre}</p>}
                </div>
                <div>
                  <label className="text-xs text-[#7A6555] font-medium block mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm text-[#2C1A0E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C2570F]/30 focus:border-[#C2570F] transition-all placeholder:text-[#7A6555] ${errors.email ? 'border-[#B91C1C]' : 'border-[#E8DDD0]'}`}
                  />
                  {errors.email && <p className="text-xs text-[#B91C1C] mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-xs text-[#7A6555] font-medium block mb-1">Mensaje</label>
                  <textarea
                    name="mensaje"
                    rows="3"
                    placeholder="Escribe tu mensaje..."
                    value={form.mensaje}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm text-[#2C1A0E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C2570F]/30 focus:border-[#C2570F] transition-all placeholder:text-[#7A6555] resize-none ${errors.mensaje ? 'border-[#B91C1C]' : 'border-[#E8DDD0]'}`}
                  />
                  {errors.mensaje && <p className="text-xs text-[#B91C1C] mt-1">{errors.mensaje}</p>}
                </div>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="bg-[#C2570F] text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-[#A8480C] transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? 'Enviando...' : status === 'success' ? 'Enviado!' : 'Enviar mensaje'}
                </button>
                {status === 'success' && (
                  <p className="text-xs text-[#4A7C59] text-center bg-[#4A7C59]/5 py-2 px-3 rounded-lg">Mensaje enviado correctamente</p>
                )}
                {status === 'error' && (
                  <p className="text-xs text-[#B91C1C] text-center bg-[#B91C1C]/5 py-2 px-3 rounded-lg">Error al enviar. Intenta de nuevo.</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
