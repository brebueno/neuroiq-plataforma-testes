import { RotateCcw, Sparkles, Brain } from 'lucide-react';
import { DimensionScore } from '../data/bigFive';
import { CareerMatch } from '../data/riasec';

interface DimensionResultProps {
  title: string;
  headline: string; // dominant trait or Holland code
  heroNote?: string;
  subtitle?: string;
  dims: DimensionScore[];
  careers?: CareerMatch[];
  hexagon?: boolean;
  onRetake: () => void;
  onBack: () => void;
  onGoToPlatform?: () => void; // CTA pra plataforma (não deixa o resultado num beco)
}

// RIASEC / radar hexagon, plots all 6 interest scores on their axes.
function Hexagon({ dims }: { dims: DimensionScore[] }) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = 92;
  const n = dims.length; // 6
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });

  const grid = [0.25, 0.5, 0.75, 1].map((f) =>
    dims.map((_, i) => pt(i, r * f)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
  );
  const profile = dims.map((d, i) => pt(i, r * (d.pct / 100))).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[260px] mx-auto">
      {grid.map((g, i) => (
        <polygon key={i} points={g} fill="none" stroke="#e5e9f0" strokeWidth="1" />
      ))}
      {dims.map((_, i) => {
        const p = pt(i, r);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e9f0" strokeWidth="1" />;
      })}
      <polygon points={profile} fill="rgba(18,160,140,0.18)" stroke="#12A08C" strokeWidth="2" />
      {dims.map((d, i) => {
        const p = pt(i, r + 16);
        return (
          <text key={d.key} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill={d.color}>
            {d.key}
          </text>
        );
      })}
    </svg>
  );
}

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 44 44" className="w-11 h-11 flex-shrink-0 -rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#eef1f5" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} />
      <text x="22" y="22" textAnchor="middle" dominantBaseline="middle" className="rotate-90" transform="rotate(90 22 22)" fontSize="11" fontWeight="700" fill="#12203b">
        {pct}
      </text>
    </svg>
  );
}

export default function DimensionResult({
  title,
  headline,
  heroNote,
  subtitle,
  dims,
  careers,
  hexagon,
  onRetake,
  onBack,
  onGoToPlatform,
}: DimensionResultProps) {
  const top = [...dims].sort((a, b) => b.pct - a.pct)[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-600 mb-3">
            <Sparkles className="w-4 h-4" /> {title}
          </div>
          <div className="text-5xl font-extrabold tracking-tight mb-2" style={{ color: top.color }}>
            {headline}
          </div>
          {heroNote && <p className="text-gray-600 max-w-sm mx-auto">{heroNote}</p>}
          {subtitle && <p className="text-gray-400 text-xs mt-2">{subtitle}</p>}
        </div>

        {/* Hexagon (vocational) */}
        {hexagon && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
            <Hexagon dims={dims} />
          </div>
        )}

        {/* Dimensions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 shadow-sm">
          <h3 className="font-bold text-ink mb-5">Suas dimensões</h3>
          <div className="space-y-5">
            {dims.map((d) => (
              <div key={d.key}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="font-semibold text-ink">{d.label}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: d.color }}>{d.pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
                  <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                </div>
                <p className="text-[13px] text-gray-500">{d.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Careers with % match (vocational) */}
        {careers && careers.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 shadow-sm">
            <h3 className="font-bold text-ink mb-1">Carreiras que mais combinam</h3>
            <p className="text-[13px] text-gray-500 mb-4">Compatibilidade com o seu perfil de interesses.</p>
            <div className="space-y-3">
              {careers.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <Ring pct={c.match} color="#12A08C" />
                  <div className="flex-1">
                    <div className="font-semibold text-ink text-[15px]">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.match}% de compatibilidade</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Próximo passo: leva pra plataforma (o que a pessoa desbloqueou) */}
        {onGoToPlatform && (
          <div className="bg-gradient-to-br from-brand to-brand-dark text-white rounded-2xl p-5 mb-5 text-center">
            <p className="text-sm text-white/90">
              Seu acesso está liberado. Continue na plataforma: trilha guiada, treino diário e biblioteca de neurociência.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {onGoToPlatform && (
            <button onClick={onGoToPlatform} className="w-full bg-brand text-white py-3.5 px-4 rounded-xl hover:bg-brand-dark transition-colors font-semibold flex items-center justify-center gap-2">
              <Brain className="w-5 h-5" /> Treinar meu cérebro na plataforma
            </button>
          )}
          <button onClick={onRetake} className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Refazer teste
          </button>
          <button onClick={onBack} className="w-full text-gray-400 py-2 text-sm hover:text-gray-600 transition-colors">
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
