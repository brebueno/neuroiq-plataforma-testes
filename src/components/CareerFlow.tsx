import { useState } from 'react';
import LikertTest from './LikertTest';
import Funnel from './Funnel';
import DimensionResult from './DimensionResult';
import { sampleRiasec, scoreRiasec } from '../data/riasec';

interface CareerFlowProps {
  onExit: () => void;
}

type Stage = 'quiz' | 'funnel' | 'result';

export default function CareerFlow({ onExit }: CareerFlowProps) {
  const [stage, setStage] = useState<Stage>('quiz');
  // Fresh, RIASEC-balanced subset per session — no repetition on retake.
  const [items, setItems] = useState(() => sampleRiasec(6));
  const [result, setResult] = useState<ReturnType<typeof scoreRiasec> | null>(null);

  const restart = () => {
    setResult(null);
    setItems(sampleRiasec(6));
    setStage('quiz');
  };

  if (stage === 'quiz') {
    return (
      <LikertTest
        title="Teste Vocacional / Carreira"
        items={items}
        onExit={onExit}
        onComplete={(answers) => {
          setResult(scoreRiasec(answers, items));
          setStage('funnel');
        }}
      />
    );
  }

  if (stage === 'funnel' && result) {
    return (
      <Funnel
        headline="Resultado pronto — descubra sua vocação!"
        lockedLabel="Seu código vocacional"
        lockedValue={result.headline}
        bullets={[
          'Seu código Holland (RIASEC) de 3 letras',
          'Seus 6 interesses profissionais medidos',
          'As carreiras que mais combinam com você',
          'Relatório vocacional em PDF',
        ]}
        onUnlock={() => setStage('result')}
        onBack={onExit}
      />
    );
  }

  if (stage === 'result' && result) {
    return (
      <DimensionResult
        title="Seu Perfil Vocacional"
        headline={`Código: ${result.headline}`}
        subtitle="Modelo RIASEC (Holland Codes)"
        dims={result.dims}
        extra={result.careers}
        onRetake={restart}
        onBack={onExit}
      />
    );
  }

  return null;
}
