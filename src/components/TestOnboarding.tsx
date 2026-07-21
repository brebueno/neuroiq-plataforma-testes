import { useState } from 'react';
import { ArrowRight, User2, Users } from 'lucide-react';

// Coleta ANTES do teste: gênero + faixa etária. Enquadrado como calibração
// ("comparar com o seu grupo"), não como pedágio — baixa fricção, 2 toques.
// Os dados normalizam a apresentação do resultado (percentil por grupo) e
// alimentam o metadata do checkout / a conta criada no pós-pagamento.

export type Gender = 'male' | 'female' | 'na';
export type AgeBand = '16-24' | '25-34' | '35-44' | '45-54' | '55+';

export interface Demographics {
  gender: Gender;
  ageBand: AgeBand;
}

interface Props {
  onDone: (d: Demographics) => void;
  onBack: () => void;
}

const GENDERS: { value: Gender; label: string; icon: typeof User2 }[] = [
  { value: 'female', label: 'Feminino', icon: User2 },
  { value: 'male', label: 'Masculino', icon: User2 },
  { value: 'na', label: 'Prefiro não dizer', icon: Users },
];

const AGE_BANDS: AgeBand[] = ['16-24', '25-34', '35-44', '45-54', '55+'];

export default function TestOnboarding({ onDone, onBack }: Props) {
  const [gender, setGender] = useState<Gender | null>(null);
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const ready = gender && ageBand;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-ink mb-2">Antes de começar</h2>
          <p className="text-slate-500 text-sm">
            Isso calibra seu resultado e mostra como você se compara a pessoas do seu grupo.
          </p>
        </div>

        {/* Gênero */}
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Gênero</div>
          <div className="grid grid-cols-3 gap-2">
            {GENDERS.map(({ value, label }) => {
              const on = gender === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGender(value)}
                  className={`rounded-xl border-2 px-2 py-3 text-sm font-semibold transition-all ${
                    on ? 'border-brand bg-brand-light/60 text-ink' : 'border-slate-200 text-slate-600 hover:border-brand/40'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Faixa etária */}
        <div className="mb-8">
          <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Sua idade</div>
          <div className="grid grid-cols-5 gap-2">
            {AGE_BANDS.map((band) => {
              const on = ageBand === band;
              return (
                <button
                  key={band}
                  type="button"
                  onClick={() => setAgeBand(band)}
                  className={`rounded-xl border-2 py-3 text-xs font-semibold transition-all ${
                    on ? 'border-brand bg-brand-light/60 text-ink' : 'border-slate-200 text-slate-600 hover:border-brand/40'
                  }`}
                >
                  {band}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => ready && onDone({ gender: gender!, ageBand: ageBand! })}
          disabled={!ready}
          className="w-full bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          Começar o teste <ArrowRight className="w-5 h-5" />
        </button>
        <button onClick={onBack} className="mt-3 w-full text-slate-400 hover:text-slate-600 text-sm">
          Voltar
        </button>
      </div>
    </div>
  );
}
