import { useEffect, useRef, useState } from 'react';
import { Flame, TrendingUp, Play } from 'lucide-react';
import { useTilt, CountUp } from './Reveal';

// Cena 3D que representa a plataforma QIMind: cards de vidro flutuando em
// profundidades diferentes (Índice de Treino, streak, jornada, resultado do QI,
// vídeo da biblioteca), com tilt seguindo o mouse. Puro CSS 3D, sem libs.

const STAGE_W = 520;
const STAGE_H = 440;

// Card em profundidade: outer aplica translateZ (depth), inner flutua (translateY).
function Card({
  z, style, delay, children, className = '',
}: { z: number; style: React.CSSProperties; delay: number; children: React.ReactNode; className?: string }) {
  return (
    <div style={{ position: 'absolute', transform: `translateZ(${z}px)`, ...style }}>
      <div
        className={`animate-qmFloat rounded-2xl border border-white/70 bg-white/85 backdrop-blur-md ${className}`}
        style={{ animationDelay: `${delay}s`, boxShadow: '0 22px 45px -18px rgba(18,32,59,0.35), 0 6px 14px -8px rgba(18,32,59,0.18)' }}
      >
        {children}
      </div>
    </div>
  );
}

export function Platform3D() {
  const { stageRef, sceneRef } = useTilt();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Escala a peça de tamanho fixo pra caber na coluna (responsivo).
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const apply = () => setScale(Math.min(1, wrap.clientWidth / STAGE_W));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="w-full min-w-0 overflow-hidden flex justify-center" style={{ height: STAGE_H * scale }}>
      <div ref={stageRef} style={{ width: STAGE_W, height: STAGE_H, perspective: 1500, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        <div
          ref={sceneRef}
          style={{ width: STAGE_W, height: STAGE_H, transformStyle: 'preserve-3d', transition: 'transform .35s cubic-bezier(.2,.7,.2,1)' }}
        >
          {/* linhas de conexão sutis */}
          <svg width={STAGE_W} height={STAGE_H} style={{ position: 'absolute', inset: 0, transform: 'translateZ(0)' }}>
            <path d="M265 210 L90 95 M265 210 L430 90 M265 210 L130 340 M265 210 L400 350" stroke="#12A08C" strokeOpacity="0.18" strokeWidth="1.5" fill="none" />
            <circle cx="265" cy="210" r="3.5" fill="#12A08C" />
          </svg>

          {/* ROOT · Índice de Treino */}
          <Card z={72} delay={0} style={{ left: 150, top: 150, width: 232 }} className="p-4 ring-1 ring-brand/30">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand"><TrendingUp className="w-3.5 h-3.5" /> Índice de Treino</div>
            <div className="font-display text-4xl font-bold text-ink tracking-tight tabular-nums leading-none mt-1"><CountUp end={118} /></div>
            <svg viewBox="0 0 200 44" className="w-full h-8 mt-2">
              <polyline points="0,38 34,34 68,30 102,24 136,16 170,12 200,6" fill="none" stroke="#12A08C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="200" cy="6" r="3" fill="#12A08C" />
            </svg>
          </Card>

          {/* STREAK */}
          <Card z={46} delay={0.9} style={{ left: 6, top: 44, width: 156 }} className="p-3.5">
            <div className="flex items-center gap-2.5">
              <Flame className="w-8 h-8 text-amber-500" />
              <div>
                <div className="font-display text-xl font-bold text-ink leading-none">12 dias</div>
                <div className="text-[11px] text-slate-500 mt-0.5">de streak</div>
              </div>
            </div>
          </Card>

          {/* QI result */}
          <Card z={54} delay={1.6} style={{ left: 352, top: 22, width: 156 }} className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Seu QI</div>
            <div className="font-display text-4xl font-bold text-brand tracking-tight tabular-nums leading-none mt-1"><CountUp end={128} /></div>
            <div className="text-[11px] text-slate-500 mt-1">percentil 97</div>
            <svg viewBox="0 0 120 40" className="w-full h-8 mt-1.5">
              <path d="M4 34 Q60 -6 116 34" fill="none" stroke="#2F6BEB" strokeWidth="2" strokeOpacity="0.5" />
              <circle cx="86" cy="14" r="3.5" fill="#E0A93B" />
            </svg>
          </Card>

          {/* JORNADA */}
          <Card z={30} delay={0.4} style={{ left: 18, top: 300, width: 214 }} className="p-3.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-ink">
              <span>Jornada do Cérebro</span><span className="text-slate-400 tabular-nums">12/21</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden"><div className="h-full rounded-full bg-brand" style={{ width: '57%' }} /></div>
            <div className="flex items-center gap-2 mt-3">
              <span className="w-6 h-6 rounded-full bg-brand grid place-items-center text-white text-[10px] font-bold">✓</span>
              <span className="w-6 h-6 rounded-full bg-brand grid place-items-center text-white"><Play className="w-3 h-3 fill-white" /></span>
              <span className="w-6 h-6 rounded-full bg-slate-100 grid place-items-center text-slate-400 text-[11px]">🔒</span>
              <span className="text-[10.5px] text-slate-400 ml-1">continuar</span>
            </div>
          </Card>

          {/* VÍDEO */}
          <Card z={16} delay={2.1} style={{ left: 322, top: 292, width: 186 }} className="p-2.5">
            <div className="relative rounded-lg overflow-hidden h-[72px] bg-gradient-to-br from-brand to-brand-dark grid place-items-center">
              <span className="w-9 h-9 rounded-full bg-white/90 grid place-items-center"><Play className="w-4 h-4 text-brand fill-brand ml-0.5" /></span>
            </div>
            <div className="text-[12px] font-semibold text-ink mt-2 leading-tight">Neuroplasticidade: você pode mudar</div>
            <div className="text-[10.5px] text-slate-400 mt-0.5">Eslen Delanogare</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
