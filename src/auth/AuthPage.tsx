import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { AlertCircle, ArrowRight, Eye, EyeOff, Info } from '../components/Icons'
import { FridgeCrisperBottom, FridgeDoor, FridgeTopShelf } from './FridgeParts'
import './auth.css'

type ScreenState = 'welcome' | 'opening' | 'authentication' | 'closing'
type AuthMode = 'signin' | 'signup'
type FieldKey = 'name' | 'email' | 'password'

interface FieldErrors {
  name?: string
  email?: string
  password?: string
}

const OPEN_DURATION_MS = 760
const CLOSE_DURATION_MS = 680

const STATE_LABEL: Record<ScreenState, string> = {
  welcome: 'Kulkas tertutup',
  opening: 'Pintu membuka',
  authentication: 'Kulkas terbuka',
  closing: 'Menutup kulkas',
}

const MODE_PATH: Record<AuthMode, string> = {
  signin: '/login',
  signup: '/register',
}

function deriveInitialAuthMode(): AuthMode {
  return /\/register\/?$/.test(window.location.pathname) ? 'signup' : 'signin'
}

function validateAuthForm(state: {
  authMode: AuthMode
  name: string
  email: string
  password: string
}): { isValid: boolean; errors: FieldErrors } {
  const errors: FieldErrors = {}

  if (state.authMode === 'signup') {
    const trimmedName = state.name.trim()
    if (!trimmedName) {
      errors.name = 'Nama wajib diisi untuk membuat akun.'
    } else if (trimmedName.length < 2) {
      errors.name = 'Masukkan minimal 2 karakter untuk nama.'
    }
  }

  const trimmedEmail = state.email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!trimmedEmail) {
    errors.email = 'Alamat email wajib diisi.'
  } else if (!emailRegex.test(trimmedEmail)) {
    errors.email = 'Format email belum valid (contoh: nama@email.com).'
  }

  if (!state.password) {
    errors.password = 'Password wajib diisi.'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

export default function AuthPage() {
  const [screenState, setScreenState] = useState<ScreenState>('welcome')
  const [authMode, setAuthMode] = useState<AuthMode>(deriveInitialAuthMode)
  const [lastTrigger, setLastTrigger] = useState<AuthMode>(deriveInitialAuthMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [showPrototypeNotice, setShowPrototypeNotice] = useState(false)

  const screenStateRef = useRef<ScreenState>('welcome')
  const timerRef = useRef<number | null>(null)
  const reducedMotionRef = useRef(false)
  const returnFocusRef = useRef(false)

  const signInButtonRef = useRef<HTMLButtonElement | null>(null)
  const signUpButtonRef = useRef<HTMLButtonElement | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const emailInputRef = useRef<HTMLInputElement | null>(null)
  const passwordInputRef = useRef<HTMLInputElement | null>(null)

  const clearAnimationTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const commitScreenState = useCallback((nextState: ScreenState) => {
    screenStateRef.current = nextState
    setScreenState(nextState)
  }, [])

  const syncModePath = useCallback((mode: AuthMode) => {
    const normalized = window.location.pathname.replace(/\/+$/, '')
    if (normalized !== MODE_PATH[mode]) {
      window.history.replaceState(null, '', MODE_PATH[mode])
    }
  }, [])

  const completeOpening = useCallback(() => {
    clearAnimationTimer()
    commitScreenState('authentication')
  }, [clearAnimationTimer, commitScreenState])

  const completeClosing = useCallback(() => {
    clearAnimationTimer()
    commitScreenState('welcome')
  }, [clearAnimationTimer, commitScreenState])

  const openFridge = useCallback(
    (mode: AuthMode) => {
      if (screenStateRef.current !== 'welcome') return

      setAuthMode(mode)
      setLastTrigger(mode)
      syncModePath(mode)
      setPassword('')
      setShowPassword(false)
      setErrors({})
      setShowPrototypeNotice(false)

      if (reducedMotionRef.current) {
        commitScreenState('authentication')
        return
      }

      commitScreenState('opening')
      clearAnimationTimer()
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        commitScreenState('authentication')
      }, OPEN_DURATION_MS)
    },
    [clearAnimationTimer, commitScreenState, syncModePath],
  )

  const closeFridge = useCallback(() => {
    if (screenStateRef.current !== 'authentication') return

    setPassword('')
    setShowPassword(false)
    setErrors({})
    setShowPrototypeNotice(false)
    returnFocusRef.current = true

    if (reducedMotionRef.current) {
      commitScreenState('welcome')
      return
    }

    commitScreenState('closing')
    clearAnimationTimer()
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      commitScreenState('welcome')
    }, CLOSE_DURATION_MS)
  }, [clearAnimationTimer, commitScreenState])

  const switchAuthMode = useCallback(
    (nextMode: AuthMode) => {
      if (screenStateRef.current !== 'authentication' || nextMode === authMode) return

      setAuthMode(nextMode)
      syncModePath(nextMode)
      setPassword('')
      setShowPassword(false)
      setErrors({})
      setShowPrototypeNotice(false)
    },
    [authMode, syncModePath],
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = media.matches

    const onChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches
      if (!event.matches) return

      if (screenStateRef.current === 'opening') completeOpening()
      if (screenStateRef.current === 'closing') completeClosing()
    }

    media.addEventListener('change', onChange)

    return () => {
      media.removeEventListener('change', onChange)
      clearAnimationTimer()
    }
  }, [clearAnimationTimer, completeClosing, completeOpening])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || screenStateRef.current !== 'authentication') return
      event.preventDefault()
      closeFridge()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeFridge])

  useEffect(() => {
    if (screenState !== 'authentication') return

    const frame = window.requestAnimationFrame(() => {
      const target = authMode === 'signup' ? nameInputRef.current : emailInputRef.current
      target?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [authMode, screenState])

  useEffect(() => {
    if (screenState !== 'welcome' || !returnFocusRef.current) return

    returnFocusRef.current = false
    const frame = window.requestAnimationFrame(() => {
      const target = lastTrigger === 'signin' ? signInButtonRef.current : signUpButtonRef.current
      target?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [lastTrigger, screenState])

  const clearFieldError = (field: FieldKey) => {
    setErrors((current) => {
      if (!current[field]) return current
      return { ...current, [field]: undefined }
    })
  }

  const handleNameChange = (value: string) => {
    setName(value)
    clearFieldError('name')
    setShowPrototypeNotice(false)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    clearFieldError('email')
    setShowPrototypeNotice(false)
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    clearFieldError('password')
    setShowPrototypeNotice(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = validateAuthForm({ authMode, name, email, password })
    setErrors(result.errors)

    if (!result.isValid) {
      setShowPrototypeNotice(false)

      const order: FieldKey[] =
        authMode === 'signup' ? ['name', 'email', 'password'] : ['email', 'password']
      const firstInvalid = order.find((field) => result.errors[field])
      const refs = {
        name: nameInputRef,
        email: emailInputRef,
        password: passwordInputRef,
      }

      if (firstInvalid) {
        window.requestAnimationFrame(() => refs[firstInvalid].current?.focus())
      }
      return
    }

    setShowPrototypeNotice(true)
  }

  const togglePasswordVisibility = () => {
    setShowPassword((current) => !current)
  }

  const isAuthentication = screenState === 'authentication'
  const isSignup = authMode === 'signup'

  return (
    <div
      className="auth-page"
      data-screen-state={screenState}
      data-auth-mode={authMode}
    >
      <a href="#auth-main" className="auth-skip-link">
        Lewati ke konten utama
      </a>

      <header className="auth-header">
        <a href="/" className="auth-wordmark" aria-label="Lethimcook — beranda">
          <span aria-hidden="true">lethimcook</span>
          <span className="auth-wordmark-dot" aria-hidden="true">
            .
          </span>
        </a>

        <p className="auth-header-note">
          <span className="auth-header-dot" aria-hidden="true" />
          Cinematic fridge · masuk &amp; daftar
        </p>

        <a href="/" className="auth-home-link">
          <span aria-hidden="true">←</span> Beranda
        </a>
      </header>

      <main className="auth-main" id="auth-main">
        <div className="auth-stage-meta" aria-hidden="true">
          <span className="auth-stage-status">
            <span className={`auth-stage-dot auth-stage-dot--${screenState}`} />
            {STATE_LABEL[screenState]}
          </span>
          <span>Warm modern kitchen</span>
        </div>

        <div className="fridge-scene-stage">
          <div className="auth-stage-glow" aria-hidden="true" />
          <div className="fridge-floor-shadow" aria-hidden="true" />
          <div className="fridge-floor-line" aria-hidden="true" />

          <div className="auth-stage-annotations" aria-hidden="true">
            <span className="auth-annotation auth-annotation--left">Warm kitchen — 01</span>
            <span className="auth-annotation auth-annotation--right">
              French door · authentication
            </span>
          </div>

          <div className="fridge-appliance-cabinet">
            <div className="fridge-interior-cavity">
              <div className="fridge-cavity-backwall" aria-hidden="true" />
              <div className="fridge-ceiling-light" aria-hidden="true" />
              <span className="fridge-led-strip fridge-led-strip--left" aria-hidden="true" />
              <span className="fridge-led-strip fridge-led-strip--right" aria-hidden="true" />

              <FridgeTopShelf />

              <div className="fridge-cavity-middle">
                <div
                  className="fridge-auth-panel-wrapper"
                  inert={!isAuthentication}
                >
                  <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                    aria-labelledby="auth-mode-heading"
                  >
                    <div className="auth-panel-top">
                      <button
                        type="button"
                        className="auth-back-button"
                        onClick={closeFridge}
                        aria-label="Back to welcome screen"
                      >
                        <span className="auth-back-arrow" aria-hidden="true">
                          ←
                        </span>
                        <span>Tutup kulkas</span>
                      </button>

                      <span className="auth-mode-chip">
                        <span className="auth-mode-chip-dot" aria-hidden="true" />
                        {isSignup ? 'Daftar' : 'Masuk'}
                      </span>
                    </div>

                    <div key={authMode} className="auth-copy-swap auth-mode-copy">
                      <h1 id="auth-mode-heading" className="auth-heading">
                        {isSignup ? (
                          <>
                            Mulai dari{' '}
                            <span className="accent-serif">dapurmu</span>
                            <span className="auth-heading-dot">.</span>
                          </>
                        ) : (
                          <>
                            Senang melihatmu{' '}
                            <span className="accent-serif">lagi</span>
                            <span className="auth-heading-dot">.</span>
                          </>
                        )}
                      </h1>
                      <p className="auth-subtext">
                        {isSignup
                          ? 'Buat akun dan temukan lebih banyak kemungkinan dari isi kulkasmu.'
                          : 'Lanjutkan menemukan inspirasi masakan dari bahan yang kamu punya.'}
                      </p>
                    </div>

                    <div className="auth-fields">
                      <div
                        className="signup-name-field-collapse"
                        aria-hidden={!isSignup}
                      >
                        <div className="field-inner">
                          <div className={`auth-field${errors.name ? ' is-invalid' : ''}`}>
                            <label className="auth-label" htmlFor="auth-name">
                              Nama
                            </label>
                            <div className="auth-input-shell">
                              <input
                                ref={nameInputRef}
                                id="auth-name"
                                name="name"
                                type="text"
                                className="auth-input"
                                placeholder="Nama lengkap atau panggilanmu"
                                autoComplete="name"
                                required={isSignup}
                                disabled={!isSignup}
                                value={name}
                                onChange={(event) => handleNameChange(event.target.value)}
                                aria-invalid={Boolean(errors.name)}
                                aria-describedby={errors.name ? 'auth-name-error' : undefined}
                              />
                            </div>
                            {errors.name && (
                              <p id="auth-name-error" className="auth-field-error">
                                <AlertCircle className="auth-error-icon" />
                                <span>{errors.name}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={`auth-field${errors.email ? ' is-invalid' : ''}`}>
                        <label className="auth-label" htmlFor="auth-email">
                          Email
                        </label>
                        <div className="auth-input-shell">
                          <input
                            ref={emailInputRef}
                            id="auth-email"
                            name="email"
                            type="email"
                            inputMode="email"
                            className="auth-input"
                            placeholder="nama@email.com"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) => handleEmailChange(event.target.value)}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'auth-email-error' : undefined}
                          />
                        </div>
                        {errors.email && (
                          <p id="auth-email-error" className="auth-field-error">
                            <AlertCircle className="auth-error-icon" />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>

                      <div className={`auth-field${errors.password ? ' is-invalid' : ''}`}>
                        <label className="auth-label" htmlFor="auth-password">
                          Password
                        </label>
                        <div className="auth-input-shell">
                          <input
                            ref={passwordInputRef}
                            id="auth-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            className="auth-input"
                            placeholder="Password kamu"
                            autoComplete={isSignup ? 'new-password' : 'current-password'}
                            required
                            value={password}
                            onChange={(event) => handlePasswordChange(event.target.value)}
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? 'auth-password-error' : undefined}
                          />
                          <button
                            type="button"
                            className="auth-eye-button"
                            onClick={togglePasswordVisibility}
                            aria-label={
                              showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                            }
                            aria-pressed={showPassword}
                          >
                            {showPassword ? (
                              <EyeOff className="auth-eye-icon" />
                            ) : (
                              <Eye className="auth-eye-icon" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p id="auth-password-error" className="auth-field-error">
                            <AlertCircle className="auth-error-icon" />
                            <span>{errors.password}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div key={`cta-${authMode}`} className="auth-copy-swap auth-submit-wrap">
                      <button type="submit" className="auth-submit">
                        <span>{isSignup ? 'Buat akun' : 'Masuk ke akun'}</span>
                        <ArrowRight className="auth-submit-icon" />
                      </button>
                    </div>

                    {showPrototypeNotice && (
                      <div className="auth-status-banner" role="status" aria-live="polite">
                        <Info className="auth-status-icon" />
                        <p>
                          Validasi form berhasil. Autentikasi backend belum dihubungkan pada
                          environment preview ini.
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      className="auth-switch-button"
                      onClick={() => switchAuthMode(isSignup ? 'signin' : 'signup')}
                    >
                      {isSignup ? (
                        <>
                          Sudah punya akun? <strong>Masuk</strong>
                        </>
                      ) : (
                        <>
                          Belum punya akun? <strong>Daftar</strong>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              <FridgeCrisperBottom />
            </div>

            <div className="fridge-doors-wrapper">
              <FridgeDoor side="left" />
              <FridgeDoor side="right" />
            </div>

            <div
              className="fridge-welcome-note"
              inert={screenState !== 'welcome'}
              aria-hidden={screenState !== 'welcome'}
            >
              <p className="welcome-note-eyebrow">
                <span className="welcome-note-dot" aria-hidden="true" />
                Isi kulkas, temukan ide
              </p>
              <h1 className="welcome-note-title" lang="en">
                Good food
                <br />
                starts <span className="accent-serif">at home</span>
                <span className="welcome-note-period">.</span>
              </h1>
              <p className="welcome-note-body">Buka kulkasmu. Temukan ide masakan baru.</p>

              <div className="welcome-note-actions">
                <button
                  ref={signInButtonRef}
                  type="button"
                  className="welcome-action welcome-action--primary"
                  onClick={() => openFridge('signin')}
                >
                  Masuk
                  <ArrowRight className="welcome-action-icon" />
                </button>
                <button
                  ref={signUpButtonRef}
                  type="button"
                  className="welcome-action welcome-action--secondary"
                  onClick={() => openFridge('signup')}
                >
                  Daftar
                </button>
              </div>

              <p className="welcome-note-micro" lang="en">
                Your next meal starts here.
              </p>
            </div>
          </div>
        </div>

        <p className="auth-sr-status sr-only" role="status" aria-live="polite">
          {isAuthentication ? 'Kulkas terbuka. Formulir autentikasi siap.' : ''}
        </p>
      </main>

      <footer className="auth-footer">
        <p>
          <span className="auth-footer-dot" aria-hidden="true" />
          Prototipe preview · Tidak ada data yang dikirim ke server.
        </p>
        <p className="auth-footer-brand">lethimcook.ai.id</p>
      </footer>
    </div>
  )
}
