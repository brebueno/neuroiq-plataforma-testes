import { RotateCcw, Brain } from 'lucide-react';

interface TypeScore {
  type: string;
  label: string;
  correct: number;
  total: number;
}

interface IQResultProps {
  iq: number;
  classification: string;
  percentile: number;
  score: number;
  total: number;
  bestScore: number;
  bestIQ: number;
  isNewBestIQ: boolean;
  isNewHighScore: boolean;
  byType?: TypeScore[];
  retryLabel: string;
  onBack: () => void;
  onRetry: () => void;
}

// Small bell curve with the user's position marked.
function MiniCurve({ iq }: { iq: number }) {
  const W = 320, H = 120, pad = 16, base = H - 22, topY = 10;
  const min = 55, max = 145, mean = 100, sd = 15;
  const x = (v: number) => pad + ((v - min) / (max - min)) * (W - 2 * pad);
  const g = (v: number) => Math.exp(-0.5 * ((v - mean) / sd) ** 2);
  const y = (v: number) => base - g(v) * (base - topY);
  let d = '';
  for (let v = min; v <= max; v++) d += `${v === min ? 'M' : 'L'}${x(v).toFixed(1)} ${y(v).toFixed(1)} `;
  const mx = x(Math.max(min, Math.min(max, iq)));
  const my = y(Math.max(min, Math.min(max, iq)));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs mx-auto">
      <path d={`${d}L${x(max)} ${base} L${x(min)} ${base} Z`} fill="rgba(18,160,140,0.10)" />
      <path d={d} fill="none" stroke="#12A08C" strokeWidth="2" />
      {[70, 100, 130].map((v) => (
        <text key={v} x={x(v)} y={base + 14} textAnchor="middle" fontSize="9" fill="#8b97ac">{v}</text>
      ))}
      <line x1={mx} y1={my} x2={mx} y2={base} stroke="#E0A93B" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx={mx} cy={my} r="5" fill="#E0A93B" />
      <text x={mx} y={my - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="#B57828">você</text>
    </svg>
  );
}

export default function IQResult({
  iq, classification, percentile, score, total, bestScore, bestIQ,
  isNewBestIQ, isNewHighScore, byType, retryLabel, onBack, onRetry,
}: IQResultProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white py-10 px-4">
      <div className="max-w-md mx-auto">
        {/* Hero — the number */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 mb-5 text-center shadow-sm">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-600 mb-3">
            <Brain className="w-4 h-4" /> Seu resultado
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-6xl font-extrabold text-teal-700 tracking-tight">{iq}</span>
            {isNewBestIQ && <span className="bg-amber-400 text-amber-900 text-[10px] px-2 py-1 rounded-full font-bold">RECORDE</span>}
          </div>
          <div className="text-lg font-semibold text-ink mt-1">{classification}</div>
          <p className="text-sm text-gray-500 mt-1">Você pontuou melhor que <b className="text-ink">{percentile}%</b> das pessoas.</p>
          <div className="mt-4"><MiniCurve iq={iq} /></div>
        </div>

        {/* Breakdown by reasoning type */}
        {byType && byType.length > 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 shadow-sm">
            <h3 className="font-bold text-ink mb-4">Por tipo de raciocínio</h3>
            <div className="space-y-4">
              {byType.map((t) => {
                const pct = t.total ? Math.round((t.correct / t.total) * 100) : 0;
                return (
                  <div key={t.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-ink">{t.label}</span>
                      <span className="text-gray-500 tabular-nums">{t.correct}/{t.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Score + bests */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Stat label="Acertos" value={`${score}/${total}`} />
          <Stat label="Melhor QI" value={String(bestIQ)} />
          <Stat label="Recorde" value={String(bestScore)} badge={isNewHighScore} />
        </div>

        <p className="text-[12px] text-gray-400 text-center mb-6 leading-relaxed">
          Estimativa recreativa, calculada em relação a quem fez este teste. Não é uma avaliação clínica.
        </p>

        <div className="space-y-3">
          <button onClick={onBack} className="w-full bg-brand text-white py-3.5 rounded-xl hover:bg-brand-dark transition-colors font-semibold">
            Voltar ao início
          </button>
          <button onClick={onRetry} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> {retryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
      <div className="text-xl font-extrabold text-ink tabular-nums">{value}{badge && <span className="text-[10px] text-amber-600 ml-1">NOVO</span>}</div>
      <div className="text-[11px] text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
