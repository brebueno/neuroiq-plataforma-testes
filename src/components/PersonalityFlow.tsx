import { useState } from 'react';
import LikertTest from './LikertTest';
import Funnel from './Funnel';
import DimensionResult from './DimensionResult';
import { sampleBigFive, scoreBigFive } from '../data/bigFive';

interface PersonalityFlowProps {
  onExit: () => void;
}

type Stage = 'quiz' | 'funnel' | 'result';

export default function PersonalityFlow({ onExit }: PersonalityFlowProps) {
  const [stage, setStage] = useState<Stage>('quiz');
  // Sample a fresh, facet-balanced subset for THIS session — retaking never
  // shows the same set of questions. Scored against the exact items answered.
  const [items, setItems] = useState(() => sampleBigFive(2));
  const [result, setResult] = useState<ReturnType<typeof scoreBigFive> | null>(null);

  const restart = () => {
    setResult(null);
    setItems(sampleBigFive(2));
    setStage('quiz');
  };

  if (stage === 'quiz') {
    return (
      <LikertTest
        title="Teste de Personalidade"
        items={items}
        onExit={onExit}
        onComplete={(answers) => {
          setResult(scoreBigFive(answers, items));
          setStage('funnel');
        }}
      />
    );
  }

  if (stage === 'funnel' && result) {
    return (
      <Funnel
        headline="Perfil pronto — descubra sua personalidade!"
        lockedLabel="Traço dominante"
        lockedValue={result.headline}
        bullets={[
          'Seu perfil completo nas 5 dimensões',
          'Traço dominante e o que ele significa',
          'Seus pontos fortes e pontos de atenção',
          'Relatório detalhado em PDF',
        ]}
        onUnlock={() => setStage('result')}
        onBack={onExit}
      />
    );
  }

  if (stage === 'result' && result) {
    return (
      <DimensionResult
        title="Seu perfil de personalidade"
        headline={result.headline}
        heroNote={`Seu traço mais forte é ${result.headline.toLowerCase()}.`}
        subtitle="Modelo Big Five · IPIP-NEO"
        dims={result.dims}
        onRetake={restart}
        onBack={onExit}
      />
    );
  }

  return null;
}
