import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Close,
  FileImage,
  ImageIcon,
  Info,
  Lock,
  Upload,
} from './Icons'

const MAX_BYTES = 8 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const EXIT_MS = 200

type ModalState = 'closed' | 'opening' | 'open' | 'closing'

type Status =
  | { kind: 'idle' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; name: string; size: number }

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export interface UploadDialogProps {
  open: boolean
  onClose: () => void
}

export function UploadDialog({ open, onClose }: UploadDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const titleId = useId()
  const descId = useId()
  const statusId = useId()

  const [modalState, setModalState] = useState<ModalState>('closed')
  const modalStateRef = useRef<ModalState>('closed')

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [dragging, setDragging] = useState(false)

  const clearPreview = useCallback(() => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
  }, [])

  const commitModalState = useCallback((next: ModalState) => {
    modalStateRef.current = next
    setModalState(next)
  }, [])

  const resetState = useCallback(() => {
    clearPreview()
    setFileName('')
    setStatus({ kind: 'idle' })
    setDragging(false)
    if (inputRef.current) inputRef.current.value = ''
  }, [clearPreview])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    let rafIds: number[] = []
    let closeTimer: number | null = null
    const cancelPending = () => {
      rafIds.forEach((id) => window.cancelAnimationFrame(id))
      rafIds = []
      if (closeTimer !== null) {
        window.clearTimeout(closeTimer)
        closeTimer = null
      }
    }
    cancelPending()

    if (open) {
      document.documentElement.style.overflow = 'hidden'

      if (modalStateRef.current === 'closed') {
        dialog.showModal()
        commitModalState('opening')
      }

      rafIds.push(
        window.requestAnimationFrame(() => {
          rafIds.push(
            window.requestAnimationFrame(() => {
              commitModalState('open')
            }),
          )
        }),
      )
    } else if (modalStateRef.current !== 'closed') {
      document.documentElement.style.overflow = ''
      commitModalState('closing')
      closeTimer = window.setTimeout(() => {
        dialog.close()
        commitModalState('closed')
        resetState()
      }, EXIT_MS)
    }

    return cancelPending
  }, [open, commitModalState, resetState])

  useEffect(
    () => () => {
      document.documentElement.style.overflow = ''
    },
    [],
  )

  useEffect(() => () => clearPreview(), [clearPreview])

  const acceptFile = useCallback(
    (file: File | undefined) => {
      if (!file) return

      if (!ACCEPTED.includes(file.type)) {
        clearPreview()
        setFileName('')
        setStatus({
          kind: 'error',
          message: 'Format tidak didukung. Gunakan JPG, PNG, WEBP, AVIF, atau GIF.',
        })
        return
      }

      if (file.size > MAX_BYTES) {
        clearPreview()
        setFileName('')
        setStatus({
          kind: 'error',
          message: `Ukuran file ${formatSize(file.size)} melebihi batas 8 MB.`,
        })
        return
      }

      clearPreview()
      setPreviewUrl(URL.createObjectURL(file))
      setFileName(file.name)
      setStatus({ kind: 'ready', name: file.name, size: file.size })
    },
    [clearPreview],
  )

  const resetFile = () => {
    clearPreview()
    setFileName('')
    setStatus({ kind: 'idle' })
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.click()
    }
  }

  const removeFile = () => {
    clearPreview()
    setFileName('')
    setStatus({ kind: 'idle' })
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <dialog
      ref={dialogRef}
      className="upload-modal m-auto w-full max-w-[34rem] px-4"
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
    >
      <span
        aria-hidden="true"
        className="upload-overlay"
        data-modal-state={modalState}
        onClick={onClose}
      />
      <div
        className="upload-panel relative overflow-hidden rounded-[1.5rem] border border-hairline bg-surface shadow-elevated"
        data-modal-state={modalState}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
              Coba dari foto
            </h2>
            <p id={descId} className="mt-1 text-[0.75rem] leading-relaxed text-muted">
              Unggah satu foto bahan makanan. Maksimal 8 MB.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog unggah foto"
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-cream-deep hover:text-ink"
          >
            <Close className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <input
            ref={inputRef}
            id="upload-input"
            type="file"
            accept={ACCEPTED.join(',')}
            className="sr-only"
            onChange={(event) => acceptFile(event.target.files?.[0])}
          />

          {!previewUrl ? (
            <label
              htmlFor="upload-input"
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                acceptFile(event.dataTransfer.files?.[0])
              }}
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-colors ${
                dragging
                  ? 'border-tomato bg-butter-soft'
                  : 'border-strong/60 bg-cream hover:border-ink/30 hover:bg-cream-deep/70'
              }`}
            >
              <span aria-hidden="true" className="vf-corner vf-corner--tl" />
              <span aria-hidden="true" className="vf-corner vf-corner--tr" />
              <span aria-hidden="true" className="vf-corner vf-corner--bl" />
              <span aria-hidden="true" className="vf-corner vf-corner--br" />

              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink shadow-soft ring-1 ring-hairline">
                <Upload className="h-5 w-5" />
              </span>
              <span className="mt-4 text-[0.9375rem] font-semibold text-ink">
                Tarik foto ke sini, atau pilih file
              </span>
              <span className="mt-1.5 text-[0.75rem] text-muted">
                JPG, PNG, WEBP, AVIF, atau GIF · maks 8 MB
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-[0.6875rem] font-semibold text-muted">
                <FileImage className="h-3.5 w-3.5" />
                Pilih dari perangkat
              </span>
            </label>
          ) : (
            <div className="preview-reveal" key={fileName}>
              <div className="relative overflow-hidden rounded-2xl border border-hairline bg-cream">
                <img
                  src={previewUrl}
                  alt={`Pratinjau foto yang diunggah: ${fileName}`}
                  className="mx-auto block max-h-[18rem] w-auto max-w-full object-contain"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-[0.625rem] font-semibold text-cream">
                  <ImageIcon className="h-3 w-3" />
                  Pratinjau
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-hairline bg-cream px-3 py-2">
                <span className="min-w-0 truncate text-[0.75rem] font-medium text-ink">
                  {fileName}
                </span>
                <span className="shrink-0 text-[0.6875rem] text-subtle">
                  {status.kind === 'ready' ? formatSize(status.size) : ''}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={resetFile} className="btn btn-secondary btn-sm flex-1">
                  Ganti foto
                </button>
                <button
                  type="button"
                  onClick={removeFile}
                  className="btn btn-sm flex-1 border border-hairline bg-surface text-muted hover:border-strong hover:text-ink"
                >
                  Batalkan foto
                </button>
              </div>
            </div>
          )}

          {status.kind === 'error' && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-tomato/35 bg-tomato/10 px-3 py-2.5"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-tomato-hover" />
              <p className="text-[0.75rem] leading-relaxed text-ink">{status.message}</p>
            </div>
          )}

          {status.kind === 'ready' && (
            <div
              role="status"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-sage/50 bg-sage-soft px-3 py-2.5"
            >
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink/70" />
              <div>
                <p className="text-[0.75rem] font-semibold leading-relaxed text-ink">
                  Upload berhasil. Analisis AI belum tersedia di preview ini.
                </p>
                <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink/65">
                  Foto hanya disimpan di memori browser dan tidak dikirim ke server.
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-cream px-3 py-2.5">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-subtle" />
            <p className="text-[0.6875rem] leading-relaxed text-subtle">
              Ini prototipe antarmuka. Tidak ada foto yang diunggah, dianalisis, atau disimpan.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-hairline bg-cream/60 px-5 py-3.5 sm:px-6">
          <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium text-subtle">
            <Lock className="h-3.5 w-3.5" />
            Lokal di browser
          </span>
          <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
            Mengerti
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <span id={statusId} className="sr-only" aria-live="polite">
          {status.kind === 'ready' ? 'Foto siap dipratinjau' : ''}
        </span>
      </div>
    </dialog>
  )
}
