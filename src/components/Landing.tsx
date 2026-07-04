import { Brain, GraduationCap, Gamepad2, Puzzle, Check, Star, ArrowRight, User, Briefcase } from 'lucide-react';

// ORIGINAL landing, modeled on a proven conversion structure but written from
// scratch. Rename the BRAND placeholder and swap copy/testimonials for yours.
const BRAND = 'NeuroIQ'; // ← your brand name here

// Pricing — edit in ONE place (must match Funnel.tsx OFFER).
const PRICE = { trial: 'R$5,00', trialDays: 7, renewal: 'R$179,99', period: 'mês' };

interface LandingProps {
  onStartIQ: () => void;
  onStartPersonality: () => void;
  onStartCareer: () => void;
  onPractice: () => void;
}

// IQ bell-curve for the hero — conveys scientific authority.
function BellCurve() {
  const W = 440;
  const H = 240;
  const padX = 30;
  const baseY = 190;
  const topY = 40;
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
    { mid: 62.5, pct: '0.1%' },
    { mid: 77.5, pct: '2.1%' },
    { mid: 92.5, pct: '13.6%' },
    { mid: 107.5, pct: '34.1%' },
    { mid: 122.5, pct: '13.6%' },
    { mid: 137.5, pct: '2.1%' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto">
      <path d={area} fill="#3b82f6" fillOpacity="0.08" />
      <path d={d} fill="none" stroke="#2563eb" strokeWidth="2.5" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xFor(t)} y1={topY} x2={xFor(t)} y2={baseY} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
          <text x={xFor(t)} y={baseY + 18} textAnchor="middle" fontSize="12" fill="#64748b">
            {t}
          </text>
        </g>
      ))}
      {bands.map((b) => (
        <text key={b.mid} x={xFor(b.mid)} y={topY - 8} textAnchor="middle" fontSize="11" fill="#475569">
          {b.pct}
        </text>
      ))}
    </svg>
  );
}

const steps = [
  { title: 'Faça o teste', desc: 'Ganhe uma visão imparcial da sua mente em ~15 minutos.' },
  { title: 'Receba o relatório', desc: 'Descubra seus pontos fortes e as áreas pra evoluir.' },
  { title: 'Comece a evoluir', desc: 'Treine com cursos e exercícios feitos pra subir seu desempenho.' },
];

const tests = [
  { type: 'iq' as const, icon: Brain, title: 'Teste de QI / Inteligência', time: '~15 min', q: '35 perguntas', cta: 'Iniciar teste de QI' },
  { type: 'personality' as const, icon: User, title: 'Tipo de personalidade', time: '~7 min', q: '30 perguntas', cta: 'Iniciar teste' },
  { type: 'career' as const, icon: Briefcase, title: 'Vocacional / Carreira', time: '~8 min', q: '36 perguntas', cta: 'Iniciar teste' },
];

const skills = [
  {
    icon: GraduationCap,
    title: 'Cursos em vídeo',
    items: ['+20 horas de treino', 'Aulas fáceis de seguir', 'No seu ritmo', 'Acompanhe o progresso'],
  },
  {
    icon: Gamepad2,
    title: 'Jogos de treino cerebral',
    items: ['Exercícios cognitivos variados', 'Dificuldade progressiva', 'Memória, lógica, foco e concentração'],
  },
  {
    icon: Puzzle,
    title: 'Puzzles',
    items: ['+150 desafios de raciocínio', 'Progressão inteligente', 'Padrões, estratégia e análise'],
  },
];

const included = [
  'Sua pontuação de QI com análise detalhada',
  'Perfil cognitivo completo com seus padrões de pensamento',
  'Exercícios cerebrais pra explorar sua capacidade',
  'Testes extras de carreira, relações e desenvolvimento',
  'Desafios de raciocínio avançado',
];

// Placeholder testimonials — replace with your own real reviews.
const reviews = [
  { name: 'Ana C.', place: 'Brasil', text: 'Curto mas desafiador. Gostei muito.' },
  { name: 'Marcos', place: 'Portugal', text: 'Perguntas variadas e inteligentes. Experiência ótima.' },
  { name: 'Júlia', place: 'Brasil', text: 'Fiquei surpresa com o resultado — bateu com o que eu esperava.' },
];

