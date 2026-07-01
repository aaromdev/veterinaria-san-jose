import { useMemo } from 'react'

const REQUISITOS = [
  { label: 'Al menos 6 caracteres', test: (pw) => pw.length >= 6 },
  { label: 'Una letra minúscula (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Una letra mayúscula (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Un dígito (0-9)', test: (pw) => /\d/.test(pw) },
  { label: 'Un carácter especial', test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"|<>?,.\/`~]/.test(pw) },
]

export function PasswordStrengthIndicator({ password = '' }) {
  const checks = useMemo(
    () => REQUISITOS.map((r) => ({ ...r, cumplido: r.test(password) })),
    [password],
  )

  if (!password) return null

  const cumplidos = checks.filter((c) => c.cumplido).length
  const pct = Math.round((cumplidos / checks.length) * 100)

  return (
    <div className="mt-3 space-y-2">
      <div className="h-1 w-full rounded-full bg-[#E8DDD0] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            pct === 100 ? 'bg-[#4A7C59]' : pct >= 60 ? 'bg-[#C2570F]' : 'bg-[#B91C1C]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="space-y-1">
        {checks.map((req) => (
          <div key={req.label} className="flex items-center gap-2 text-xs">
            {req.cumplido ? (
              <svg className="w-3.5 h-3.5 text-[#4A7C59] shrink-0" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4.5 7L6.5 9L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 5L9 9M9 5L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            <span className={req.cumplido ? 'text-[#2C1A0E]' : 'text-[#7A6555]'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
