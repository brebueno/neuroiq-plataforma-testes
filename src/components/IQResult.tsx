import { RotateCcw, Brain, Award, Lock, Download } from 'lucide-react';
import { saveTestProfile } from '../utils/profile';

interface TypeScore {
  type: string;
  label: string;
  correct: number;
  total: number;
}

// Leitura curta do ponto forte por tipo de raciocínio (dá sensação de "avaliação", não "quiz").
const STRENGTH_NOTE: Record<string, string> = {
  matrix: 'Raciocínio abstrato: você enxerga a regra por trás do padrão antes da maioria.',
  series: 'Raciocínio sequencial: seu cérebro projeta o próximo passo com facilidade.',
  oddone: 'Discriminação lógica: você separa o que não pertence num piscar de olhos.',
  analogy: 'Raciocínio analógico: você transfere relações de um contexto para outro.',
  'verbal-analogy': 'Raciocínio verbal: você conecta conceitos por significado, não só por forma.',
  'verbal-oddone': 'Raciocínio verbal: você fareja a exceção dentro de um grupo de ideias.',
};

// Rótulos curtos e DISTINTOS para os eixos do radar.
const AXIS_SHORT: Record<string, string> = {
  matrix: 'Padrão',
  series: 'Sequência',
  oddone: 'Difere·fig',
  analogy: 'Analog·fig',
  'verbal-analogy': 'Analog·vrb',
  'verbal-oddone': 'Difere·vrb',
};

// Radar dos sub-scores por tipo de raciocínio (N eixos).
function Radar({ items }: { items: { label: string; pct: number; type?: string }[] }) {
  const size = 260, cx = 130, cy = 130, r = 84, n = items.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, radius: number) => ({ x: cx + radius * Math.cos(angle(i)), y: cy + radius * Math.sin(angle(i)) });
  const grid = [0.25, 0.5, 0.75, 1].map((f) => items.map((_, i) => pt(i, r * f)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
  const profile = items.map((d, i) => pt(i, r * Math.max(0.08, d.pct / 100))).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const short = (d: { label: string; type?: string }) => (d.type && AXIS_SHORT[d.type]) || d.label.split(' ')[0];
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px] mx-auto">
      {grid.map((g, i) => <polygon key={i} points={g} fill="none" stroke="#e5e9f0" strokeWidth="1" />)}
      {items.map((_, i) => { const p = pt(i, r); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e9f0" strokeWidth="1" />; })}
      <polygon points={profile} fill="rgba(18,160,140,0.18)" stroke="#12A08C" strokeWidth="2" />
      {items.map((d, i) => { const p = pt(i, r + 15); return <text key={d.label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fontWeight="600" fill="#46536e">{short(d)}</text>; })}
    </svg>
  );
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
  const items = (byType ?? []).map((t) => ({ label: t.label, type: t.type, pct: t.total ? Math.round((t.correct / t.total) * 100) : 0 }));
  const top = items.length ? [...items].sort((a, b) => b.pct - a.pct)[0] : null;
  const certId = `QI-${iq}-${((percentile * 37 + score * 101) % 9000) + 1000}`;
  const certDate = new Date().toLocaleDateString('pt-BR');
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white py-10 px-4">
      <div className="max-w-md mx-auto">
        {/* Hero, the number */}
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

        {/* Sub-scores por tipo de raciocínio: radar + leitura do perfil */}
        {items.length > 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 shadow-sm">
            <h3 className="font-bold text-ink mb-1">Seu perfil de raciocínio</h3>
            <p className="text-[13px] text-gray-500 mb-3">Cinco tipos de raciocínio cruzados. É daqui que sai o seu número.</p>
            <Radar items={items} />
            {top && (
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 mt-3 text-[13.5px] text-teal-900">
                <b>Seu ponto forte é {top.label.toLowerCase()}</b> ({top.pct}%). {STRENGTH_NOTE[top.type] ?? 'você se destaca nesse tipo de raciocínio.'}
              </div>
            )}
            <div className="space-y-3 mt-4">
              {byType!.map((t) => {
                const pct = t.total ? Math.round((t.correct / t.total) * 100) : 0;
                return (
                  <div key={t.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-ink">{t.label}</span>
                      <span className="text-gray-500 tabular-nums">{pct}%</span>
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

        {/* Certificado-troféu (compartilhável) */}
        <div className="bg-gradient-to-b from-white to-amber-50/40 border-2 border-amber-300 rounded-2xl p-6 mb-5 text-center shadow-sm">
          <Award className="w-8 h-8 text-amber-500 mx-auto mb-1.5" />
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Certificado QIMind</div>
          <div className="text-5xl font-extrabold text-ink my-1 tabular-nums">{iq}</div>
          <div className="text-sm text-slate-500">{classification} · percentil {percentile}</div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">ID {certId} · {certDate}</div>
          <button onClick={() => window.print()} className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand font-semibold hover:underline">
            <Download className="w-4 h-4" /> Baixar / imprimir certificado
          </button>
        </div>

        {/* Score + bests */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Stat label="Acertos" value={`${score}/${total}`} />
          <Stat label="Melhor QI" value={String(bestIQ)} />
          <Stat label="Recorde" value={String(bestScore)} badge={isNewHighScore} />
        </div>

        {/* Gancho da plataforma (Fase 2: treino diário + evolução) */}
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-5 mb-5 text-center">
          <Lock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Seu número é o ponto de partida. Dentro do QIMind você treina seu raciocínio todos os dias e acompanha sua evolução ao longo do tempo.
          </p>
        </div>

        <p className="text-[12px] text-gray-400 text-center mb-6 leading-relaxed">
          Estimativa recreativa, calculada em relação a quem fez este teste. Não é uma avaliação clínica.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              saveTestProfile({ iq, percentile, classification, byType: items.map((i) => ({ type: i.type ?? '', label: i.label, pct: i.pct })) });
              window.location.hash = '#plataforma';
            }}
            className="w-full bg-brand text-white py-3.5 rounded-xl hover:bg-brand-dark transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Brain className="w-5 h-5" /> Treinar meu cérebro na plataforma
          </button>
          <button onClick={onRetry} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> {retryLabel}
          </button>
          <button onClick={onBack} className="w-full text-gray-400 py-2 text-sm hover:text-gray-600 transition-colors">
            Voltar ao início
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