const faqs = [
  {
    q: 'Quanto tempo leva o teste?',
    a: 'Cerca de 15 a 20 minutos. Você pode pensar com calma em cada questão — não há tempo cronometrado contra você.',
  },
  {
    q: 'Como cancelo a assinatura?',
    a: 'É simples e leva menos de um minuto, direto nas configurações da sua conta. Você mantém o acesso até o fim do período já pago.',
  },
  { q: 'Posso refazer o teste?', a: 'Sim! Refaça quando quiser pra acompanhar sua evolução ao longo do tempo.' },
  { q: 'Funciona em vários aparelhos?', a: 'Sim. Celular, tablet e computador — seu progresso sincroniza em todos.' },
];

export default function Landing({ onStartIQ, onStartPersonality, onStartCareer, onPractice }: LandingProps) {
  const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  const startByType = (type: 'iq' | 'personality' | 'career') =>
    type === 'iq' ? onStartIQ() : type === 'personality' ? onStartPersonality() : onStartCareer();

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold">{BRAND}</span>
          </div>
          <button onClick={onStartIQ} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Iniciar teste →
          </button>
        </div>
      </header>

      {/* Hero — text + bell curve */}
      <section className="bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Quer saber o seu <span className="text-blue-600">resultado de QI?</span>
            </h1>
            <p className="text-lg text-gray-600 mt-5 max-w-lg">
              Faça nosso teste de QI e abra caminho para o autoconhecimento e o desenvolvimento da sua mente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={onStartIQ}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Iniciar teste de QI <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={scrollToPricing}
                className="px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                Ver preços
              </button>
            </div>
          </div>
          <BellCurve />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available tests */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">Testes disponíveis</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Cada teste revela uma nova parte de você. Comece pela inteligência — mais testes a caminho.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tests.map((t) => (
              <div key={t.title} className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <t.icon className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t.title}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t.time} · {t.q}
                </p>
                <button
                  onClick={() => startByType(t.type)}
                  className="w-full py-3 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                >
                  {t.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills / courses (the retention engine) */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">Aumente suas habilidades</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Desbloqueie seu potencial com nosso pacote completo de treino cerebral.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {skills.map((sk) => (
              <div key={sk.title} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <sk.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-3">{sk.title}</h3>
                <ul className="space-y-2">
                  {sk.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
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
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-10">O que você recebe</h2>
          <ul className="space-y-4">
            {included.map((it) => (
              <li key={it} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Avaliações</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {reviews.map((r) => (
              <div key={r.name} className="border border-gray-200 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{r.text}"</p>
                <p className="text-sm text-gray-500 font-medium">
                  {r.name} · {r.place}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">Conheça nossos planos</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Escolha o plano que combina com a sua jornada de desenvolvimento.
          </p>
          <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8">
            <div className="text-center mb-1 text-xs font-semibold tracking-widest text-blue-600">
              EXCELÊNCIA MENSAL
            </div>
            <div className="text-center mb-1">
              <span className="text-4xl font-extrabold text-gray-900">{PRICE.trial}</span>
              <span className="text-gray-600"> / {PRICE.trialDays} dias</span>
            </div>
            <p className="text-center text-sm text-gray-500 mb-4">
              Depois {PRICE.renewal}/{PRICE.period} · renova automaticamente · cancele quando quiser
            </p>
            <ul className="space-y-2 mb-6">
              {['Relatório de inteligência personalizado', 'Biblioteca de treino cerebral', 'Cursos com especialistas', 'Avaliação cognitiva completa'].map((it) => (
                <li key={it} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {it}
                </li>
              ))}
            </ul>
            <button
              onClick={onStartIQ}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Começar
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-10">Perguntas frequentes</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="border border-gray-200 rounded-xl p-4 group">
                <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-blue-600 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="text-gray-600 text-sm mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-700">{BRAND}</span>
          </div>
          <button onClick={onPractice} className="hover:text-gray-600 underline">
            Modo treino (praticar por nível)
          </button>
          <p className="mt-4">
            Teste para fins educativos e de entretenimento. © 2026 {BRAND}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
