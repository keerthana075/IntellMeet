import { useState } from 'react'
import type { FormEvent } from 'react'
import { Sparkles } from 'lucide-react'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import './auth.css'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'register') await register(name, email, password)
      else await login(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span><Sparkles size={20}/></span><b>intellmeet</b></div>
        <p className="auth-eyebrow">AI-POWERED MEETING WORKSPACE</p>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your workspace account'}</h1>
        <p className="auth-copy">Secure access to meetings, collaboration, transcripts and action items.</p>

        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button>
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <label>Full name<input required minLength={2} maxLength={80} value={name} onChange={e => setName(e.target.value)} autoComplete="name"/></label>
          )}
          <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/></label>
          <label>Password<input required type="password" minLength={mode === 'register' ? 10 : 1} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'}/></label>
          {mode === 'register' && <small>Password needs 10+ characters, uppercase, lowercase and a number.</small>}
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button className="auth-submit" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
      </section>
    </main>
  )
}
