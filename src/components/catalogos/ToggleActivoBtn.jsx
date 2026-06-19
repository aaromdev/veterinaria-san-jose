import { useState } from 'react'
import { ConfirmModal } from '../ui/ConfirmModal'

export function ToggleActivoBtn({ activo, onToggle, loading, nombre = 'registro' }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    setToggling(true)
    setError(null)
    try {
      await onToggle()
      setShowConfirm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setToggling(false)
    }
  }

  const handleClose = () => {
    setShowConfirm(false)
    setError(null)
  }

  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-label={activo ? `Desactivar ${nombre}` : `Activar ${nombre}`}
        data-active={activo}
        className="toggle-switch"
        onClick={() => setShowConfirm(true)}
        disabled={loading || toggling}
      >
        <span className="toggle-switch-thumb" />
      </button>
      <ConfirmModal
        open={showConfirm}
        onClose={handleClose}
        onConfirm={handleConfirm}
        titulo={activo ? 'Desactivar' : 'Activar'}
        mensaje={activo ? `¿Desactivar ${nombre}?` : `¿Activar ${nombre}?`}
        confirmarTexto={activo ? 'Desactivar' : 'Activar'}
        variant={activo ? 'destructive' : 'primary'}
        loading={toggling}
        error={error}
      />
    </>
  )
}
