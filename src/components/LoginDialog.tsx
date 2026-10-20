import { useEffect, useId, useRef } from 'react'
import { AlertCircle, Close, Lock } from './Icons'

export interface LoginDialogProps {
  open: boolean
  onClose: () => void
}

export function LoginDialog({ open, onClose }: LoginDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      document.documentElement.style.overflow = 'hidden'
    } else if (!open && dialog.open) {
      dialog.close()
    }

    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
      className="m-auto w-full max-w-[26rem] px-4"
    >
      <div
        className="relative overflow-hidden rounded-[1.5rem] border border-hairline bg-surface p-5 shadow-elevated sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog login"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-cream-deep hover:text-ink"
        >
          <Close className="h-4 w-4" />
        </button>

        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-ink ring-1 ring-hairline">
          <Lock className="h-5 w-5" />
        </span>

        <h2 id={titleId} className="mt-4 pr-10 text-[1.125rem] font-bold tracking-[-0.02em] text-ink">
          Login belum tersedia
        </h2>
        <p id={descId} className="mt-2 text-[0.8125rem] leading-[1.65] text-muted">
          Halaman ini adalah preview landing page. Autentikasi tidak diaktifkan pada prototipe ini,
          jadi tidak ada akun yang bisa dibuat atau dimasukkan.
        </p>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-hairline bg-cream px-3 py-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
          <p className="text-[0.75rem] leading-relaxed text-muted">
            Kamu tetap bisa mencoba alur unggah foto dari tombol{' '}
            <span className="font-semibold text-ink">Coba dari foto</span>.
          </p>
        </div>

        <button type="button" onClick={onClose} className="btn btn-dark mt-5 w-full">
          Kembali ke halaman
        </button>
      </div>
    </dialog>
  )
}
