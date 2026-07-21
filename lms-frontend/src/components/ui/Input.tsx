import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = '', id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-slate-350">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          'block w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none border-gray-300 dark:border-slate-700',
          'focus:border-primary-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-indigo-500/20',
          'disabled:bg-gray-50 dark:disabled:bg-slate-900/50 disabled:text-gray-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed',
          'transition-all duration-150',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-550 dark:text-slate-500">{hint}</p>}
    </div>
  )
})
