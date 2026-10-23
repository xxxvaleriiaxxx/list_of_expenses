interface Props {
  message: string
  actionLabel: string
  onAction: () => void
  onClose: () => void
}

export function Toast({ message, actionLabel, onAction, onClose }: Props) {
  return (
    <div className="toast" role="status">
      <span className="toast-message">{message}</span>
      <button className="toast-action" onClick={onAction}>
        {actionLabel}
      </button>
      <button className="toast-close" onClick={onClose} aria-label="Закрыть уведомление">
        ×
      </button>
    </div>
  )
}
