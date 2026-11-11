import './Toast.scss'

interface ToastProps {
  toast: {
    id: number
    message: string
    variant: 'success' | 'info' | 'error'
    durationMs: number
    actionLabel?: string
    onAction?: () => void
  } | null
  onDismiss: () => void
}

function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) {
    return null
  }

  return (
    <div className={`toast toast--${toast.variant}`} role="status" aria-live="polite">
      <div className="toast__content">
        <span className="toast__message">{toast.message}</span>
        {toast.actionLabel && toast.onAction && (
          <button
            type="button"
            className="toast__action"
            onClick={toast.onAction}
          >
            {toast.actionLabel}
          </button>
        )}
      </div>
      <span
        key={toast.id}
        className="toast__progress"
        style={{ animationDuration: `${toast.durationMs}ms` }}
        aria-hidden="true"
      />
      <button type="button" className="toast__close" aria-label="Закрити повідомлення" onClick={onDismiss}>
        ×
      </button>
    </div>
  )
}

export default Toast
