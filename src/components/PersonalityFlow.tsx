import { useState } from 'react';
import LikertTest from './LikertTest';
import Funnel from './Funnel';
import DimensionResult from './DimensionResult';
import { bigFiveItems, scoreBigFive } from '../data/bigFive';

interface PersonalityFlowProps {
  onExit: () => void;
}

type Stage = 'quiz' | 'funnel' | 'result';

export default function PersonalityFlow({ onExit }: PersonalityFlowProps) {
  const [stage, setStage] = useState<Stage>('quiz');
  const [result, setResult] = useState<ReturnType<typeof scoreBigFive> | null>(null);

  const restart = () => {
    setResult(null);
    setStage('quiz');
  };

  if (stage === 'quiz') {
    return (
      <LikertTest
        title="Teste de Personalidade"
        items={bigFiveItems}
        onExit={onExit}
        onComplete={(answers) => {
          setResult(scoreBigFive(answers));
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
        title="Seu Perfil de Personalidade"
        headline={`Traço dominante: ${result.headline}`}
        subtitle="Modelo Big Five (Cinco Grandes Fatores)"
        dims={result.dims}
        onRetake={restart}
        onBack={onExit}
      />
    );
  }

  return null;
}
