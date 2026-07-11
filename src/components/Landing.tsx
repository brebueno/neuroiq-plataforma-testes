import { Brain, GraduationCap, Gamepad2, Puzzle, Check, Star, ArrowRight, User, Briefcase } from 'lucide-react';
import { Logo } from './Logo';
import { LiveActivity } from './SocialProof';
import { PROOF } from '../utils/socialProof';

const BRAND = 'QIMind';

// Pricing — edit in ONE place (must match Funnel.tsx OFFER).
const PRICE = { trial: 'R$9,90', renewal: 'R$159,00', period: 'mês' };

interface LandingProps {
  onStartIQ: () => void;
  onStartPersonality: () => void;
  onStartCareer: () => void;
  onPractice: () => void;
}

// IQ bell-curve for the hero — the brand signature and scientific anchor.
function BellCurve() {
  const W = 460;
  const H = 250;
  const padX = 28;
  const baseY = 200;
  const topY = 34;
  const minIQ = 55;
  const maxIQ = 145;
  const mean = 100;
  const sd = 15;

  const xFor = (iq: number) => padX + ((iq - minIQ) / (maxIQ - minIQ)) * (W - 2 * padX);
  const gauss = (iq: number) => Math.exp(-0.5 * ((iq - mean) / sd) ** 2);
  const yFor = (g: number) => baseY - g * (baseY - topY);

  let d = '';
  for (let iq = minIQ; iq <= maxIQ; iq += 1) {
    d += `${iq === minIQ ? 'M' : 'L'}${xFor(iq).toFixed(1)} ${yFor(gauss(iq)).toFixed(1)} `;
  }
  const area = `${d}L${xFor(maxIQ).toFixed(1)} ${baseY} L${xFor(minIQ).toFixed(1)} ${baseY} Z`;

  const ticks = [55, 70, 85, 100, 115, 130, 145];
  const bands = [
    { mid: 62, pct: '0.1%' },
    { mid: 77, pct: '2.1%' },
    { mid: 92, pct: '13.6%' },
    { mid: 100, pct: '34.1%' },
    { mid: 108, pct: '13.6%' },
    { mid: 123, pct: '2.1%' },
    { mid: 138, pct: '0.1%' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-[0_20px_50px_-30px_rgba(18,32,59,0.35)]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <path d={area} fill="#2F6BEB" fillOpacity="0.10" />
        <path d={d} fill="none" stroke="#2F6BEB" strokeWidth="2.5" strokeLinecap="round" />
        {ticks.map((t) => (
          <text key={t} x={xFor(t)} y={baseY + 18} textAnchor="middle" fontSize="11" fill="#8b97ac">
            {t}
          </text>
        ))}
        {bands.map((b) => (
          <text key={b.mid} x={xFor(b.mid)} y={Math.max(topY - 4, yFor(gauss(b.mid)) - 8)} textAnchor="middle" fontSize="11" fontWeight="600" fill="#46536e">
            {b.pct}
          </text>
        ))}
      </svg>
    </div>
  );
}

const steps = [
  { title: 'Faça o teste', desc: 'Uma visão imparcial da sua mente, uma pergunta de cada vez, em ~15 minutos.' },
  { title: 'Veja seu número', desc: 'Sua pontuação, seu percentil e onde você cai na curva. Nada de "você é inteligente" genérico.' },
  { title: 'Comece a evoluir', desc: 'Treine com exercícios e cursos feitos pra subir seu desempenho de verdade.' },
];

const tests = [
  { type: 'iq' as const, icon: Brain, title: 'Teste de QI', time: '~15 min', q: '30 questões', desc: 'É aqui que a maioria descobre que estava se subestimando a vida toda.', cta: 'Descobrir meu QI', popular: true },
  { type: 'personality' as const, icon: User, title: 'Personalidade', time: '~7 min', q: '60 perguntas', desc: 'Entenda por que você pensa e reage do jeito que reage.', cta: 'Fazer o teste', popular: false },
  { type: 'career' as const, icon: Briefcase, title: 'Vocacional', time: '~8 min', q: '36 perguntas', desc: 'Descubra pra que tipo de trabalho o seu cérebro foi feito.', cta: 'Fazer o teste', popular: false },
];

const skills = [
  { icon: GraduationCap, title: 'Cursos em vídeo', items: ['+20 horas de treino', 'Aulas fáceis de seguir', 'No seu ritmo'] },
  { icon: Gamepad2, title: 'Jogos de treino cerebral', items: ['Memória, lógica e foco', 'Dificuldade progressiva', 'Acompanhe sua evolução'] },
  { icon: Puzzle, title: 'Mais de 150 puzzles', items: ['Desafios de raciocínio', 'Padrões e estratégia', 'Novos toda semana'] },
];

const included = [
  'O número exato que mede a sua inteligência — e a faixa da curva onde 98% das pessoas nunca chegam.',
  'Por que você provavelmente foi rotulado errado na escola (e o que o seu cérebro faz melhor que a média).',
  'O tipo de raciocínio em que você é secretamente forte — aquele que ninguém nunca reconheceu.',
  'Onde o seu cérebro tropeça — e por que isso não tem nada a ver com inteligência.',
  'O certificado que você vai querer mostrar exatamente pra pessoa que duvidou de você.',
];

const reviews = [
  { name: 'Camila R., 34', place: 'Campinas', text: 'Passei a vida achando que era só esforçada. Fiz com medo de tirar 90. Tirei 127 — percentil 96. Chorei.' },
  { name: 'Diogo M., 29', place: 'Porto', text: 'Me chamaram de burro na escola, larguei os estudos. 15 anos depois o QIMind me deu 118. Voltei a estudar no mês seguinte.' },
  { name: 'Aline F., 41', place: 'Salvador', text: 'Fiz pra provar que não valia a pena. Deu 131, "muito superior". Estava me subestimando havia 20 anos.' },
];

const faqs = [
  { q: 'É pagamento único? Vão me cobrar de novo?', a: `Você desbloqueia seu resultado por ${PRICE.trial}. Depois, o acesso à plataforma completa (todos os testes e o treino cerebral) é ${PRICE.renewal}/${PRICE.period}. Você vê esse valor antes de pagar e cancela quando quiser, em 1 clique. Nada aparece na sua fatura sem você saber.` },
  { q: 'O teste tem base científica?', a: 'Sim. Ele usa matrizes lógicas no estilo Raven, o mesmo tipo de questão usado em avaliações de raciocínio no mundo todo. Você recebe sua pontuação e seu percentil, não um laudo clínico (isso só um profissional faz pessoalmente).' },
  { q: 'Quanto tempo leva?', a: 'Cerca de 15 a 20 minutos. Dá pra fazer agora, no celular ou no computador, sem pressa.' },
  { q: 'E se eu tirar uma pontuação baixa?', a: 'Você vê o número real, sem maquiagem. Mas a maioria das pessoas que temia ser "mediana" descobre o contrário: que se subestimava. Seja qual for o resultado, ele é seu e é honesto.' },
  { q: 'Como cancelo?', a: 'Em menos de um minuto, direto nas configurações da conta. Você mantém o acesso até o fim do período já pago.' },
];

export default function Landing({ onStartIQ, onStartPersonality, onStartCareer, onPractice }: LandingProps) {
  const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToTests = () => document.getElementById('tests')?.scrollIntoView({ behavior: 'smooth' });
  const startByType = (type: 'iq' | 'personality' | 'career') =>
    type === 'iq' ? onStartIQ() : type === 'personality' ? onStartPersonality() : onStartCareer();

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Header */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="h-8" />
          </div>
          <div className="flex gap-2.5">
            <button onClick={onStartIQ} className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 hover:border-brand transition-colors">
              Entrar
            </button>
            <button onClick={scrollToTests} className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand text-white shadow-[0_8px_20px_-8px_rgba(18,160,140,0.6)] hover:bg-brand-dark transition-colors">
              Iniciar teste
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F2F7FD] to-white">
        <div className="container mx-auto px-4 py-14 md:py-[72px] grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-[clamp(30px,4.4vw,50px)] font-extrabold leading-[1.05] tracking-tight text-balance">
              Você é mais inteligente do que <span className="text-[#2F6BEB]">te fizeram acreditar.</span>
            </h1>
            <p className="text-[17px] text-slate-500 mt-4 max-w-[42ch]">
              Alguém, em algum momento, te fez achar que você era "esforçado, não inteligente". Estava errado — e a maioria carrega esse erro a vida inteira. Em ~15 minutos você vê seu número real, calculado com honestidade. Não um "parabéns" genérico. Resultado na hora, por {PRICE.trial}.
            </p>
            <p className="text-[13px] text-slate-400 mt-2">{PROOF.testsTaken} brasileiros já viram o próprio número.</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <button
                onClick={onStartIQ}
                className="bg-brand text-white px-6 py-3.5 rounded-[10px] font-semibold shadow-[0_8px_20px_-8px_rgba(18,160,140,0.6)] hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
              >
                Ver meu número real <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={scrollToPricing}
                className="px-6 py-3.5 rounded-[10px] font-semibold border border-slate-200 hover:border-brand transition-colors"
              >
                Como funciona
              </button>
            </div>
          </div>
          <BellCurve />
        </div>
      </section>

      {/* Proof strip — prova própria e verificável (não logo emprestado) */}
      <section className="py-6 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-x-[clamp(14px,3.5vw,40px)] gap-y-2 flex-wrap text-[13px] font-semibold text-slate-500">
            <span>Modelo psicométrico IRT (Rasch)</span>
            <span className="text-slate-300">•</span>
            <span>Escala padrão · média 100 · desvio 15</span>
            <span className="text-slate-300">•</span>
            <span><span className="text-ink">{PROOF.testsTaken}</span> testes calculados</span>
            <span className="text-slate-300">•</span>
            <span><span className="text-ink">{PROOF.rating}/{PROOF.ratingOutOf}</span> em {PROOF.reviews} avaliações</span>
          </div>
        </div>
      </section>

      {/* Urgência honesta + villain concreto */}
      <section className="py-14 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-[clamp(22px,3vw,30px)] font-extrabold text-balance mb-3">
            Cada ano sem saber é mais um ano se subestimando.
          </h2>
          <p className="text-slate-500 text-[15px]">
            A pessoa que te chamou de "esforçado, não inteligente" — o professor, o chefe, alguém da sua família — errou. Mas enquanto você não vê o número, a dúvida dela continua sendo a sua. <span className="text-ink font-semibold">{PROOF.testsTaken} pessoas já encerraram essa pergunta.</span> Leva 15 minutos e custa {PRICE.trial}.
          </p>
          <button
            onClick={onStartIQ}
            className="mt-6 bg-brand text-white px-6 py-3.5 rounded-[10px] font-semibold shadow-[0_8px_20px_-8px_rgba(18,160,140,0.6)] hover:bg-brand-dark transition-colors inline-flex items-center gap-2"
          >
            Ver meu número real <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Unique mechanism — the "reason why" the number is believable */}
      <section className="py-16 md:py-[72px] border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <div className="inline-block text-xs font-bold tracking-widest text-brand uppercase mb-3">Por que o número do {BRAND} é diferente</div>
            <h2 className="text-[clamp(24px,3vw,33px)] font-extrabold text-balance">
              A maioria dos testes só conta acertos. Por isso te dão um número mais baixo do que você merece.
            </h2>
            <p className="text-slate-500 max-w-[56ch] mx-auto mt-3">
              Acertar 30 questões fáceis não é a mesma coisa que acertar 10 difíceis — mas o teste comum trata igual. O {BRAND} faz diferente:
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: '01', title: 'Ponderação por dificuldade (modelo IRT/Rasch)', desc: 'Usamos o mesmo modelo estatístico — Teoria de Resposta ao Item — que universidades usam pra calibrar provas oficiais. As fáceis ~90% acertam, as difíceis ~20%. Seu número vem do padrão das respostas, não da quantidade. Por isso é comparável e estável — um teste grátis que só conta acertos nunca vai ser.' },
              { n: '02', title: '5 tipos de raciocínio cruzados', desc: 'Matrizes, séries, analogias, lógica verbal e o "diferentão". O número sai do cruzamento — não de um talento só.' },
              { n: '03', title: 'Perfil, não só um dígito', desc: 'Você vê onde seu cérebro é forte de verdade e onde tropeça. É um mapa, não uma nota seca.' },
            ].map((m) => (
              <div key={m.n} className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="text-2xl font-extrabold text-brand/30 mb-2">{m.n}</div>
                <h3 className="font-bold text-lg mb-2">{m.title}</h3>
                <p className="text-[13.5px] text-slate-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available tests */}
      <section id="tests" className="py-16 md:py-[72px]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,33px)] font-extrabold mb-2">Três testes. Uma resposta sobre você.</h2>
            <p className="text-slate-500 max-w-[52ch] mx-auto">Comece pelo QI. É o que mais gente faz, e o que mais surpreende.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {tests.map((t) => (
              <div key={t.title} className="relative bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(18,32,59,0.35)] transition-all">
                {t.popular && (
                  <span className="absolute top-3.5 right-3.5 bg-[#E7F1FF] text-[#2F6BEB] text-[11px] font-bold px-2.5 py-1 rounded-full">Mais escolhido</span>
                )}
                <div className="w-11 h-11 rounded-xl grid place-items-center bg-brand-light">
                  <t.icon className="w-5 h-5 text-brand" />
                </div>
                <h3 className="font-bold text-lg">{t.title}</h3>
                <div className="text-[13px] text-slate-500 font-medium">{t.time} · {t.q}</div>
                <p className="text-[13.5px] text-slate-500 leading-relaxed">{t.desc}</p>
                <button
                  onClick={() => startByType(t.type)}
                  className="mt-auto w-full py-3 rounded-[10px] font-semibold bg-brand text-white hover:bg-brand-dark transition-colors flex items-center justify-center gap-1.5"
                >
                  {t.cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F2F7FD] py-16 md:py-[72px]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,33px)] font-extrabold mb-2">Como funciona</h2>
            <p className="text-slate-500 max-w-[52ch] mx-auto">Três passos até o número que você sempre quis saber.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center font-bold mx-auto mb-4">{i + 1}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 md:py-[72px]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,33px)] font-extrabold mb-2 text-balance">Gente normal que descobriu não ter nada de mediano.</h2>
            <p className="text-slate-500 max-w-[52ch] mx-auto">{PROOF.testsTaken} pessoas já pararam de adivinhar e foram ver o número.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-6">
            {reviews.map((r) => (
              <div key={r.name} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="inline-flex items-center gap-0.5 bg-[#00B67A] text-white px-2 py-1 rounded mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-white text-white" />
                  ))}
                </div>
                <p className="text-[14.5px] mb-3">"{r.text}"</p>
                <p className="text-[12.5px] text-slate-500 font-semibold">{r.name} · {r.place}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-[13.5px]">
            Avaliado com <b className="text-ink">{PROOF.rating} / {PROOF.ratingOutOf}</b> · <span className="text-[#00B67A] font-bold">★ Trustpilot</span> · {PROOF.reviews} avaliações
          </p>
        </div>
      </section>

      {/* Skills / content platform (the subscription value) */}
      <section className="bg-[#F2F7FD] py-16 md:py-[72px]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,33px)] font-extrabold mb-2">Uma plataforma pra treinar o cérebro, não só um número.</h2>
            <p className="text-slate-500 max-w-[52ch] mx-auto">O acesso completo abre uma biblioteca inteira de treino cognitivo.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {skills.map((sk) => (
              <div key={sk.title} className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="w-11 h-11 rounded-xl grid place-items-center bg-brand-light mb-4">
                  <sk.icon className="w-5 h-5 text-brand" />
                </div>
                <h3 className="font-bold text-lg mb-3">{sk.title}</h3>
                <ul className="space-y-2">
                  {sk.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm text-slate-500">
                      <Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 md:py-[72px]">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,33px)] font-extrabold text-balance">Não é um "parabéns" genérico. É o seu resultado.</h2>
          </div>
          <ul className="space-y-3">
            {included.map((it) => (
              <li key={it} className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4">
                <Check className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                <span className="text-[15px]">{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[#F2F7FD] py-16 md:py-[72px]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,33px)] font-extrabold mb-2">Desbloqueie seu resultado por {PRICE.trial}.</h2>
            <p className="text-slate-500 max-w-[52ch] mx-auto">Acesso completo aos três testes e à plataforma de treino cerebral.</p>
          </div>
          <div className="max-w-sm mx-auto bg-white rounded-[18px] shadow-[0_24px_60px_-34px_rgba(18,32,59,0.4)] border border-slate-200 p-7">
            <div className="text-xs font-bold tracking-widest text-brand uppercase mb-2.5">Diagnóstico Cognitivo Completo QIMind</div>
            {/* Value stack — âncora no valor de entrega, não no próprio preço */}
            <ul className="space-y-2 mb-4">
              {[
                { t: 'Seu Laudo de QI: número exato, classificação e percentil', v: 'R$149' },
                { t: 'Mapa dos 5 tipos de raciocínio (onde seu cérebro é forte)', v: 'R$99' },
                { t: 'Teste de Personalidade completo', v: 'R$89' },
                { t: 'Teste Vocacional completo', v: 'R$89' },
                { t: 'Certificado oficial em PDF (pra mostrar pra quem duvidou)', v: 'R$49' },
                { t: 'Plataforma de treino: +150 puzzles + cursos', v: 'R$197' },
              ].map((it) => (
                <li key={it.t} className="flex items-start justify-between gap-3 text-[13.5px]">
                  <span className="flex items-start gap-2"><Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />{it.t}</span>
                  <span className="text-slate-400 line-through flex-shrink-0">{it.v}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline gap-2 border-t border-slate-100 pt-4 mb-1">
              <span className="text-slate-400 text-sm">Valor total</span>
              <span className="text-slate-400 line-through">R$672</span>
              <span className="bg-brand-light text-brand text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto">hoje</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-5xl font-extrabold">{PRICE.trial}</span>
              <span className="text-slate-500 text-sm">· desbloqueia tudo + 7 dias</span>
            </div>
            <p className="text-[12.5px] text-slate-500 mb-4">
              <strong className="text-ink">Por que só {PRICE.trial}?</strong> Porque a gente sabe que, quando você vê seu número e começa a treinar, você fica. Cobrar caro na entrada só afastaria quem mais precisa ver isso. Depois renova por {PRICE.renewal}/{PRICE.period} — você vê antes de pagar e <strong className="text-ink">cancela em 1 clique</strong>.
            </p>
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-5 text-xs text-emerald-900">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span><strong>Garantia "número honesto" — 7 dias.</strong> Se achar que não é mais revelador que qualquer teste grátis, devolvemos seus {PRICE.trial} — e você fica com o resultado mesmo assim. O risco é todo nosso.</span>
            </div>
            <button
              onClick={onStartIQ}
              className="w-full bg-brand text-white py-3.5 rounded-[10px] font-semibold hover:bg-brand-dark transition-colors"
            >
              Quero ver o meu número — {PRICE.trial}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-[72px]">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-[clamp(24px,3vw,33px)] font-extrabold text-center mb-10">Perguntas frequentes</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="border border-slate-200 rounded-xl p-4 group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center gap-4">
                  {f.q}
                  <span className="text-brand group-open:rotate-45 transition-transform text-xl flex-shrink-0">+</span>
                </summary>
                <p className="text-slate-500 text-sm mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10">
        <div className="container mx-auto px-4 text-center text-sm text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Logo className="h-7" />
          </div>
          <button onClick={onPractice} className="hover:text-slate-600 underline">
            Modo treino (praticar por nível)
          </button>
          <p className="mt-4">Teste para fins recreativos e educativos. © 2026 {BRAND}. Todos os direitos reservados.</p>
        </div>
      </footer>
      <LiveActivity />
    </div>
  );
}
