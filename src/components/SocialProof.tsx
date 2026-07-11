import { useEffect, useState } from 'react';
import { Check, Star } from 'lucide-react';
import { PROOF } from '../utils/socialProof';

// Prova social simulada (live-activity + avaliações). Números/nomes são
// fabricados — trocar por dados reais quando houver contador no backend.
const NAMES = [
  'Camila', 'Lucas', 'Ana', 'Rafael', 'Juliana', 'Bruno', 'Fernanda', 'Diego',
  'Patrícia', 'Thiago', 'Mariana', 'Gustavo', 'Larissa', 'Rodrigo', 'Beatriz',
  'Felipe', 'Aline', 'Marcelo', 'Letícia', 'Vinícius',
];
const CITIES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre',
  'Salvador', 'Recife', 'Fortaleza', 'Brasília', 'Campinas', 'Goiânia', 'Florianópolis',
];
const ACTIONS = ['desbloqueou o resultado', 'descobriu o próprio QI', 'acabou o teste'];

const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Toast fixo de atividade recente — reaparece em intervalos.
export function LiveActivity() {
  const [item, setItem] = useState<{ name: string; city: string; action: string; mins: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let alive = true;
    const show = () => {
      if (!alive) return;
      setItem({ name: rand(NAMES), city: rand(CITIES), action: rand(ACTIONS), mins: Math.floor(Math.random() * 9) + 1 });
      setVisible(true);
      window.setTimeout(() => alive && setVisible(false), 4500);
    };
    const first = window.setTimeout(show, 2500);
    const loop = window.setInterval(show, 8500);
    return () => { alive = false; window.clearTimeout(first); window.clearInterval(loop); };
  }, []);

  if (!item) return null;
  return (
    <div
      className={`fixed bottom-4 left-4 z-40 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 bg-white shadow-[0_12px_30px_-12px_rgba(18,32,59,0.4)] border border-slate-200 rounded-xl px-3.5 py-2.5 max-w-[290px]">
        <span className="w-8 h-8 rounded-full bg-brand-light grid place-items-center flex-shrink-0">
          <Check className="w-4 h-4 text-brand" />
        </span>
        <div className="text-[12.5px] leading-tight">
          <span className="font-semibold text-ink">{item.name}, de {item.city}</span>
          <span className="text-slate-500"> {item.action}</span>
          <div className="text-[11px] text-slate-400 mt-0.5">há {item.mins} min · verificado</div>
        </div>
      </div>
    </div>
  );
}

// Barra de confiança compacta pra usar no paywall/reveal.
export function TrustBar({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500 ${className}`}>
      <span className="inline-flex items-center gap-1">
        <span className="inline-flex text-amber-400">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
        </span>
        <b className="text-ink">{PROOF.rating}/{PROOF.ratingOutOf}</b>
      </span>
      <span>{PROOF.testsTaken} testes feitos</span>
      <span>{PROOF.reviews} avaliações</span>
    </div>
  );
}
