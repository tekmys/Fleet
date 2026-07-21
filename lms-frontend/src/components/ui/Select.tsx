import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface Option {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Option[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, className = '', id, ...props },
  ref,
) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700 dark:text-slate-350">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={[
          'block w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white',
          'outline-none border-gray-300 dark:border-slate-700',
          'focus:border-primary-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-indigo-500/20',
          'disabled:bg-gray-50 dark:disabled:bg-slate-900/50 disabled:text-gray-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed',
          'transition-all duration-150',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
})
