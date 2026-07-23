import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { useAuthStore } from '../../store/authStore'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const user = useAuthStore((s) => s.user)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in — redirect to correct dashboard
  if (isAuthenticated && user) {
    const to =
      user.role === 'ADMIN'
        ? '/admin/dashboard'
        : user.role === 'LECTURER'
          ? '/lecturer/dashboard'
          : '/student/dashboard'
    return <Navigate to={to} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Please check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-gray-50 font-sans">
      
      {/* Left Panel: Institutional Branding (Visible on Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract geometric overlay for academic prestige */}
        <div className="absolute right-0 top-0 translate-x-24 -translate-y-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 -translate-x-24 translate-y-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Header */}
        <div className="flex items-center gap-3 text-white/90 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center border border-indigo-500/30">
            <span className="text-white text-sm font-extrabold tracking-wider">F</span>
          </div>
          <span className="font-semibold text-sm tracking-widest text-indigo-200">Fleet</span>
        </div>

        {/* Center Welcome Crest */}
        <div className="max-w-xl my-auto space-y-6 relative z-10 select-none">
          {/* Shield Seal SVG */}
          <svg className="w-20 h-20 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v7M9 10h6" />
            <circle cx="12" cy="17" r="0.75" fill="currentColor" />
          </svg>
          
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Fleet Portal
          </h2>
          <p className="text-indigo-200/80 text-base leading-relaxed">
            Welcome to the Fleet Portal. Connect with your digital campus to access your interactive courses, assignments, calendars, and integrated AI tutoring assistants.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-xs text-indigo-300/60 relative z-10">
          Fleet Portal · Secure Access.
        </div>
      </div>

      {/* Right Panel: Login Form (Centered Card) */}
      <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Small Branding Header for Mobile */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-2">
            <div className="lg:hidden w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-2 shadow-md">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Portal Sign In</h1>
            <p className="text-sm text-gray-500">Sign in with your credentials</p>
          </div>

          {/* Form */}
          <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl p-2">
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <Input
                label="Academic Email"
                type="email"
                placeholder="student@lms.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className="focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Input
                label="Security Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="focus:ring-indigo-500 focus:border-indigo-500"
              />

              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3.5 flex items-start gap-2.5 animate-fadeIn">
                  <svg className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs font-semibold text-rose-700 leading-tight">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 shadow-sm active:scale-95 transition-transform"
              >
                Sign In to Portal
              </Button>
            </form>
          </div>

          {/* IT Helpdesk Help Footnote */}
          <div className="text-center lg:text-left pt-6 border-t border-gray-100 space-y-1 text-xs text-gray-400 leading-relaxed">
            <p>For credentials recovery or technical support, contact the IT Helpdesk at <span className="text-indigo-600 hover:underline cursor-pointer">support@lms.dev</span>.</p>
            <p className="text-[10px] text-gray-300 font-medium tracking-wide">SECURE SSL ACCESS · JWT ENCRYPTED</p>
          </div>

        </div>
      </div>
      
    </div>
  )
}
