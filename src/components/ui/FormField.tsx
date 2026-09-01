import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, icon, suffix, hint, id, className = '', ...props },
  ref
) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label htmlFor={fieldId} className="block text-left">
      <span className="mb-1.5 block text-[13px] font-semibold text-brand-navy-900">{label}</span>
      <span className="relative flex items-center">
        {icon && <span className="pointer-events-none absolute left-4 text-brand-slate">{icon}</span>}
        <input
          ref={ref}
          id={fieldId}
          className={`h-14 w-full rounded-2xl border border-black/8 bg-white text-[16px] font-medium text-brand-ink shadow-sm outline-none transition placeholder:text-brand-slate/60 focus:border-brand-teal-500 focus:ring-4 focus:ring-brand-teal-500/15 ${
            icon ? 'pl-11' : 'pl-4'
          } ${suffix ? 'pr-14' : 'pr-4'} ${className}`}
          {...props}
        />
        {suffix && <span className="absolute right-4 text-[13px] font-semibold text-brand-slate">{suffix}</span>}
      </span>
      {hint && <span className="mt-1.5 block text-[12px] leading-snug text-brand-slate">{hint}</span>}
    </label>
  );
});

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: ReactNode;
}

export function SelectField({ label, value, onChange, options, placeholder, icon }: SelectFieldProps) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-[13px] font-semibold text-brand-navy-900">{label}</span>
      <span className="relative flex items-center">
        {icon && <span className="pointer-events-none absolute left-4 z-10 text-brand-slate">{icon}</span>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-14 w-full appearance-none rounded-2xl border border-black/8 bg-white text-[16px] font-medium text-brand-ink shadow-sm outline-none transition focus:border-brand-teal-500 focus:ring-4 focus:ring-brand-teal-500/15 ${
            icon ? 'pl-11' : 'pl-4'
          } pr-10 ${value ? '' : 'text-brand-slate/60'}`}
        >
          <option value="" disabled>
            {placeholder ?? 'Selecione'}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-4 h-4 w-4 text-brand-slate" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  );
}
