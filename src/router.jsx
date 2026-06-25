import { lazy, Suspense } from 'react'
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom'

import { LayoutPublico } from './components/layout/LayoutPublico'
import { LayoutCliente } from './components/layout/LayoutCliente'
import { LayoutAdmin } from './components/layout/LayoutAdmin'
import { RutaCliente } from './components/layout/RutaCliente'
import { RutaAdmin } from './components/layout/RutaAdmin'
import { AdminProvider } from './context/AdminContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

const Landing = lazy(() => import('./pages/publico/Landing').then((m) => ({ default: m.Landing })))
const Login = lazy(() => import('./pages/publico/Login').then((m) => ({ default: m.Login })))
const Registro = lazy(() => import('./pages/publico/Registro').then((m) => ({ default: m.Registro })))

const EditarPerfil = lazy(() => import('./pages/cliente/EditarPerfil').then((m) => ({ default: m.EditarPerfil })))
const MisMascotas = lazy(() => import('./pages/cliente/MisMascotas').then((m) => ({ default: m.MisMascotas })))
const NuevaMascota = lazy(() => import('./pages/cliente/NuevaMascota').then((m) => ({ default: m.NuevaMascota })))
const EditarMascota = lazy(() => import('./pages/cliente/EditarMascota').then((m) => ({ default: m.EditarMascota })))
const MisCitas = lazy(() => import('./pages/cliente/MisCitas').then((m) => ({ default: m.MisCitas })))
const NuevaCita = lazy(() => import('./pages/cliente/NuevaCita').then((m) => ({ default: m.NuevaCita })))
const DetalleCitaCliente = lazy(() => import('./pages/cliente/DetalleCitaCliente').then((m) => ({ default: m.DetalleCitaCliente })))

const AdminLogin = lazy(() => import('./pages/admin/Login'))
const Agenda = lazy(() => import('./pages/admin/Agenda').then((m) => ({ default: m.Agenda })))
const Clientes = lazy(() => import('./pages/admin/Clientes').then((m) => ({ default: m.Clientes })))
const DetalleCliente = lazy(() => import('./pages/admin/DetalleCliente').then((m) => ({ default: m.DetalleCliente })))
const DetalleCita = lazy(() => import('./pages/admin/DetalleCita').then((m) => ({ default: m.DetalleCita })))
const HistoriaClinica = lazy(() => import('./pages/admin/HistoriaClinica').then((m) => ({ default: m.HistoriaClinica })))
const Servicios = lazy(() => import('./pages/admin/catalogos/Servicios').then((m) => ({ default: m.Servicios })))
const Salas = lazy(() => import('./pages/admin/catalogos/Salas').then((m) => ({ default: m.Salas })))
const Plantillas = lazy(() => import('./pages/admin/catalogos/Plantillas').then((m) => ({ default: m.Plantillas })))
const Especies = lazy(() => import('./pages/admin/catalogos/Especies').then((m) => ({ default: m.Especies })))
const Medicamentos = lazy(() => import('./pages/admin/catalogos/Medicamentos').then((m) => ({ default: m.Medicamentos })))
const Usuarios = lazy(() => import('./pages/admin/Usuarios').then((m) => ({ default: m.Usuarios })))

const loadingFallback = (
  <div className="min-h-screen flex items-center justify-center text-sm text-[#7A6555]">
    Cargando...
  </div>
)

const withSuspense = (element) => (
  <ErrorBoundary>
    <Suspense fallback={loadingFallback}>
      {element}
    </Suspense>
  </ErrorBoundary>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPublico />,
    children: [
      { index: true, element: withSuspense(<Landing />) },
      { path: 'login', element: withSuspense(<Login />) },
      { path: 'registro', element: withSuspense(<Registro />) },
    ],
  },
  {
    path: '/cliente',
    element: <RutaCliente />,
    children: [
      {
        element: <LayoutCliente />,
          children: [
            { path: 'mascotas', element: withSuspense(<MisMascotas />) },
            { path: 'mascotas/nueva', element: withSuspense(<NuevaMascota />) },
            { path: 'mascotas/:id/editar', element: withSuspense(<EditarMascota />) },
            { path: 'citas', element: withSuspense(<MisCitas />) },
            { path: 'citas/nueva', element: withSuspense(<NuevaCita />) },
            { path: 'citas/:id', element: withSuspense(<DetalleCitaCliente />) },
            { path: 'perfil', element: withSuspense(<EditarPerfil />) },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminProvider><Outlet /></AdminProvider>,
    children: [
      { path: 'login', element: withSuspense(<AdminLogin />) },
      {
        element: <RutaAdmin />,
        children: [
          {
            element: <LayoutAdmin />,
            children: [
              { index: true, element: <Navigate to="agenda" replace /> },
              { path: 'agenda', element: withSuspense(<Agenda />) },
              { path: 'clientes', element: withSuspense(<Clientes />) },
              { path: 'clientes/:id', element: withSuspense(<DetalleCliente />) },
              { path: 'citas/:id', element: withSuspense(<DetalleCita />) },
              { path: 'historia/:idMascota', element: withSuspense(<HistoriaClinica />) },
              { path: 'usuarios', element: withSuspense(<Usuarios />) },
              { path: 'catalogos/servicios', element: withSuspense(<Servicios />) },
              { path: 'catalogos/salas', element: withSuspense(<Salas />) },
              { path: 'catalogos/plantillas', element: withSuspense(<Plantillas />) },
              { path: 'catalogos/especies', element: withSuspense(<Especies />) },
              { path: 'catalogos/medicamentos', element: withSuspense(<Medicamentos />) },
            ],
          },
        ],
      },
    ],
  },
])
