import { useState, useEffect, useRef } from 'react';
import {
  Flame, TrendingUp, Home as HomeIcon, FlaskConical, BookOpen, BarChart3, Users,
  Calculator, Brain, LayoutGrid, Dumbbell, Moon, GraduationCap, Check, Play, Lock,
  Trophy, ArrowLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import MentalMath from '../training/MentalMath';
import DigitSpan from '../training/DigitSpan';
import NBack from '../training/NBack';
import { loadTraining, recordExercise, toggleHabit, todayHabits, markWatched, TrainingData } from '../utils/training';
import { loadGameData } from '../utils/localStorage';
import { loadTestProfile, deriveFocus } from '../utils/profile';
import { Logo } from './Logo';

interface Props { onExit: () => void; onStartTest?: (t: 'iq' | 'personality' | 'career') => void; }
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
// Biblioteca de vídeos (YouTube embed). `a` = canal; `yt` = ID; `cat` = categoria.
const PALETTE = ['#12A08C', '#2F6BEB', '#7C4DDF', '#2E8B57', '#E0872B', '#C0392B'];
const CATS = ['Neurociência', 'Memória & aprendizado', 'Foco & produtividade', 'Hábitos', 'Mentalidade', 'Exercícios'];
const CONTENT: { t: string; a: string; c: string; free: boolean; yt: string; cat: string }[] = [
  // Neurociência
  { t: 'Fundamentos das neurociências: como o cérebro aprende', a: 'Faculdade Censupeg', free: true, yt: 'aNrLg0nWxxc', cat: 'Neurociência' },
  { t: 'Conheça o seu cérebro', a: 'Minutos Psíquicos', free: true, yt: 'hk37Avkusv0', cat: 'Neurociência' },
  { t: 'O que é um neurônio?', a: 'Minutos Psíquicos', free: false, yt: 'XsLNJSshq34', cat: 'Neurociência' },
  { t: 'Neuroplasticidade: seu cérebro não será o mesmo', a: 'Eslen Delanogare', free: true, yt: 'uVtYOnwK0K4', cat: 'Neurociência' },
  { t: 'Neurocientista explica o cérebro de forma simples (Eslen)', a: 'Cortes do Lutz', free: false, yt: 'RTYV2NMKoAU', cat: 'Neurociência' },
  { t: 'Como reprogramar seu cérebro em 8 semanas', a: 'NeuroVox', free: false, yt: 'NWeBTAtAHS8', cat: 'Neurociência' },
  { t: 'A psicologia do filme Divertida Mente', a: 'Minutos Psíquicos', free: false, yt: 'nbnW0vou57M', cat: 'Neurociência' },
  // Memória & aprendizado
  { t: 'Aprendizado, memória e cognição · Dra. Roberta Ekuni', a: 'Lutz Podcast', free: true, yt: 'hMK51lr5GNM', cat: 'Memória & aprendizado' },
  { t: 'Como funciona a memorização e a aprendizagem no cérebro', a: 'DP Podcast', free: true, yt: 'fglBJm9iOBc', cat: 'Memória & aprendizado' },
  { t: 'Como memorizar absolutamente tudo', a: 'Ciência Todo Dia', free: false, yt: '3vdzghRCprU', cat: 'Memória & aprendizado' },
  { t: 'Estudar melhor em 72 segundos (com base na ciência)', a: 'Emmanuel Nominato', free: false, yt: 'NFWTzRiHmo0', cat: 'Memória & aprendizado' },
  { t: 'Como ser mais inteligente (em 7 min)', a: 'André Cardoso', free: false, yt: '2nN4sesL4HU', cat: 'Memória & aprendizado' },
  { t: 'Como ser mais inteligente', a: 'Eslen Delanogare', free: false, yt: 'UKnTrG5ogKI', cat: 'Memória & aprendizado' },
  { t: '10 hábitos para ficar mais inteligente', a: 'Seja Uma Pessoa Melhor', free: false, yt: 'I8LPSIVhKQI', cat: 'Memória & aprendizado' },
  // Foco & produtividade
  { t: 'Como parar de procrastinar e aumentar a produtividade', a: 'Eslen Delanogare', free: false, yt: 'GjKW0iG63NM', cat: 'Foco & produtividade' },
  { t: 'Como parar de procrastinar', a: 'Eslen Delanogare', free: false, yt: 'cMIygysMRww', cat: 'Foco & produtividade' },
  { t: 'Como ficar viciado em estudar', a: 'Eslen Delanogare', free: false, yt: 'SoVDbRWfwwk', cat: 'Foco & produtividade' },
  { t: 'O que faz o cérebro querer estudar', a: 'bremado', free: false, yt: 'oQw1Wo1GNp0', cat: 'Foco & produtividade' },
  { t: 'Como aprender a ser disciplinado', a: 'Eslen Delanogare', free: false, yt: 'j9rz_QAFhk0', cat: 'Foco & produtividade' },
  { t: 'Como forçar seu cérebro a estudar (Prof. ITA)', a: 'Lutz Podcast', free: false, yt: '48W7Er0FILg', cat: 'Foco & produtividade' },
  { t: 'Como treinar o cérebro para ter força mental', a: 'Reservatório de Dopamina', free: false, yt: 'oz2GlfCgWkg', cat: 'Foco & produtividade' },
  // Hábitos
  { t: 'Como mudar (rápido) sua vida', a: 'Eslen Delanogare', free: true, yt: '0rtNKdODxbo', cat: 'Hábitos' },
  { t: '3 passos para melhorar seus hábitos', a: 'Eslen Delanogare', free: false, yt: 'NAzqNOv0Xlw', cat: 'Hábitos' },
  { t: '5 hábitos que você precisa eliminar', a: 'Eslen Delanogare', free: false, yt: 'hy47ZkTFQNE', cat: 'Hábitos' },
  { t: 'Comer saudável vai mudar sua vida', a: 'Eslen Delanogare', free: false, yt: 'e2Ph-mKnU5I', cat: 'Hábitos' },
  { t: 'Por isso você está sempre cansado', a: 'Eslen Delanogare', free: false, yt: '9mc2rd7wJdA', cat: 'Hábitos' },
  // Mentalidade
  { t: 'Como ser melhor que 99% das pessoas', a: 'Eslen Delanogare', free: false, yt: 'bg8yyVGD24g', cat: 'Mentalidade' },
  { t: 'A neurociência da obsessão: treine o impossível', a: 'Gustavo Duarte', free: false, yt: 'GLPsJGHoYp0', cat: 'Mentalidade' },
  { t: 'Por isso você está sempre desmotivado', a: 'Eslen Delanogare', free: false, yt: 'n_R9ilKqWCc', cat: 'Mentalidade' },
  { t: 'Se sentindo incapaz? Veja este vídeo', a: 'Eslen Delanogare', free: false, yt: 'MSfzGbgvwFM', cat: 'Mentalidade' },
  { t: '8 técnicas de controle emocional', a: 'Minutos Psíquicos', free: false, yt: 'AwxYSQGT734', cat: 'Mentalidade' },
  { t: '4 dicas para melhorar sua saúde mental', a: 'Minutos Psíquicos', free: false, yt: 'CrwRwgNJIMU', cat: 'Mentalidade' },
  // Exercícios
  { t: '7 exercícios cerebrais para afiar o raciocínio', a: 'Conexão Psíquica', free: true, yt: 'v_AJWMt3ZU4', cat: 'Exercícios' },
  { t: 'Ativar seu cérebro: exercício de memória', a: 'PhysioBRAIN', free: false, yt: 'CKDu3xHVuIw', cat: 'Exercícios' },
  { t: 'Estimule a memória com 1 exercício por dia', a: 'PhysioBRAIN', free: true, yt: '7xCbC75a_Kg', cat: 'Exercícios' },
  { t: 'Ativar o cérebro · Parte 130', a: 'PhysioBRAIN', free: false, yt: 'mgalWJtI25U', cat: 'Exercícios' },
  { t: 'Ativar o cérebro · Parte 131', a: 'PhysioBRAIN', free: false, yt: 'aDdyier_HsM', cat: 'Exercícios' },
  { t: 'Ativar o cérebro · Parte 132', a: 'PhysioBRAIN', free: false, yt: 'bIF9HihGNG8', cat: 'Exercícios' },
  { t: 'Ativar o cérebro · Parte 133', a: 'PhysioBRAIN', free: false, yt: 'jjlMGWNNYkE', cat: 'Exercícios' },
  { t: 'Ativar o cérebro · Parte 134', a: 'PhysioBRAIN', free: false, yt: 'Bq2xbv1uTbk', cat: 'Exercícios' },
  { t: 'Ativar o cérebro · Parte 135', a: 'PhysioBRAIN', free: false, yt: '-GiK92MJU3s', cat: 'Exercícios' },
  // Curadoria dos canais (Ekuni / Perin / NeuroVox / Eslen Podcast)
  { t: 'A neurociência da memória', a: 'Dra. Roberta Ekuni', free: true, yt: 'X5MCxXihKLQ', cat: 'Memória & aprendizado' },
  { t: 'Prática de recordação: a técnica mais subestimada', a: 'Dra. Roberta Ekuni', free: false, yt: '8B3wkObYkCs', cat: 'Memória & aprendizado' },
  { t: 'A ciência de como memorizar o conteúdo', a: 'Dra. Roberta Ekuni', free: false, yt: 'mdJvJQbHoSk', cat: 'Memória & aprendizado' },
  { t: 'Como revisar pra realmente aprender', a: 'Dra. Roberta Ekuni', free: false, yt: 'D7o31F4fJ18', cat: 'Memória & aprendizado' },
  { t: 'Reler não funciona sozinho: o jeito certo', a: 'Dra. Roberta Ekuni', free: false, yt: 'l4NO0HBlJOQ', cat: 'Memória & aprendizado' },
  { t: 'Como montar um cronograma de estudos que funciona', a: 'Dra. Roberta Ekuni', free: false, yt: 'CiLX0tA2B6o', cat: 'Memória & aprendizado' },
  { t: 'Como o cérebro toma decisões?', a: 'Fabio Perin', free: false, yt: 'kdj5qPGC9SA', cat: 'Neurociência' },
  { t: '10 fatores que envelhecem o seu cérebro', a: 'NeuroVox', free: false, yt: '4ZR855kGZeA', cat: 'Neurociência' },
  { t: 'Como ser mais produtivo (neurocientista explica)', a: 'Fabio Perin', free: true, yt: 'nvnWr7cfC1Q', cat: 'Foco & produtividade' },
  { t: 'Por isso você não consegue focar', a: 'NeuroVox', free: false, yt: 'XrtXmFbSQ0o', cat: 'Foco & produtividade' },
  { t: 'O truque do silêncio pra aumentar o foco', a: 'Dra. Roberta Ekuni', free: false, yt: 'mTamzLQe-kY', cat: 'Foco & produtividade' },
  { t: 'Como substituir hábitos ruins por bons', a: 'Fabio Perin', free: false, yt: 'HKj0nneWVnQ', cat: 'Hábitos' },
  { t: '9 hábitos que estão destruindo sua mente', a: 'NeuroVox', free: false, yt: '40KjTfuvyto', cat: 'Hábitos' },
  { t: 'Evite 10 hábitos que acabam com sua saúde mental', a: 'NeuroVox', free: false, yt: '91v4qNOLe6k', cat: 'Hábitos' },
  { t: 'Mude sua vida em 1 mês com o que funciona', a: 'Eslen Podcast', free: false, yt: 'bEV23c3_4sg', cat: 'Hábitos' },
  { t: 'É por isso que nada muda na sua vida (neurociência)', a: 'NeuroVox', free: true, yt: 'dyhfFZXf3fE', cat: 'Mentalidade' },
  { t: '13 maneiras de fortalecer sua mente e resiliência', a: 'NeuroVox', free: false, yt: 'TKaBh_eKBlc', cat: 'Mentalidade' },
  { t: 'Por que a zona de conforto te deixa desconfortável', a: 'Fabio Perin', free: false, yt: 'AIZBNgNgO38', cat: 'Mentalidade' },
  { t: 'Estamos vivendo uma epidemia de TDAH?', a: 'Fabio Perin', free: false, yt: 'HmQCNO9ux1k', cat: 'Mentalidade' },
  { t: 'Como ajudar pessoas com TDAH', a: 'Fabio Perin', free: false, yt: 'JV38z1THZHQ', cat: 'Mentalidade' },
  { t: 'Aprenda a regular suas emoções', a: 'Eslen Podcast', free: false, yt: 'pdGp7IKJTMc', cat: 'Mentalidade' },
  { t: 'Entenda a síndrome de burnout', a: 'Eslen Podcast', free: false, yt: '_5k-PX-pI7k', cat: 'Mentalidade' },
].map((v, i) => ({ ...v, c: PALETTE[i % PALETTE.length] }));

// Trilha de aprendizado (currículo: conteúdo em vídeo + sessão de treino, em
// sequência). Cada módulo de conteúdo aponta pra um vídeo real da biblioteca.
// Jornada guiada (mapa): módulos em ordem pedagógica, INTERCALANDO vídeo
// (teoria) e treino (exercício do app OU vídeo "como treinar" do PhysioBRAIN).
// Cada passo desbloqueia o próximo — o "sentido de ir avançando".
type Step = { t: string; kind: 'video' | 'treino'; ex?: ExKey; yt?: string; src?: string };
const CURRICULUM: { m: string; steps: Step[] }[] = [
  { m: '1 · Entenda seu cérebro', steps: [
    { t: 'Como o cérebro aprende', kind: 'video', yt: 'aNrLg0nWxxc', src: 'Faculdade Censupeg' },
    { t: 'Sessão: cálculo mental', kind: 'treino', ex: 'math' },
    { t: 'Neuroplasticidade: você pode mudar', kind: 'video', yt: 'uVtYOnwK0K4', src: 'Eslen Delanogare' },
    { t: 'Como treinar: ativação cerebral', kind: 'treino', yt: '7xCbC75a_Kg', src: 'PhysioBRAIN' },
  ] },
  { m: '2 · Memória & aprendizado', steps: [
    { t: 'Como funciona a sua memória', kind: 'video', yt: 'fglBJm9iOBc', src: 'DP Podcast' },
    { t: 'Sessão: span de dígitos', kind: 'treino', ex: 'span' },
    { t: 'A neurociência da memória', kind: 'video', yt: 'X5MCxXihKLQ', src: 'Dra. Roberta Ekuni' },
    { t: 'Como treinar: ativar o cérebro', kind: 'treino', yt: 'mgalWJtI25U', src: 'PhysioBRAIN' },
    { t: 'Prática de recordação (recall)', kind: 'video', yt: '8B3wkObYkCs', src: 'Dra. Roberta Ekuni' },
    { t: 'Sessão: N-back', kind: 'treino', ex: 'nback' },
  ] },
  { m: '3 · Foco & disciplina', steps: [
    { t: 'Por isso você não consegue focar', kind: 'video', yt: 'XrtXmFbSQ0o', src: 'NeuroVox' },
    { t: 'Sessão: cálculo mental', kind: 'treino', ex: 'math' },
    { t: 'Como parar de procrastinar', kind: 'video', yt: 'GjKW0iG63NM', src: 'Eslen Delanogare' },
    { t: 'Como treinar: ativar o cérebro', kind: 'treino', yt: 'aDdyier_HsM', src: 'PhysioBRAIN' },
  ] },
  { m: '4 · Hábitos que afiam a mente', steps: [
    { t: 'Substituir hábitos ruins por bons', kind: 'video', yt: 'HKj0nneWVnQ', src: 'Fabio Perin' },
    { t: 'Sessão: span de dígitos', kind: 'treino', ex: 'span' },
    { t: 'Comer saudável muda sua vida', kind: 'video', yt: 'e2Ph-mKnU5I', src: 'Eslen Delanogare' },
    { t: 'Como treinar: ativar o cérebro', kind: 'treino', yt: 'bIF9HihGNG8', src: 'PhysioBRAIN' },
  ] },
  { m: '5 · Mentalidade', steps: [
    { t: 'É por isso que nada muda (neurociência)', kind: 'video', yt: 'dyhfFZXf3fE', src: 'NeuroVox' },
    { t: 'Sessão: N-back', kind: 'treino', ex: 'nback' },
    { t: 'Aprenda a regular suas emoções', kind: 'video', yt: 'pdGp7IKJTMc', src: 'Eslen Podcast' },
  ] },
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

function Spark({ data, big, light }: { data: { index: number }[]; big?: boolean; light?: boolean }) {
  const stroke = light ? '#ffffff' : '#12A08C';
  const area = light ? 'rgba(255,255,255,0.22)' : 'rgba(18,160,140,0.10)';
  if (data.length < 2) return <div className={`text-xs mt-1 ${light ? 'text-white/70' : 'text-slate-400'}`}>Faça treinos pra ver sua curva evoluir.</div>;
  const w = 300, h = big ? 90 : 56, pad = 4;
  const vals = data.map((d) => d.index);
  const min = Math.min(...vals) - 1, max = Math.max(...vals) + 1;
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - 2 * pad);
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
  const d = vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full mt-1">
      <path d={`${d} L${x(vals.length - 1)} ${h} L${x(0)} ${h} Z`} fill={area} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" />
      <circle cx={x(vals.length - 1)} cy={y(vals[vals.length - 1])} r="3.5" fill={stroke} />
    </svg>
  );
}

