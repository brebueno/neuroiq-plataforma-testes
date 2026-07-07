import { useState } from 'react';
import IQResult from './IQResult';
import DimensionResult from './DimensionResult';
import { getIQClassification, getIQPercentile } from '../utils/iqCalculator';
import { TYPE_LABEL } from '../quiz/build';
import { sampleBigFive, scoreBigFive } from '../data/bigFive';
import { sampleRiasec, scoreRiasec } from '../data/riasec';

// DEV-ONLY preview harness. Open http://localhost:5173/#preview to see the
// three result screens rendered with sample data — no need to run the funnel.
// Not wired into the product flow; safe to delete.

type Tab = 'iq' | 'personality' | 'career';

// deterministic mock answers so the preview is stable across reloads
const mockAnswers = (n: number) => Array.from({ length: n }, (_, i) => ((i * 7) % 5) + 1);

export default function ResultsPreview() {
  const [tab, setTab] = useState<Tab>('iq');

  const bfItems = sampleBigFive(2);
  const bf = scoreBigFive(mockAnswers(bfItems.length), bfItems);

  const rsItems = sampleRiasec(6);
  const rs = scoreRiasec(mockAnswers(rsItems.length), rsItems);

  const iq = 128;
  const byType = Object.entries(TYPE_LABEL).map(([type, label], i) => ({
    type,
    label: label as string,
    correct: 4 + (i % 3),
    total: 7,
  }));

  const noop = () => setTab(tab);

  return (
    <div>
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex gap-1 bg-white border border-slate-200 rounded-full shadow-lg p-1">
        {([['iq', 'QI'], ['personality', 'Personalidade'], ['career', 'Carreira']] as [Tab, string][]).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                tab === key ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ),
        )}
      </div>

      {tab === 'iq' && (
        <IQResult
          iq={iq}
          classification={getIQClassification(iq)}
          percentile={getIQPercentile(iq)}
          score={27}
          total={35}
          bestScore={27}
          bestIQ={iq}
          isNewBestIQ
          isNewHighScore
          byType={byType}
          retryLabel="Refazer teste"
          onBack={noop}
          onRetry={noop}
        />
      )}

      {tab === 'personality' && (
        <DimensionResult
          title="Seu perfil de personalidade"
          headline={bf.headline}
          heroNote={`Seu traço mais forte é ${bf.headline.toLowerCase()}.`}
          subtitle="Modelo Big Five · IPIP-NEO"
          dims={bf.dims}
          onRetake={noop}
          onBack={noop}
        />
      )}

      {tab === 'career' && (
        <DimensionResult
          title="Seu perfil vocacional"
          headline={rs.headline}
          heroNote="Seu código Holland: os 3 interesses que mais te definem."
          subtitle="Modelo RIASEC · O*NET"
          dims={rs.dims}
          careers={rs.careers}
          hexagon
          onRetake={noop}
          onBack={noop}
        />
      )}
    </div>
  );
}
