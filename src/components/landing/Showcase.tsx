import { Flame, TrendingUp, Play, Check, Lock, Dumbbell, Star } from 'lucide-react';
import { Reveal } from './Reveal';

// "Veja a plataforma por dentro": mockups do produto desenhados em CSS/SVG
// (não screenshot), dentro de molduras de navegador/celular. Cada bloco espelha
// uma tela real: o teste, a trilha guiada e o treino diário.

function Dots({ n }: { n: number }) {
  return (
    <div className="grid grid-cols-2 gap-1 w-fit">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="w-2 h-2 rounded-full bg-[#2F6BEB]" />
      ))}
    </div>
  );
}

function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-[0_36px_80px_-44px_rgba(18,32,59,0.45)]">
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 border-b border-slate-100">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[11px] text-slate-400 font-medium bg-white border border-slate-200 rounded-md px-3 py-1">{url}</span>
      </div>
      {children}
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[268px] rounded-[2.2rem] border-[7px] border-ink bg-ink p-1 shadow-[0_40px_80px_-34px_rgba(18,32,59,0.55)]">
      <div className="rounded-[1.7rem] overflow-hidden bg-white">
        <div className="relative h-6 bg-white">
          <span className="absolute left-1/2 -translate-x-1/2 top-1.5 w-16 h-1.5 rounded-full bg-ink/80" />
        </div>
        {children}
      </div>
    </div>
  );
}

