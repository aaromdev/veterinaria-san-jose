import { useCallback, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAdmin } from '../../context/AdminContext'
import { usePermisos } from '../../hooks/usePermisos'
import logoSrc from '../../assets/logo.png'

function IconAgenda({ className, stroke }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.5">
      <rect x="2" y="2.5" width="12" height="11.5" rx="1.5" />
      <path d="M11 1V4M5 1V4M2 6.5H14" />
      <path d="M5.5 9.5L7 11L10.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClientes({ className, stroke }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.5">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1 14C1 11.2386 3.23858 9 6 9C8.76142 9 11 11.2386 11 14" strokeLinecap="round" />
      <circle cx="11" cy="5" r="1.8" />
      <path d="M11 9C12.6569 9 14 10.3431 14 12" strokeLinecap="round" />
    </svg>
  )
}

function IconServicios({ className, stroke }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.5">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5V11M5 8H11" strokeLinecap="round" />
    </svg>
  )
}

function IconSalas({ className, stroke }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.5">
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
      <path d="M5.5 6V10M8 6V10M10.5 6V10" strokeLinecap="round" />
    </svg>
  )
}

function IconPlantillas({ className, stroke }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.5">
      <path d="M4 2.5H12C12.8284 2.5 13.5 3.17157 13.5 4V12C13.5 12.8284 12.8284 13.5 12 13.5H4C3.17157 13.5 2.5 12.8284 2.5 12V4C2.5 3.17157 3.17157 2.5 4 2.5Z" />
      <path d="M5 5.5H11M5 8H9M5 10.5H7" strokeLinecap="round" />
    </svg>
  )
}

function IconUsuarios({ className, stroke }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.5">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1 14C1 11.2386 3.23858 9 6 9C8.76142 9 11 11.2386 11 14" strokeLinecap="round" />
      <circle cx="11.5" cy="4.5" r="1.8" />
      <path d="M11.5 9C13.1569 9 14.5 10.3431 14.5 12" strokeLinecap="round" />
      <path d="M11.5 4.5L11.5 2.5M10.5 3.5L12.5 3.5" strokeLinecap="round" />
    </svg>
  )
}

function IconEspecies({ className, stroke }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.5">
      <circle cx="8" cy="9" r="3" />
      <path d="M3.5 5.5C3.5 5.5 5 3 8 3C11 3 12.5 5.5 12.5 5.5" strokeLinecap="round" />
      <circle cx="5" cy="5" r="0.8" />
      <circle cx="11" cy="5" r="0.8" />
    </svg>
  )
}

function IconMedicamentos({ className, stroke }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="1.5">
      <rect x="3.5" y="1.5" width="4" height="7" rx="1" />
      <rect x="8.5" y="1.5" width="4" height="7" rx="1" />
      <path d="M5.5 8.5V14M10.5 8.5V14M4 14H7M9 14H12" strokeLinecap="round" />
    </svg>
  )
}

export function SidebarAdmin() {
  const location = useLocation()
  const navigate = useNavigate()
  const { personal, clearPersonal } = useAdmin()
  const { can } = usePermisos()
  const navItems = useMemo(() => {
    const items = [
      {
        label: 'Agenda',
        path: '/admin/agenda',
        icon: (active) => <IconAgenda className="w-4 h-4" stroke={active ? '#fff' : '#E8DDD0'} />,
      },
      {
        label: 'Clientes',
        path: '/admin/clientes',
        icon: (active) => <IconClientes className="w-4 h-4" stroke={active ? '#fff' : '#E8DDD0'} />,
      },
    ]

    if (can('catalogos')) {
      items.push({
        label: 'Catálogos',
        children: [
          ...(can('personal.gestionar')
            ? [{
                label: 'Usuarios',
                path: '/admin/usuarios',
                icon: (active) => <IconUsuarios className="w-4 h-4" stroke={active ? '#fff' : '#E8DDD0'} />,
              }]
            : []),
          {
            label: 'Servicios',
            path: '/admin/catalogos/servicios',
            icon: (active) => <IconServicios className="w-4 h-4" stroke={active ? '#fff' : '#E8DDD0'} />,
          },
          {
            label: 'Salas',
            path: '/admin/catalogos/salas',
            icon: (active) => <IconSalas className="w-4 h-4" stroke={active ? '#fff' : '#E8DDD0'} />,
          },
          {
            label: 'Plantillas',
            path: '/admin/catalogos/plantillas',
            icon: (active) => <IconPlantillas className="w-4 h-4" stroke={active ? '#fff' : '#E8DDD0'} />,
          },
          {
            label: 'Especies',
            path: '/admin/catalogos/especies',
            icon: (active) => <IconEspecies className="w-4 h-4" stroke={active ? '#fff' : '#E8DDD0'} />,
          },
          {
            label: 'Medicamentos',
            path: '/admin/catalogos/medicamentos',
            icon: (active) => <IconMedicamentos className="w-4 h-4" stroke={active ? '#fff' : '#E8DDD0'} />,
          },
        ],
      })
    }

    return items
  }, [can])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    clearPersonal()
    navigate('/admin/login')
  }, [clearPersonal, navigate])

  return (
    <aside className="fixed top-0 left-0 w-60 h-screen bg-[#2C1A0E] flex flex-col z-40">
      <div className="px-5 py-5 border-b border-white/10">
        <Link to="/admin/agenda" className="flex items-center">
          <img src={logoSrc} alt="San Jose" className="h-12 w-auto brightness-0 invert" />
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <div>
                <span className="block px-3 py-2 text-[#7A6555] text-xs font-semibold uppercase tracking-wider">
                  {item.label}
                </span>
                <div className="ml-1 space-y-0.5">
                  {item.children.map((child) => {
                    const isChildActive = location.pathname === child.path
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isChildActive
                            ? 'bg-[#C2570F] text-white shadow-sm shadow-[#C2570F]/20'
                            : 'text-[#E8DDD0] hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {child.icon(isChildActive)}
                        <span>{child.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-[#C2570F] text-white shadow-sm shadow-[#C2570F]/20'
                    : 'text-[#E8DDD0] hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon(location.pathname === item.path)}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-white/10 space-y-3">
        {personal && (
          <div className="px-2">
            <p className="text-white text-sm font-medium">{personal.nombre}</p>
            <p className="text-[#7A6555] text-xs capitalize">{personal.rol.toLowerCase()}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full text-left text-sm text-[#7A6555] hover:text-[#E8DDD0] transition-colors px-2 py-1.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 14H3.5C2.67157 14 2 13.3284 2 12.5V3.5C2 2.67157 2.67157 2 3.5 2H6" />
            <path d="M11 11.5L14 8L11 4.5" />
            <path d="M14 8H6" />
          </svg>
          Cerrar sesion
        </button>
      </div>
    </aside>
  )
}