// Extrai o ID do YouTube de várias formas de URL (ou aceita o ID cru).
function ytId(u?: string): string | null {
  if (!u) return null;
  const m = u.match(/(?:youtu\.be\/|watch\?v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(u) ? u : null;
}

// Carrega a YouTube IFrame API uma vez (pra medir tempo assistido de verdade).
let ytApiPromise: Promise<void> | null = null;
function loadYTApi(): Promise<void> {
  const w = window as unknown as { YT?: { Player?: unknown }; onYouTubeIframeAPIReady?: () => void };
  if (w.YT && w.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
  });
  return ytApiPromise;
}

const WATCH_GOAL = 300; // 5 min pra concluir (ou 90% se o vídeo for mais curto)
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function VideoModal({ title, url, watched, onComplete, onClose }: { title: string; url?: string; watched: boolean; onComplete: () => void; onClose: () => void }) {
  const id = ytId(url);
  const hostRef = useRef<HTMLDivElement>(null);
  const acc = useRef(0); // segundos realmente assistidos (não conta pulos)
  const last = useRef(0);
  const [secs, setSecs] = useState(0);
  const [goal, setGoal] = useState(WATCH_GOAL);
  const [done, setDone] = useState(watched);

  useEffect(() => {
    if (!id) return;
    let poll = 0;
    let mounted = true;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let player: any = null;
    loadYTApi().then(() => {
      if (!mounted || !hostRef.current) return;
      const YT = (window as any).YT;
      player = new YT.Player(hostRef.current, {
        videoId: id,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            const d = player?.getDuration?.() || 0;
            if (d) setGoal(Math.min(WATCH_GOAL, Math.floor(d * 0.9)));
          },
        },
      });
      poll = window.setInterval(() => {
        if (!player?.getCurrentTime) return;
        const t = player.getCurrentTime();
        const playing = player.getPlayerState?.() === 1;
        const delta = t - last.current;
        if (playing && delta > 0 && delta < 2) acc.current += delta; // ignora saltos (seek)
        last.current = t;
        setSecs(Math.floor(acc.current));
        if (acc.current >= goal && !done) { setDone(true); onComplete(); }
      }, 1000);
    });
    return () => { mounted = false; if (poll) clearInterval(poll); try { player?.destroy?.(); } catch { /* noop */ } };
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [id, goal, done, onComplete]);

  const pct = Math.min(100, Math.round((secs / goal) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="aspect-video bg-black">
          {id ? (
            <div ref={hostRef} className="w-full h-full" />
          ) : (
            <div className="w-full h-full grid place-items-center text-white/70 text-sm">Vídeo em breve</div>
          )}
        </div>
        {id && (
          <div className="px-4 pt-3">
            {done ? (
              <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-600"><Check className="w-4 h-4" /> Concluído! Passo desbloqueado.</div>
            ) : (
              <>
                <div className="flex items-center justify-between text-[12px] text-slate-500 mb-1.5">
                  <span>Assista pelo menos {fmt(goal)} pra concluir</span>
                  <span className="tabular-nums font-semibold">{fmt(secs)} / {fmt(goal)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} /></div>
              </>
            )}
          </div>
        )}
        <div className="p-4 flex items-center justify-between gap-3">
          <span className="font-semibold text-ink text-[15px]">{title}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">Fechar</button>
        </div>
      </div>
    </div>
  );
}

const card = 'bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_rgba(18,32,59,0.04),0_14px_32px_-24px_rgba(18,32,59,0.28)]';

// ---------- HOJE ----------
function HomeTab({ data, onTrain, go }: { data: TrainingData; onTrain: (k: ExKey) => void; go: (t: Tab) => void }) {
  const profile = loadTestProfile();
  const focus = profile ? deriveFocus(profile) : null;
  // A "sessão de hoje" começa pelo exercício que ataca o ponto fraco do teste
  // (se ainda não foi feito hoje); depois cai no fluxo normal.
  const recommended = focus && !data.todayDone.includes(focus.ex) ? EXERCISES.find((e) => e.key === focus.ex) : null;
  const next = recommended ?? EXERCISES.find((e) => !data.todayDone.includes(e.key)) ?? EXERCISES[0];
  const done = data.todayDone.length;
  return (
    <div className="space-y-4">
      {focus && (
        <div className="rounded-2xl p-5 bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_18px_44px_-22px_rgba(18,160,140,0.75)]">
          <div className="flex items-center gap-1.5 text-[12px] text-white/80"><Sparkles className="w-3.5 h-3.5" /> Seu plano personalizado</div>
          <p className="text-[15px] mt-2 leading-snug">
            Seu teste mostrou força em <b>{focus.strongest.label.toLowerCase()}</b>. O maior espaço pra crescer está em <b>{focus.area}</b>, e é por aí que sua jornada começa.
          </p>
          <p className="text-[13px] text-white/85 mt-2">Separamos o exercício certo pra isso, logo abaixo.</p>
        </div>
      )}

      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-2xl p-4">
        <Flame className={`w-9 h-9 ${data.streak > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
        <div className="flex-1">
          <div className="font-display text-xl font-bold text-ink">{data.streak} {data.streak === 1 ? 'dia' : 'dias'} de streak</div>
          <div className="text-[12px] text-slate-500">Não quebre a corrente. Treine 1 sessão hoje.</div>
        </div>
      </div>

      <div className={`${card} p-5`}>
        <div className="text-xs uppercase tracking-widest text-brand mb-1">{recommended ? 'Recomendado pra você' : 'Sua sessão de hoje'}</div>
        <div className="flex items-center gap-3 mt-2">
          <span className="w-11 h-11 rounded-xl bg-brand-light grid place-items-center"><next.icon className="w-6 h-6 text-brand" /></span>
          <div className="flex-1"><div className="font-bold text-ink">{next.label}</div><div className="text-[12px] text-slate-500">{next.desc}</div></div>
        </div>
        <button onClick={() => onTrain(next.key)} className="w-full mt-4 bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2">
          <Play className="w-5 h-5" /> Continuar treino ({done}/{EXERCISES.length})
        </button>
      </div>

      <div className="rounded-2xl p-5 bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_18px_44px_-22px_rgba(18,160,140,0.75)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[12px] text-white/80"><TrendingUp className="w-3.5 h-3.5" /> Índice de Treino</div>
          <button onClick={() => go('progresso')} className="text-white/90 text-sm font-semibold flex items-center">Ver progresso <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="font-display text-4xl font-bold tabular-nums">{data.index}</div>
        <Spark data={data.history} light />
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
function TestsTab({ bestIQ, onStartTest }: { bestIQ: number; onStartTest?: (t: 'iq' | 'personality' | 'career') => void }) {
  const tests = [
    { type: 'iq' as const, t: 'Teste de QI', d: '30 questões · ~15 min', done: bestIQ > 0 },
    { type: 'personality' as const, t: 'Personalidade (Big Five)', d: 'IPIP-NEO · ~7 min', done: false },
    { type: 'career' as const, t: 'Vocacional (RIASEC)', d: 'Holland · ~8 min', done: false },
  ];
  return (
    <div className="space-y-4">
      <div className={`${card} p-5 text-center`}>
        <div className="text-xs uppercase tracking-widest text-slate-400">Seu último QI</div>
        <div className="font-display text-5xl font-bold text-brand tabular-nums my-1">{bestIQ || '··'}</div>
        <p className="text-[12px] text-slate-500">Refaça periodicamente e acompanhe a evolução do seu laudo.</p>
      </div>
      {tests.map((t) => (
        <div key={t.t} className={`${card} p-4 flex items-center gap-3`}>
          <span className="w-10 h-10 rounded-xl bg-brand-light grid place-items-center"><FlaskConical className="w-5 h-5 text-brand" /></span>
          <div className="flex-1"><div className="font-semibold text-ink flex items-center gap-2">{t.t}{t.done && <Check className="w-4 h-4 text-emerald-600" />}</div><div className="text-[12px] text-slate-500">{t.d}</div></div>
          <button onClick={() => onStartTest?.(t.type)} className="text-brand font-semibold text-sm">{t.done ? 'Refazer' : 'Fazer'}</button>
        </div>
      ))}
    </div>
  );
}

// ---------- APRENDER ----------
function LearnTab({ data, onTrain, onPlay }: { data: TrainingData; onTrain: (k: ExKey) => void; onPlay: (v: { t: string; yt: string }) => void }) {
  const allSteps = CURRICULUM.flatMap((mod) => mod.steps);
  const doneOf = (s: Step) => (s.ex ? data.bestByExercise[s.ex] != null : !!s.yt && data.watched.includes(s.yt));
  let firstOpen = allSteps.findIndex((s) => !doneOf(s));
  if (firstOpen < 0) firstOpen = allSteps.length;
  // Progresso é POSICIONAL (quantos passos antes do cursor), senão exercícios
  // repetidos em módulos diferentes inflavam a barra e ficavam verdes sozinhos.
  const doneN = firstOpen;
  let gi = -1;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display tracking-tight font-bold text-ink mb-1">Jornada do Cérebro</h3>
        <p className="text-[12px] text-slate-500 mb-2">Siga na ordem: um conteúdo, um treino. Cada passo desbloqueia o próximo.</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-slate-200 rounded-full h-2"><div className="bg-brand h-2 rounded-full transition-all" style={{ width: `${Math.round((doneN / allSteps.length) * 100)}%` }} /></div>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">{doneN}/{allSteps.length}</span>
        </div>
        <div className="space-y-3">
          {CURRICULUM.map((mod) => (
            <div key={mod.m} className={`${card} p-4`}>
              <h4 className="font-bold text-ink text-[14px] mb-3">{mod.m}</h4>
              {mod.steps.map((s, si) => {
                gi += 1;
                const idx = gi;
                const done = idx < firstOpen;
                const locked = idx > firstOpen;
                const current = idx === firstOpen;
                const isVideo = s.kind === 'video';
                const last = si === mod.steps.length - 1;
                return (
                  <div key={si} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold flex-shrink-0 ${done ? 'bg-emerald-500 text-white' : current ? 'bg-brand text-white ring-4 ring-brand-light' : locked ? 'bg-slate-100 text-slate-400' : 'bg-brand-light text-brand'}`}>
                        {done ? <Check className="w-4 h-4" /> : locked ? <Lock className="w-3.5 h-3.5" /> : isVideo ? <Play className="w-3.5 h-3.5" /> : <Dumbbell className="w-3.5 h-3.5" />}
                      </span>
                      {!last && <span className={`w-0.5 flex-1 my-1 ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                    </div>
                    <button
                      disabled={locked}
                      onClick={() => { if (locked) return; if (s.ex) onTrain(s.ex); else if (s.yt) onPlay({ t: s.t, yt: s.yt }); }}
                      className={`flex-1 text-left pb-4 min-w-0 ${locked ? 'opacity-50' : ''}`}
                    >
                      <div className="font-medium text-ink text-[14px] flex items-center gap-2 flex-wrap">{s.t}{current && <span className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded-full">continuar</span>}</div>
                      <div className="text-[11px] text-slate-400">{isVideo ? `Vídeo · ${s.src ?? ''}` : s.ex ? 'Sessão de treino' : `Como treinar · ${s.src ?? ''}`}</div>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display tracking-tight font-bold text-ink mb-1">Explorar toda a biblioteca</h3>
        <p className="text-[12px] text-slate-500 mb-4">Se quiser ir além da jornada · {CONTENT.length} vídeos · novos toda semana.</p>
        {CATS.map((catName) => {
          const vids = CONTENT.filter((v) => v.cat === catName);
          if (!vids.length) return null;
          return (
            <div key={catName} className="mb-6">
              <h4 className="font-semibold text-ink text-[14px] mb-2">{catName} <span className="text-slate-400 font-normal">· {vids.length}</span></h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {vids.map((v) => (
                  <button key={v.yt} onClick={() => onPlay({ t: v.t, yt: v.yt })} className={`${card} overflow-hidden text-left hover:border-brand hover:-translate-y-0.5 transition-all`}>
                    <div className="aspect-video relative grid place-items-center bg-cover bg-center" style={{ backgroundColor: v.c, backgroundImage: `url(https://img.youtube.com/vi/${v.yt}/hqdefault.jpg)` }}>
                      <div className="absolute inset-0 bg-black/25" />
                      <span className="relative w-11 h-11 rounded-full bg-white/30 grid place-items-center"><Play className="w-5 h-5 text-white ml-0.5" /></span>
                    </div>
                    <div className="p-2.5">
                      <div className="text-[12.5px] font-semibold text-ink leading-tight line-clamp-2">{v.t}</div>
                      <div className="text-[10.5px] text-slate-400 mt-1">{v.a}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
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
      <div className="rounded-2xl p-5 bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_18px_44px_-22px_rgba(18,160,140,0.75)]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1 text-[12px] text-white/80"><TrendingUp className="w-3.5 h-3.5" /> Índice de Treino</div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{t.name}</span>
        </div>
        <div className="font-display text-4xl font-bold tabular-nums">{data.index}</div>
        <Spark data={data.history} big light />
        <p className="text-[11px] text-white/70 mt-1">Seu score no app, não seu QI. Sobe com treino e consistência.</p>
      </div>

      <div className={`${card} p-5`}>
        <h3 className="font-display tracking-tight font-bold text-ink mb-3">Por habilidade</h3>
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
        <h3 className="font-display tracking-tight font-bold text-ink mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand" /> Insights</h3>
        <ul className="text-[13.5px] text-slate-600 space-y-1.5">
          <li>🔥 Streak de <b className="text-ink">{data.streak}</b> {data.streak === 1 ? 'dia' : 'dias'}. Consistência é o que mais move seu índice.</li>
          {strongest ? <li>💪 Seu ponto mais forte: <b className="text-ink">{strongest.label.toLowerCase()}</b>. Aproveite pra encarar níveis maiores.</li> : <li>▶️ Faça sua primeira sessão pra desbloquear seus insights.</li>}
          <li>🎯 Falta treinar: <b className="text-ink">{EXERCISES.filter((e) => data.bestByExercise[e.key] == null).map((e) => e.label.toLowerCase()).join(', ') || 'nada, todos treinados!'}</b>.</li>
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
        <div className="font-display text-2xl font-bold tracking-tight" style={{ color: t.color }}>{t.name}</div>
        <p className="text-[12px] text-slate-500 mt-1">{t.next < 999 ? `Faltam ${Math.max(0, t.next - data.index)} pontos pra subir de liga.` : 'Liga máxima. Você está no topo.'}</p>
      </div>

      <div className={`${card} p-4`}>
        <h3 className="font-display tracking-tight font-bold text-ink mb-3">Ranking da semana</h3>
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
        <h3 className="font-display tracking-tight font-bold text-ink mb-1">Desafio da semana</h3>
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

export default function Platform({ onExit, onStartTest }: Props) {
  const [data, setData] = useState<TrainingData>(() => loadTraining());
  const [tab, setTab] = useState<Tab>('hoje');
  const [active, setActive] = useState<ExKey | null>(null);
  const [video, setVideo] = useState<{ t: string; yt: string } | null>(null);
  const bestIQ = loadGameData().bestIQ;

  const finish = (key: ExKey, score: number) => { setData(recordExercise(key, score)); setActive(null); };

  if (active === 'math') return <MentalMath onDone={(s) => finish('math', s)} onExit={() => setActive(null)} />;
  if (active === 'span') return <DigitSpan onDone={(s) => finish('span', s)} onExit={() => setActive(null)} />;
  if (active === 'nback') return <NBack onDone={(s) => finish('nback', s)} onExit={() => setActive(null)} />;

  const onTrain = (k: ExKey) => setActive(k);
  const onToggleHab = (k: 'aerobic' | 'sleep' | 'skill') => setData(toggleHabit(k));
  const openVideo = (v: { t: string; yt: string }) => setVideo(v);

  const sections = (
    <>
      {tab === 'hoje' && <HomeTab data={data} onTrain={onTrain} go={setTab} />}
      {tab === 'testes' && <TestsTab bestIQ={bestIQ} onStartTest={onStartTest} />}
      {tab === 'aprender' && <LearnTab data={data} onTrain={onTrain} onPlay={openVideo} />}
      {tab === 'progresso' && <ProgressTab data={data} />}
      {tab === 'comunidade' && <CommunityTab data={data} onToggleHab={onToggleHab} />}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white lg:flex">
      {/* Sidebar (desktop): identidade e navegação */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:sticky lg:top-0 border-r border-slate-200 bg-white px-4 py-6">
        <div className="px-2 mb-8"><Logo className="h-8" /></div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setTab(n.key)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === n.key ? 'bg-brand-light text-brand-dark' : 'text-slate-500 hover:bg-slate-50'}`}>
              <n.icon className="w-5 h-5" /> {n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2.5 text-sm">
            <Flame className="w-5 h-5 text-amber-500" /><span className="font-bold text-ink tabular-nums">{data.streak}</span><span className="text-slate-500 text-xs">dias de streak</span>
          </div>
          <button onClick={onExit} className="w-full text-left text-xs text-slate-400 hover:text-slate-600 px-3 py-2 flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Sair</button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="relative flex-1 min-w-0">
        {/* glows ambientes (identidade) */}
        <div className="pointer-events-none absolute top-0 right-0 w-[520px] h-[520px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle, rgba(18,160,140,0.12), transparent 65%)' }} />
        <div className="pointer-events-none absolute top-[40%] -left-40 w-[440px] h-[440px] rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(47,107,235,0.10), transparent 66%)' }} />
        {/* Header (mobile) */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-100 lg:hidden">
          <div className="px-4 h-14 flex items-center gap-3">
            <button onClick={onExit} className="text-slate-400 hover:text-slate-600"><ArrowLeft className="w-5 h-5" /></button>
            <Logo className="h-7" />
            <span className="ml-auto flex items-center gap-1 text-sm font-bold text-amber-500"><Flame className="w-4 h-4" /> {data.streak}</span>
          </div>
        </header>

        <h1 className="hidden lg:block relative max-w-3xl mx-auto px-6 pt-8 font-display text-[26px] font-bold tracking-tight text-ink">{TITLES[tab]}</h1>
        <main className="relative mx-auto w-full max-w-md lg:max-w-3xl px-4 lg:px-6 py-5 pb-28 lg:pb-10">{sections}</main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20 lg:hidden">
        <div className="max-w-md mx-auto grid grid-cols-5">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setTab(n.key)} className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${tab === n.key ? 'text-brand' : 'text-slate-400 hover:text-slate-600'}`}>
              <n.icon className="w-5 h-5" />
              {n.label}
            </button>
          ))}
        </div>
      </nav>

      {video && (
        <VideoModal
          title={video.t}
          url={video.yt}
          watched={data.watched.includes(video.yt)}
          onComplete={() => setData(markWatched(video.yt))}
          onClose={() => setVideo(null)}
        />
      )}
    </div>
  );
}
