import { useState } from 'react';
import {
  Flame, TrendingUp, Home as HomeIcon, FlaskConical, BookOpen, BarChart3, Users,
  Calculator, Brain, LayoutGrid, Dumbbell, Moon, GraduationCap, Check, Play, Lock,
  Trophy, ArrowLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import MentalMath from '../training/MentalMath';
import DigitSpan from '../training/DigitSpan';
import NBack from '../training/NBack';
import { loadTraining, recordExercise, toggleHabit, todayHabits, TrainingData } from '../utils/training';
import { loadGameData } from '../utils/localStorage';

interface Props { onExit: () => void; }
type ExKey = 'math' | 'span' | 'nback';
type Tab = 'hoje' | 'testes' | 'aprender' | 'progresso' | 'comunidade';

const EXERCISES: { key: ExKey; label: string; desc: string; icon: typeof Calculator }[] = [
  { key: 'math', label: 'Cálculo mental', desc: 'Velocidade de raciocínio numérico', icon: Calculator },
  { key: 'span', label: 'Memória de trabalho', desc: 'Span de dígitos crescente', icon: Brain },
  { key: 'nback', label: 'N-back (2 atrás)', desc: 'Atenção e memória de trabalho', icon: LayoutGrid },
];

const HABITS: { key: 'aerobic' | 'sleep' | 'skill'; label: string; icon: typeof Dumbbell }[] = [
  { key: 'aerobic', label: 'Exercício aeróbico', icon: Dumbbell },
  { key: 'sleep', label: 'Dormi 7-8h', icon: Moon },
  { key: 'skill', label: 'Pratiquei skill nova', icon: GraduationCap },
];

// Biblioteca de conteúdo (neurociência aplicada, estilo Eslen/Huberman).
const CONTENT = [
  { t: 'Neuroplasticidade: seu cérebro muda a vida toda', a: 'Fundamentos', min: '8 min', c: '#12A08C', free: true },
  { t: 'Dopamina, foco e o custo das telas', a: 'Neurociência aplicada', min: '11 min', c: '#2F6BEB', free: true },
  { t: 'Sono: como a memória se consolida à noite', a: 'Hábitos', min: '9 min', c: '#7C4DDF', free: false },
  { t: 'Repetição espaçada: por que você esquece', a: 'Técnicas de estudo', min: '7 min', c: '#E0872B', free: false },
  { t: 'Palácio da memória, passo a passo', a: 'Técnicas de memória', min: '12 min', c: '#C0392B', free: false },
  { t: 'Exercício físico e cognição: a evidência', a: 'Hábitos', min: '10 min', c: '#2E8B57', free: false },
];

// Trilha de aprendizado (módulos progressivos, estilo Brilliant).
const TRILHA = [
  { t: 'Como o cérebro aprende', kind: 'conteúdo' as const },
  { t: 'Sessão: cálculo mental', kind: 'treino' as const, ex: 'math' as ExKey },
  { t: 'Memória de trabalho na prática', kind: 'conteúdo' as const },
  { t: 'Sessão: span de dígitos', kind: 'treino' as const, ex: 'span' as ExKey },
  { t: 'Atenção e foco', kind: 'conteúdo' as const },
  { t: 'Sessão: N-back', kind: 'treino' as const, ex: 'nback' as ExKey },
];

const LEADERBOARD = [
  { n: 'Rafael M.', v: 141 }, { n: 'Camila R.', v: 137 }, { n: 'Diego P.', v: 133 },
  { n: 'Você', v: 0, me: true }, { n: 'Aline F.', v: 121 }, { n: 'Bruno S.', v: 118 },
];

function tier(index: number): { name: string; color: string; next: number } {
  if (index >= 130) return { name: 'Diamante', color: '#2F6BEB', next: 999 };
  if (index >= 120) return { name: 'Ouro', color: '#E0A93B', next: 130 };
  if (index >= 110) return { name: 'Prata', color: '#8b97ac', next: 120 };
  return { name: 'Bronze', color: '#B57828', next: 110 };
}

function Spark({ data, big }: { data: { index: number }[]; big?: boolean }) {
  if (data.length < 2) return <div className="text-xs text-slate-400 mt-1">Faça treinos pra ver sua curva evoluir.</div>;
  const w = 300, h = big ? 90 : 56, pad = 4;
  const vals = data.map((d) => d.index);
  const min = Math.min(...vals) - 1, max = Math.max(...vals) + 1;
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - 2 * pad);
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
  const d = vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full mt-1">
      <path d={`${d} L${x(vals.length - 1)} ${h} L${x(0)} ${h} Z`} fill="rgba(18,160,140,0.10)" />
      <path d={d} fill="none" stroke="#12A08C" strokeWidth="2" />
      <circle cx={x(vals.length - 1)} cy={y(vals[vals.length - 1])} r="3.5" fill="#12A08C" />
    </svg>
  );
}

