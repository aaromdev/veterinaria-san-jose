import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmModal({ open, onClose, onConfirm, titulo, mensaje, confirmarTexto = 'Confirmar', variant = 'primary', loading, error }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center">
        <h3 className="text-lg font-bold text-[#2C1A0E] mb-2">{titulo}</h3>
        <p className="text-sm text-[#7A6555] mb-6">{mensaje}</p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando...' : confirmarTexto}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
