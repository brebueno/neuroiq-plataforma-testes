import { useState } from 'react';
import LikertTest from './LikertTest';
import Funnel from './Funnel';
import PsychReveal from './PsychReveal';
import EmailGate from './EmailGate';
import DimensionResult from './DimensionResult';
import { sampleBigFive, scoreBigFive } from '../data/bigFive';

interface PersonalityFlowProps {
  onExit: () => void;
}

type Stage = 'quiz' | 'email' | 'reveal' | 'paywall' | 'result';

export default function PersonalityFlow({ onExit }: PersonalityFlowProps) {
  const [stage, setStage] = useState<Stage>('quiz');
  // Sample a fresh, facet-balanced subset for THIS session, retaking never
  // shows the same set of questions. Scored against the exact items answered.
  const [items, setItems] = useState(() => sampleBigFive(2));
  const [result, setResult] = useState<ReturnType<typeof scoreBigFive> | null>(null);
  const [email, setEmail] = useState('');

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
          setStage('email');
        }}
      />
    );
  }

  if (stage === 'email') {
    return <EmailGate onSubmit={(l) => { setEmail(l.email); setStage('reveal'); }} onBack={onExit} />;
  }

  if (stage === 'reveal' && result) {
    return (
      <PsychReveal
        analyzing={['Cruzando suas 5 dimensões', 'Comparando com milhares de perfis', 'Isolando seu traço dominante', 'Montando pontos fortes e cegos']}
        commitQuestion="Antes de revelar: as pessoas costumam te entender de verdade?"
        commitOptions={['Quase nunca', 'Às vezes']}
        teaseHeadline="Seu traço dominante ficou mais forte que a média."
        teaseSub="Já calculamos seu perfil nas 5 dimensões. Falta um clique."
        lockedLabel="Traço dominante"
        provocation="A maioria vai a vida inteira sem entender por que age como age, e repete os mesmos erros. Você está a um clique de saber."
        onUnlock={() => setStage('paywall')}
        onBack={onExit}
      />
    );
  }

  if (stage === 'paywall' && result) {
    return (
      <Funnel
        initialStage="paywall"
        email={email}
        headline="Perfil de personalidade concluído!"
        lockedLabel="Traço dominante"
        lockedValue={result.headline}
        bullets={[
          'Seu perfil completo nas 5 dimensões (Big Five)',
          'Seu traço dominante e o que ele revela sobre você',
          'Seus pontos fortes, e os pontos cegos que te sabotam',
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
        onGoToPlatform={() => { window.location.hash = '#plataforma'; }}
      />
    );
  }

  return null;
}