const card = 'bg-white border border-slate-200 rounded-2xl shadow-sm';

// ---------- HOJE ----------
function HomeTab({ data, onTrain, go }: { data: TrainingData; onTrain: (k: ExKey) => void; go: (t: Tab) => void }) {
  const next = EXERCISES.find((e) => !data.todayDone.includes(e.key)) ?? EXERCISES[0];
  const done = data.todayDone.length;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-2xl p-4">
        <Flame className={`w-9 h-9 ${data.streak > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
        <div className="flex-1">
          <div className="text-xl font-extrabold text-ink">{data.streak} {data.streak === 1 ? 'dia' : 'dias'} de streak</div>
          <div className="text-[12px] text-slate-500">Não quebre a corrente. Treine 1 sessão hoje.</div>
        </div>
      </div>

      <div className={`${card} p-5`}>
        <div className="text-xs uppercase tracking-widest text-brand mb-1">Sua sessão de hoje</div>
        <div className="flex items-center gap-3 mt-2">
          <span className="w-11 h-11 rounded-xl bg-brand-light grid place-items-center"><next.icon className="w-6 h-6 text-brand" /></span>
          <div className="flex-1"><div className="font-bold text-ink">{next.label}</div><div className="text-[12px] text-slate-500">{next.desc}</div></div>
        </div>
        <button onClick={() => onTrain(next.key)} className="w-full mt-4 bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2">
          <Play className="w-5 h-5" /> Continuar treino ({done}/{EXERCISES.length})
        </button>
      </div>

      <div className={`${card} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[12px] text-slate-500"><TrendingUp className="w-3.5 h-3.5" /> Índice de Treino</div>
          <button onClick={() => go('progresso')} className="text-brand text-sm font-semibold flex items-center">Ver progresso <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="text-3xl font-extrabold text-brand tabular-nums">{data.index}</div>
        <Spark data={data.history} />
      </div>

      <button onClick={() => go('aprender')} className={`${card} p-4 w-full flex items-center gap-3 hover:border-brand transition-colors text-left`}>
        <span className="w-10 h-10 rounded-xl bg-brand-light grid place-items-center"><BookOpen className="w-5 h-5 text-brand" /></span>
        <div className="flex-1"><div className="font-semibold text-ink">Continuar sua trilha</div><div className="text-[12px] text-slate-500">Aprenda como o cérebro funciona</div></div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </button>
    </div>
  );
}

// ---------- TESTES ----------
function TestsTab({ bestIQ }: { bestIQ: number }) {
  const tests = [
    { t: 'Teste de QI', d: '30 questões · ~15 min', done: bestIQ > 0 },
    { t: 'Personalidade (Big Five)', d: 'IPIP-NEO · ~7 min', done: false },
    { t: 'Vocacional (RIASEC)', d: 'Holland · ~8 min', done: false },
  ];
  return (
    <div className="space-y-4">
      <div className={`${card} p-5 text-center`}>
        <div className="text-xs uppercase tracking-widest text-slate-400">Seu último QI</div>
        <div className="text-5xl font-extrabold text-brand tabular-nums my-1">{bestIQ || '—'}</div>
        <p className="text-[12px] text-slate-500">Refaça periodicamente e acompanhe a evolução do seu laudo.</p>
      </div>
      {tests.map((t) => (
        <div key={t.t} className={`${card} p-4 flex items-center gap-3`}>
          <span className="w-10 h-10 rounded-xl bg-brand-light grid place-items-center"><FlaskConical className="w-5 h-5 text-brand" /></span>
          <div className="flex-1"><div className="font-semibold text-ink flex items-center gap-2">{t.t}{t.done && <Check className="w-4 h-4 text-emerald-600" />}</div><div className="text-[12px] text-slate-500">{t.d}</div></div>
          <button onClick={() => { window.location.hash = ''; }} className="text-brand font-semibold text-sm">{t.done ? 'Refazer' : 'Fazer'}</button>
        </div>
      ))}
    </div>
  );
}