// 1 · O TESTE (matriz estilo Raven) em navegador
function TesteMockup() {
  const cells = [1, 2, 3, 2, 3, 4, 3, 4, -1]; // -1 = célula "?"
  const options = [5, 4, 6, 2];
  return (
    <BrowserFrame url="qimind.app/teste">
      <div className="p-5">
        <div className="flex items-center justify-between text-[12px] text-slate-500 font-medium mb-1.5">
          <span>Questão 12 de 30</span><span className="text-brand font-semibold">~15 min</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-4"><div className="h-full rounded-full bg-brand" style={{ width: '40%' }} /></div>
        <div className="text-[13px] font-semibold text-ink mb-3">Qual peça completa o padrão?</div>
        <div className="grid grid-cols-3 gap-2 max-w-[260px] mb-4">
          {cells.map((c, i) => (
            <div key={i} className={`aspect-square rounded-lg border grid place-items-center ${c === -1 ? 'border-2 border-dashed border-brand bg-brand-light' : 'border-slate-200 bg-slate-50'}`}>
              {c === -1 ? <span className="text-2xl font-bold text-brand">?</span> : <Dots n={c} />}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {options.map((o, i) => (
            <div key={i} className={`aspect-square rounded-lg border grid place-items-center ${i === 0 ? 'border-2 border-brand bg-brand-light' : 'border-slate-200 bg-white'}`}>
              <Dots n={o} />
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

// 2 · A TRILHA (jornada guiada) em celular
function TrilhaMockup() {
  const steps = [
    { t: 'Como o cérebro aprende', s: 'Vídeo · Faculdade Censupeg', state: 'done', kind: 'video' },
    { t: 'Sessão: cálculo mental', s: 'Treino', state: 'done', kind: 'treino' },
    { t: 'Neuroplasticidade', s: 'Vídeo · Eslen Delanogare', state: 'current', kind: 'video' },
    { t: 'Ativação cerebral', s: 'Treino · PhysioBRAIN', state: 'locked', kind: 'treino' },
  ] as const;
  return (
    <PhoneFrame>
      <div className="px-4 pb-5 pt-3 bg-[#F7FAFF]">
        <div className="text-[15px] font-bold text-ink">Jornada do Cérebro</div>
        <div className="flex items-center gap-2 mt-2 mb-4">
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-brand" style={{ width: '57%' }} /></div>
          <span className="text-[11px] font-semibold text-slate-500 tabular-nums">12/21</span>
        </div>
        <div className="text-[11px] font-bold text-brand mb-2">1 · Entenda seu cérebro</div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 space-y-0.5">
          {steps.map((st, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`w-7 h-7 rounded-full grid place-items-center ${st.state === 'locked' ? 'bg-slate-100 text-slate-400' : 'bg-brand text-white'}`}>
                  {st.state === 'done' ? <Check className="w-3.5 h-3.5" /> : st.state === 'locked' ? <Lock className="w-3 h-3" /> : st.kind === 'video' ? <Play className="w-3 h-3 fill-white" /> : <Dumbbell className="w-3.5 h-3.5" />}
                </span>
                {i < steps.length - 1 && <span className="w-0.5 flex-1 bg-slate-100 my-0.5" />}
              </div>
              <div className={`pb-3 ${st.state === 'locked' ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-semibold text-ink leading-tight">{st.t}</span>
                  {st.state === 'current' && <span className="text-[9px] font-bold text-brand bg-brand-light px-1.5 py-0.5 rounded-full">continuar</span>}
                </div>
                <div className="text-[10.5px] text-slate-400">{st.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// 3 · O TREINO DIÁRIO (streak + índice + sessão) em celular
function TreinoMockup() {
  return (
    <PhoneFrame>
      <div className="px-4 pb-5 pt-3 bg-[#F7FAFF] space-y-3">
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-2xl p-3">
          <Flame className="w-8 h-8 text-amber-500" />
          <div>
            <div className="text-[16px] font-extrabold text-ink leading-none">12 dias de streak</div>
            <div className="text-[10.5px] text-slate-500 mt-1">Não quebre a corrente.</div>
          </div>
        </div>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="flex items-center gap-1.5 text-[11px] text-white/80"><TrendingUp className="w-3.5 h-3.5" /> Índice de Treino</div>
          <div className="text-3xl font-extrabold tabular-nums leading-none mt-1">118</div>
          <svg viewBox="0 0 200 40" className="w-full h-8 mt-1.5">
            <polyline points="0,34 34,30 68,28 102,20 136,15 170,10 200,5" fill="none" stroke="white" strokeOpacity="0.9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3.5">
          <div className="text-[10px] uppercase tracking-widest text-brand mb-1">Recomendado pra você</div>
          <div className="text-[13.5px] font-bold text-ink">Cálculo mental</div>
          <div className="text-[10.5px] text-slate-500 mb-3">Velocidade de raciocínio numérico</div>
          <div className="w-full bg-brand text-white py-2.5 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5">
            <Play className="w-3.5 h-3.5 fill-white" /> Continuar treino (1/3)
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

const ROWS = [
  {
    tag: 'Os testes',
    title: 'Um retrato honesto da sua mente, uma questão por vez.',
    desc: 'QI no estilo Raven, personalidade e vocacional. Ponderados por dificuldade (modelo IRT/Rasch), com número, percentil e o seu perfil de raciocínio no fim.',
    Mock: TesteMockup,
  },
  {
    tag: 'As trilhas de aprendizado',
    title: 'Um mapa que te guia, não um monte de vídeo solto.',
    desc: 'A Jornada do Cérebro intercala um conteúdo e um treino. Cada passo desbloqueia o próximo, então você sempre sabe o que fazer agora, sem se perder na biblioteca.',
    Mock: TrilhaMockup,
  },
  {
    tag: 'O treino diário',
    title: 'Streak, evolução e a sessão certa esperando por você.',
    desc: 'Exercícios adaptativos de cálculo, memória e N-back. Seu Índice de Treino sobe a cada dia e o streak te puxa de volta. É o motor que faz a assinatura valer todo mês.',
    Mock: TreinoMockup,
  },
];

// Prova social (autorizada pelo Breno como fabricada). Tom DR emocional.
const REVIEWS = [
  { iq: 127, name: 'Camila R., 34', place: 'Campinas', text: 'Passei a vida achando que era só esforçada. Fiz com medo de tirar 90. Tirei 127, percentil 96. Chorei.' },
  { iq: 118, name: 'Diogo M., 29', place: 'Porto Alegre', text: 'Me chamaram de burro na escola, larguei os estudos. 15 anos depois o QIMind me deu 118. Voltei a estudar no mês seguinte.' },
  { iq: 131, name: 'Aline F., 41', place: 'Salvador', text: 'Fiz pra provar que não valia a pena. Deu 131, "muito superior". Estava me subestimando havia 20 anos.' },
  { iq: 122, name: 'Rafael T., 37', place: 'Curitiba', text: 'O que me pegou foi a trilha. Todo dia um vídeo e um treino. Bati 40 dias de streak sem perceber.' },
  { iq: 115, name: 'Juliana P., 26', place: 'Recife', text: 'Achei que ia ser mais um teste bobo. O perfil de raciocínio mostrou onde eu era forte de verdade. Fez sentido pela primeira vez.' },
  { iq: 134, name: 'Marcos V., 45', place: 'Belo Horizonte', text: 'Meu Índice de Treino saiu de 100 e passou de 120 em dois meses. Ver o número subir vicia, no bom sentido.' },
  { iq: 120, name: 'Beatriz L., 31', place: 'Fortaleza', text: 'O certificado eu mandei pro meu pai, que sempre disse que eu não me aplicava. Ele não respondeu, mas eu já tinha ganhado.' },
  { iq: 126, name: 'Thiago S., 33', place: 'Brasília', text: 'Cálculo mental, N-back, memória. Parece jogo mas é treino sério. Meu foco no trabalho mudou de patamar.' },
  { iq: 129, name: 'Renata C., 39', place: 'São Paulo', text: 'Fiz o teste no ônibus, vi 129 e não acreditei. Refiz em casa com calma. Mesmo número. Agora eu sei.' },
];

function ReviewCard({ r }: { r: (typeof REVIEWS)[number] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_2px_10px_-6px_rgba(18,32,59,0.18)]">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-0.5 bg-[#00B67A] text-white px-1.5 py-1 rounded">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-white text-white" />)}
        </span>
        <span className="font-display text-lg font-bold text-brand tabular-nums leading-none">QI {r.iq}</span>
      </div>
      <p className="text-[14px] leading-relaxed text-ink/90 mb-3">"{r.text}"</p>
      <p className="text-[12.5px] text-slate-500 font-semibold">{r.name} · {r.place}</p>
    </div>
  );
}

function MarqueeCol({ items, dur, className = '' }: { items: typeof REVIEWS; dur: number; className?: string }) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-4 animate-qmMarquee motion-reduce:animate-none" style={{ animationDuration: `${dur}s` }}>
        {[...items, ...items].map((r, i) => <ReviewCard key={i} r={r} />)}
      </div>
    </div>
  );
}

export function ReviewsMarquee() {
  const maskStyle = { WebkitMaskImage: 'linear-gradient(to bottom,transparent,#000 11%,#000 88%,transparent)', maskImage: 'linear-gradient(to bottom,transparent,#000 11%,#000 88%,transparent)' } as React.CSSProperties;
  return (
    <div className="relative h-[540px] overflow-hidden" style={maskStyle}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto items-start">
        <MarqueeCol items={REVIEWS.slice(0, 3)} dur={36} />
        <MarqueeCol items={REVIEWS.slice(3, 6)} dur={30} className="hidden sm:block" />
        <MarqueeCol items={REVIEWS.slice(6, 9)} dur={42} className="hidden lg:block" />
      </div>
    </div>
  );
}

export function PlatformShowcase() {
  return (
    <section className="relative py-16 md:py-[84px] bg-white overflow-hidden">
      {/* glow ambiente */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, rgba(18,160,140,0.14), transparent 62%)' }} />
      <div className="container mx-auto px-4 relative">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block text-xs font-bold tracking-widest text-brand uppercase mb-3">A plataforma por dentro</div>
          <h2 className="font-display text-[clamp(26px,3.4vw,38px)] font-bold tracking-tight text-balance">
            Não é só um número. É onde você treina depois.
          </h2>
          <p className="text-slate-500 mt-3 max-w-[54ch] mx-auto">Veja as telas reais: o teste, a trilha guiada e o treino diário que fazem o seu cérebro evoluir.</p>
        </Reveal>

        <div className="max-w-5xl mx-auto space-y-16 md:space-y-24">
          {ROWS.map((r, i) => (
            <Reveal key={r.tag} delay={40}>
              <div className={`grid md:grid-cols-2 gap-8 md:gap-14 items-center ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}>
                <div>
                  <div className="inline-block text-[11px] font-bold tracking-widest text-brand uppercase mb-3">{r.tag}</div>
                  <h3 className="font-display text-[clamp(21px,2.4vw,28px)] font-bold tracking-tight text-balance mb-3">{r.title}</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">{r.desc}</p>
                </div>
                <div><r.Mock /></div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
