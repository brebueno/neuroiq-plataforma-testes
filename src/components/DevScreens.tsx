import { useState, useEffect } from 'react';
import EmailGate from './EmailGate';
import RevealSequence from './RevealSequence';
import Funnel from './Funnel';
import IQResult from './IQResult';
import Landing from './Landing';
import Platform from './Platform';
import { getIQClassification, getIQPercentile } from '../utils/iqCalculator';
import { TYPE_LABEL } from '../quiz/build';
import { saveTestProfile } from '../utils/profile';

// DEV-ONLY: harness que lista TODAS as telas do produto com dados de exemplo.
// Abra http://localhost:5173/#screens. Não é usado no fluxo real; pode apagar.

type Screen = 'landing' | 'email' | 'reveal' | 'paywall' | 'result' | 'platform';

const TABS: [Screen, string][] = [
  ['landing', 'Landing'],
  ['email', 'Onboarding (e-mail)'],
  ['reveal', 'Revelação'],
  ['paywall', 'Paywall'],
  ['result', 'Resultado QI'],
  ['platform', 'Plataforma + plano'],
];

const noop = () => {};
const IQ = 128;

export default function DevScreens() {
  const [screen, setScreen] = useState<Screen>('landing');

  // Semeia um perfil de teste pra plataforma mostrar o plano personalizado.
  useEffect(() => {
    saveTestProfile({
      iq: IQ,
      percentile: getIQPercentile(IQ),
      classification: getIQClassification(IQ),
      byType: [
        { type: 'matrix', label: 'Raciocínio abstrato', pct: 92 },
        { type: 'series', label: 'Raciocínio sequencial', pct: 80 },
        { type: 'analogy', label: 'Analogia figural', pct: 70 },
        { type: 'verbal-oddone', label: 'Discriminação verbal', pct: 45 },
      ],
    });
  }, []);

  const byType = Object.entries(TYPE_LABEL).map(([type, label], i) => ({
    type, label: label as string, correct: 4 + (i % 3), total: 7,
  }));

  return (
    <div>
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] flex flex-wrap justify-center gap-1 bg-white border border-slate-200 rounded-full shadow-lg p-1 max-w-[95vw]">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setScreen(key)}
            className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${screen === key ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {screen === 'landing' && <Landing onStartIQ={noop} onStartPersonality={noop} onStartCareer={noop} onPractice={noop} />}
      {screen === 'email' && <EmailGate onSubmit={noop} onBack={noop} />}
      {screen === 'reveal' && <RevealSequence percentile={96} accuracyPct={77} avgSeconds={18} onUnlock={noop} onBack={noop} />}
      {screen === 'paywall' && (
        <Funnel
          initialStage="paywall"
          email="exemplo@qimind.app"
          headline="Teste de QI concluído, veja seu resultado!"
          lockedLabel="Seu QI"
          lockedValue={String(IQ)}
          bullets={['Seu QI exato e a classificação', 'Seu percentil (entre os X% melhores)', 'Análise por tipo de raciocínio', 'Certificado em PDF']}
          onUnlock={noop}
          onBack={noop}
        />
      )}
      {screen === 'result' && (
        <IQResult iq={IQ} classification={getIQClassification(IQ)} percentile={getIQPercentile(IQ)} score={27} total={35} bestScore={27} bestIQ={IQ} isNewBestIQ isNewHighScore byType={byType} retryLabel="Refazer teste" onBack={noop} onRetry={noop} />
      )}
      {screen === 'platform' && <Platform onExit={noop} />}
    </div>
  );
}