// ---------- APRENDER ----------
function LearnTab({ data, onTrain }: { data: TrainingData; onTrain: (k: ExKey) => void }) {
  const doneCount = data.todayDone.length + Object.keys(data.bestByExercise).length;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-ink mb-1">Trilha: Fundamentos da Mente</h3>
        <p className="text-[12px] text-slate-500 mb-3">Aprenda a teoria e treine na prática, passo a passo.</p>
        <div className={`${card} p-2`}>
          {TRILHA.map((m, i) => {
            const isTrain = m.kind === 'treino';
            const complete = isTrain && m.ex && data.bestByExercise[m.ex] != null;
            const locked = i > doneCount + 1;
            return (
              <button
                key={m.t}
                disabled={locked}
                onClick={() => { if (isTrain && m.ex) onTrain(m.ex); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left ${locked ? 'opacity-45' : 'hover:bg-slate-50'} transition-colors`}
              >
                <span className={`w-8 h-8 rounded-full grid place-items-center flex-shrink-0 text-xs font-bold ${complete ? 'bg-emerald-100 text-emerald-600' : locked ? 'bg-slate-100 text-slate-400' : 'bg-brand-light text-brand'}`}>
                  {complete ? <Check className="w-4 h-4" /> : locked ? <Lock className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <div className="flex-1"><div className="font-medium text-ink text-[14.5px]">{m.t}</div><div className="text-[11px] text-slate-400">{isTrain ? 'Sessão de treino' : 'Conteúdo · vídeo'}</div></div>
                {!locked && <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-ink mb-1">Biblioteca de neurociência</h3>
        <p className="text-[12px] text-slate-500 mb-3">Baseada em evidência. Novos vídeos toda semana.</p>
        <div className="grid grid-cols-2 gap-3">
          {CONTENT.map((v) => (
            <div key={v.t} className={`${card} overflow-hidden`}>
              <div className="aspect-video relative grid place-items-center" style={{ background: v.c }}>
                <Play className="w-8 h-8 text-white/90" />
                <span className="absolute top-1.5 right-1.5 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded">{v.min}</span>
                {!v.free && <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-white/90 text-ink px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> Premium</span>}
              </div>
              <div className="p-2.5">
                <div className="text-[12.5px] font-semibold text-ink leading-tight line-clamp-2">{v.t}</div>
                <div className="text-[10.5px] text-slate-400 mt-1">{v.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- PROGRESSO ----------
function ProgressTab({ data }: { data: TrainingData }) {
  const t = tier(data.index);
  const strongest = EXERCISES.reduce<{ label: string; v: number } | null>((acc, e) => {
    const v = data.bestByExercise[e.key];
    if (v == null) return acc;
    return !acc || v > acc.v ? { label: e.label, v } : acc;
  }, null);
  return (
    <div className="space-y-4">
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1 text-[12px] text-slate-500"><TrendingUp className="w-3.5 h-3.5" /> Índice de Treino</div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${t.color}22`, color: t.color }}>{t.name}</span>
        </div>
        <div className="text-4xl font-extrabold text-brand tabular-nums">{data.index}</div>
        <Spark data={data.history} big />
        <p className="text-[11px] text-slate-400 mt-1">Seu score no app, não seu QI. Sobe com treino e consistência.</p>
      </div>

      <div className={`${card} p-5`}>
        <h3 className="font-bold text-ink mb-3">Por habilidade</h3>
        <div className="space-y-3">
          {EXERCISES.map((e) => {
            const v = data.bestByExercise[e.key] ?? 0;
            return (
              <div key={e.key}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-ink">{e.label}</span><span className="text-slate-500 tabular-nums">{v}</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-brand h-2 rounded-full transition-all duration-700" style={{ width: `${v}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${card} p-5`}>
        <h3 className="font-bold text-ink mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand" /> Insights</h3>
        <ul className="text-[13.5px] text-slate-600 space-y-1.5">
          <li>🔥 Streak de <b className="text-ink">{data.streak}</b> {data.streak === 1 ? 'dia' : 'dias'}. Consistência é o que mais move seu índice.</li>
          {strongest ? <li>💪 Seu ponto mais forte: <b className="text-ink">{strongest.label.toLowerCase()}</b>. Aproveite pra encarar níveis maiores.</li> : <li>▶️ Faça sua primeira sessão pra desbloquear seus insights.</li>}
          <li>🎯 Falta treinar: <b className="text-ink">{EXERCISES.filter((e) => data.bestByExercise[e.key] == null).map((e) => e.label.toLowerCase()).join(', ') || 'nada — todos treinados!'}</b>.</li>
        </ul>
      </div>
    </div>
  );
}

// ---------- COMUNIDADE ----------
function CommunityTab({ data, onToggleHab }: { data: TrainingData; onToggleHab: (k: 'aerobic' | 'sleep' | 'skill') => void }) {
  const t = tier(data.index);
  const board = LEADERBOARD.map((r) => (r.me ? { ...r, v: data.index } : r)).sort((a, b) => b.v - a.v);
  const hb = todayHabits(data);
  return (
    <div className="space-y-4">
      <div className={`${card} p-5 text-center`}>
        <Trophy className="w-7 h-7 mx-auto mb-1" style={{ color: t.color }} />
        <div className="text-xs uppercase tracking-widest text-slate-400">Sua liga</div>
        <div className="text-2xl font-extrabold" style={{ color: t.color }}>{t.name}</div>
        <p className="text-[12px] text-slate-500 mt-1">{t.next < 999 ? `Faltam ${Math.max(0, t.next - data.index)} pontos pra subir de liga.` : 'Liga máxima. Você está no topo.'}</p>
      </div>

      <div className={`${card} p-4`}>
        <h3 className="font-bold text-ink mb-3">Ranking da semana</h3>
        <div className="space-y-1">
          {board.map((r, i) => (
            <div key={r.n} className={`flex items-center gap-3 p-2 rounded-lg ${r.me ? 'bg-brand-light' : ''}`}>
              <span className="w-6 text-center font-bold text-slate-400 tabular-nums">{i + 1}</span>
              <span className={`flex-1 ${r.me ? 'font-bold text-brand-dark' : 'text-ink'}`}>{r.n}</span>
              <span className="tabular-nums font-semibold text-slate-600">{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${card} p-4`}>
        <h3 className="font-bold text-ink mb-1">Desafio da semana</h3>
        <p className="text-[13px] text-slate-500 mb-3">Complete os 3 hábitos de saúde cognitiva (o que tem mais evidência).</p>
        <div className="space-y-2">
          {HABITS.map((h) => {
            const on = hb[h.key];
            return (
              <button key={h.key} onClick={() => onToggleHab(h.key)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${on ? 'bg-brand text-white border-brand' : 'bg-white border-slate-200 hover:border-brand'}`}>
                <h.icon className={`w-5 h-5 ${on ? 'text-white' : 'text-brand'}`} />
                <span className={`flex-1 text-left font-medium ${on ? 'text-white' : 'text-ink'}`}>{h.label}</span>
                <span className={`w-5 h-5 rounded-full grid place-items-center ${on ? 'bg-white/20' : 'border-2 border-slate-200'}`}>{on && <Check className="w-3.5 h-3.5 text-white" />}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const NAV: { key: Tab; label: string; icon: typeof HomeIcon }[] = [
  { key: 'hoje', label: 'Hoje', icon: HomeIcon },
  { key: 'testes', label: 'Testes', icon: FlaskConical },
  { key: 'aprender', label: 'Aprender', icon: BookOpen },
  { key: 'progresso', label: 'Progresso', icon: BarChart3 },
  { key: 'comunidade', label: 'Tribo', icon: Users },
];

const TITLES: Record<Tab, string> = { hoje: 'Hoje', testes: 'Testes', aprender: 'Aprender', progresso: 'Progresso', comunidade: 'Comunidade' };

export default function Platform({ onExit }: Props) {
  const [data, setData] = useState<TrainingData>(() => loadTraining());
  const [tab, setTab] = useState<Tab>('hoje');
  const [active, setActive] = useState<ExKey | null>(null);
  const bestIQ = loadGameData().bestIQ;

  const finish = (key: ExKey, score: number) => { setData(recordExercise(key, score)); setActive(null); };

  if (active === 'math') return <MentalMath onDone={(s) => finish('math', s)} onExit={() => setActive(null)} />;
  if (active === 'span') return <DigitSpan onDone={(s) => finish('span', s)} onExit={() => setActive(null)} />;
  if (active === 'nback') return <NBack onDone={(s) => finish('nback', s)} onExit={() => setActive(null)} />;

  const onTrain = (k: ExKey) => setActive(k);
  const onToggleHab = (k: 'aerobic' | 'sleep' | 'skill') => setData(toggleHabit(k));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-600"><ArrowLeft className="w-5 h-5" /></button>
          <span className="font-extrabold text-ink">{TITLES[tab]}</span>
          <span className="ml-auto flex items-center gap-1 text-sm font-bold text-amber-500"><Flame className="w-4 h-4" /> {data.streak}</span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 pb-28">
        {tab === 'hoje' && <HomeTab data={data} onTrain={onTrain} go={setTab} />}
        {tab === 'testes' && <TestsTab bestIQ={bestIQ} />}
        {tab === 'aprender' && <LearnTab data={data} onTrain={onTrain} />}
        {tab === 'progresso' && <ProgressTab data={data} />}
        {tab === 'comunidade' && <CommunityTab data={data} onToggleHab={onToggleHab} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20">
        <div className="max-w-md mx-auto grid grid-cols-5">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setTab(n.key)} className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${tab === n.key ? 'text-brand' : 'text-slate-400 hover:text-slate-600'}`}>
              <n.icon className="w-5 h-5" />
              {n.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
