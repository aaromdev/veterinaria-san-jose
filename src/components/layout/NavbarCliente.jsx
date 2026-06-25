import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import logoSrc from '../../assets/logo.png'

const navItems = [
  { label: 'Mis mascotas', path: '/cliente/mascotas' },
  { label: 'Mis citas', path: '/cliente/citas' },
  { label: 'Mi perfil', path: '/cliente/perfil' },
]

export function NavbarCliente() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-[#E8DDD0] z-40">
      <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link to="/cliente/mascotas" className="flex items-center">
          <img src={logoSrc} alt="San Jose" className="h-14 w-auto" />
        </Link>
        <div className="flex items-center gap-1 text-sm">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#C2570F]/10 text-[#C2570F] font-medium'
                    : 'text-[#2C1A0E] hover:bg-[#FAF7F2]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <span className="text-[#7A6555] text-xs mx-2">|</span>
          <button
            onClick={handleLogout}
            className="text-sm text-[#7A6555] hover:text-[#C2570F] transition-colors px-3 py-2"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  )
}
