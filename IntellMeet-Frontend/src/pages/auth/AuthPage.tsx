// import { useState } from 'react'
// import type { FormEvent } from 'react'
// import { Sparkles } from 'lucide-react'
// import { ApiError } from '../../api/client'
// import { useAuth } from '../../auth/AuthContext'
// import './auth.css'

// export default function AuthPage() {
//   const { login, register } = useAuth()
//   const [mode, setMode] = useState<'login' | 'register'>('login')
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const [submitting, setSubmitting] = useState(false)

//   async function submit(event: FormEvent) {
//     event.preventDefault()
//     setError('')
//     setSubmitting(true)
//     try {
//       if (mode === 'register') await register(name, email, password)
//       else await login(email, password)
//     } catch (err) {
//       setError(err instanceof ApiError ? err.message : 'Authentication failed')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <main className="auth-page">
//       <section className="auth-card">
//         <div className="auth-brand"><span><Sparkles size={20}/></span><b>intellmeet</b></div>
//         <p className="auth-eyebrow">AI-POWERED MEETING WORKSPACE</p>
//         <h1>{mode === 'login' ? 'Welcome back' : 'Create your workspace account'}</h1>
//         <p className="auth-copy">Secure access to meetings, collaboration, transcripts and action items.</p>

//         <div className="auth-tabs">
//           <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button>
//           <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button>
//         </div>

//         <form onSubmit={submit}>
//           {mode === 'register' && (
//             <label>Full name<input required minLength={2} maxLength={80} value={name} onChange={e => setName(e.target.value)} autoComplete="name"/></label>
//           )}
//           <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/></label>
//           <label>Password<input required type="password" minLength={mode === 'register' ? 10 : 1} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'}/></label>
//           {mode === 'register' && <small>Password needs 10+ characters, uppercase, lowercase and a number.</small>}
//           {error && <div className="auth-error" role="alert">{error}</div>}
//           <button className="auth-submit" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
//         </form>
//       </section>
//     </main>
//   )
// }



















import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import './auth.css'

type AccountRole = 'MEMBER' | 'ADMIN'

export default function AuthPage() {
  const { login, register } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<AccountRole>('MEMBER')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (mode === 'register') {
        if (role === 'ADMIN') {
          setError(
            'Admin registration requires authorization. Please contact your workspace administrator.',
          )
          return
        }

        await register(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Authentication failed. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  function changeMode(nextMode: 'login' | 'register') {
    setMode(nextMode)
    setError('')
    setName('')
    setPassword('')
    setRole('MEMBER')
    setShowPassword(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span>
            <Sparkles size={20} />
          </span>
          <b>intellmeet</b>
        </div>

        <p className="auth-eyebrow">AI-POWERED MEETING WORKSPACE</p>

        <h1>
          {mode === 'login'
            ? 'Welcome back'
            : 'Create your workspace account'}
        </h1>

        <p className="auth-copy">
          Secure access to meetings, collaboration, transcripts and action items.
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => changeMode('login')}
            aria-pressed={mode === 'login'}
          >
            Sign in
          </button>

          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => changeMode('register')}
            aria-pressed={mode === 'register'}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label>
                Full name
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  placeholder="Enter your full name"
                />
              </label>

              <label className="auth-role-label">
                Account role

                <div className="auth-role-select-wrap">
                  <span className="auth-role-icon">
                    {role === 'ADMIN' ? (
                      <ShieldCheck size={18} />
                    ) : (
                      <Users size={18} />
                    )}
                  </span>

                  <select
                    className="auth-role-select"
                    value={role}
                    onChange={(event) => {
                      setRole(event.target.value as AccountRole)
                      setError('')
                    }}
                    aria-label="Select account role"
                  >
                    <option value="MEMBER">
                      Member — Join and collaborate
                    </option>
                    <option value="ADMIN">
                      Admin — Manage workspace
                    </option>
                  </select>

                  <ChevronDown
                    className="auth-role-chevron"
                    size={18}
                    aria-hidden="true"
                  />
                </div>

                <small className="auth-role-help">
                  {role === 'ADMIN'
                    ? 'Admin accounts require authorization from your organization.'
                    : 'Member accounts can join meetings and collaborate with teammates.'}
                </small>
              </label>
            </>
          )}

          <label>
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="Enter your email address"
            />
          </label>

          <label>
            Password
            <div className="auth-password-wrap">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                minLength={mode === 'register' ? 10 : 1}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  mode === 'register' ? 'new-password' : 'current-password'
                }
                placeholder={
                  mode === 'register'
                    ? 'Create a strong password'
                    : 'Enter your password'
                }
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </label>

          {mode === 'register' && (
            <small className="auth-password-hint">
              Password needs 10+ characters, uppercase, lowercase and a number.
            </small>
          )}

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? 'Please wait…'
              : mode === 'login'
                ? 'Sign in'
                : role === 'ADMIN'
                  ? 'Request Admin Access'
                  : 'Create Member Account'}
          </button>
        </form>

        <p className="auth-switch-hint">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => changeMode('register')}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => changeMode('login')}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </section>
    </main>
  )
}
