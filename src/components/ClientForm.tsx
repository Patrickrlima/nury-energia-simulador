import { Building2, Factory, Home as HomeIcon, MapPin, Phone, Tractor, User } from 'lucide-react';
import { useMemo } from 'react';
import { ESTADOS_BR } from '../config/solarConfig';
import { useAudience } from '../context/AudienceContext';
import type { DadosClienteSimulacao, TipoInstalacao } from '../types/solar';
import { FormField, SelectField } from './ui/FormField';
import { OptionCard } from './ui/OptionCard';

const TIPOS: { value: TipoInstalacao; label: string; icon: typeof HomeIcon }[] = [
  { value: 'residencial', label: 'Residencial', icon: HomeIcon },
  { value: 'comercial', label: 'Comercial', icon: Building2 },
  { value: 'rural', label: 'Rural', icon: Tractor },
  { value: 'industrial', label: 'Industrial', icon: Factory },
];

function formatarWhatsapp(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

interface ClientFormProps {
  dados: DadosClienteSimulacao;
  onChange: (dados: Partial<DadosClienteSimulacao>) => void;
  onContinuar: () => void;
}

export function ClientForm({ dados, onChange, onContinuar }: ClientFormProps) {
  const estadosOptions = useMemo(() => ESTADOS_BR.map((uf) => ({ value: uf, label: uf })), []);
  const valido = dados.nome.trim().length > 1 && dados.whatsapp.replace(/\D/g, '').length >= 10 && dados.cidade.trim().length > 1 && dados.estado;
  const { audiencia } = useAudience();
  const ehPublico = audiencia === 'site';

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h2 className="font-display text-[22px] font-bold text-brand-ink">{ehPublico ? 'Seus dados' : 'Dados do cliente'}</h2>
        <p className="mt-1 text-[14px] text-brand-slate">
          {ehPublico ? 'Informações rápidas para preparar a sua simulação.' : 'Informações rápidas para personalizar a simulação.'}
        </p>
      </div>

      <FormField
        label={ehPublico ? 'Seu nome' : 'Nome do cliente'}
        icon={<User size={18} />}
        placeholder="Ex.: Maria Oliveira"
        value={dados.nome}
        onChange={(e) => onChange({ nome: e.target.value })}
        autoComplete="name"
      />

      <FormField
        label="WhatsApp"
        icon={<Phone size={18} />}
        placeholder="(51) 99999-9999"
        inputMode="tel"
        value={dados.whatsapp}
        onChange={(e) => onChange({ whatsapp: formatarWhatsapp(e.target.value) })}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Cidade"
          icon={<MapPin size={18} />}
          placeholder="Ex.: Osório"
          value={dados.cidade}
          onChange={(e) => onChange({ cidade: e.target.value })}
        />
        <SelectField label="Estado" value={dados.estado} onChange={(v) => onChange({ estado: v })} options={estadosOptions} placeholder="UF" />
      </div>

      <div>
        <span className="mb-2 block text-[13px] font-semibold text-brand-navy-900">Tipo de instalação</span>
        <div className="grid grid-cols-4 gap-2.5">
          {TIPOS.map((tipo) => (
            <OptionCard
              key={tipo.value}
              icon={tipo.icon}
              label={tipo.label}
              selecionado={dados.tipoInstalacao === tipo.value}
              onClick={() => onChange({ tipoInstalacao: tipo.value })}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!valido}
        onClick={onContinuar}
        className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-brand-navy-900 text-[15px] font-bold tracking-wide text-white shadow-lift transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-brand-slate disabled:shadow-none"
      >
        CONTINUAR
      </button>
    </div>
  );
}
