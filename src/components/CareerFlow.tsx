import { useState } from 'react';
import LikertTest from './LikertTest';
import Funnel from './Funnel';
import PsychReveal from './PsychReveal';
import DimensionResult from './DimensionResult';
import { sampleRiasec, scoreRiasec } from '../data/riasec';

interface CareerFlowProps {
  onExit: () => void;
}

type Stage = 'quiz' | 'reveal' | 'paywall' | 'result';

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
          setStage('reveal');
        }}
      />
    );
  }

  if (stage === 'reveal' && result) {
    return (
      <PsychReveal
        analyzing={['Mapeando seus 6 interesses', 'Cruzando com o modelo RIASEC', 'Encontrando seu código Holland', 'Selecionando carreiras compatíveis']}
        commitQuestion="Antes de revelar: você sente que está na carreira certa?"
        commitOptions={['Tenho dúvidas', 'Ainda não']}
        teaseHeadline="Seu código vocacional aponta pra caminhos que talvez você nunca considerou."
        teaseSub="Já cruzamos seus 6 interesses com o modelo RIASEC. Falta um clique."
        lockedLabel="Seu código vocacional"
        provocation="Muita gente descobre tarde demais que estava na profissão errada — anos e dinheiro perdidos. Você não precisa ser mais um."
        onUnlock={() => setStage('paywall')}
        onBack={onExit}
      />
    );
  }

  if (stage === 'paywall' && result) {
    return (
      <Funnel
        initialStage="paywall"
        headline="Teste vocacional concluído!"
        lockedLabel="Seu código vocacional"
        lockedValue={result.headline}
        bullets={[
          'Seu código Holland (RIASEC) de 3 letras',
          'Seus 6 interesses profissionais medidos e ranqueados',
          'As carreiras que mais combinam com o seu perfil',
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
        title="Seu perfil vocacional"
        headline={result.headline}
        heroNote="Seu código Holland: os 3 interesses que mais te definem."
        subtitle="Modelo RIASEC · O*NET"
        dims={result.dims}
        careers={result.careers}
        hexagon
        onRetake={restart}
        onBack={onExit}
      />
    );
  }

  return null;
}
