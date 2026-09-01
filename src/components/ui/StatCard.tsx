import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  sublabel?: string;
  tone?: 'light' | 'dark' | 'sun';
  badge?: string;
}

const TONE_STYLES: Record<NonNullable<StatCardProps['tone']>, string> = {
  light: 'bg-white border border-black/6 text-brand-ink',
  dark: 'bg-gradient-to-br from-brand-navy-900 to-brand-navy-700 text-white border border-white/5',
  sun: 'bg-gradient-to-br from-brand-sun-400 to-brand-sun-500 text-brand-navy-900 border border-black/5',
};

const ICON_TONE: Record<NonNullable<StatCardProps['tone']>, string> = {
  light: 'bg-brand-mist text-brand-teal-600',
  dark: 'bg-white/10 text-brand-sun-300',
  sun: 'bg-white/25 text-brand-navy-900',
};

export function StatCard({ icon: Icon, label, value, sublabel, tone = 'light', badge }: StatCardProps) {
  return (
    <div className={`animate-fade-up relative overflow-hidden rounded-2xl p-4 shadow-soft ${TONE_STYLES[tone]}`}>
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-black/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide">
          {badge}
        </span>
      )}
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${ICON_TONE[tone]}`}>
        <Icon size={17} />
      </span>
      <p className={`mt-3 text-[12.5px] font-semibold ${tone === 'light' ? 'text-brand-slate' : 'opacity-80'}`}>{label}</p>
      <p className="mt-0.5 font-display text-[22px] font-extrabold leading-tight sm:text-[25px]">{value}</p>
      {sublabel && <p className={`mt-0.5 text-[11.5px] ${tone === 'light' ? 'text-brand-slate' : 'opacity-70'}`}>{sublabel}</p>}
    </div>
  );
}
