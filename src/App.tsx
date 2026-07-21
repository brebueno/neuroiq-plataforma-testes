import { useState, useEffect } from 'react';
import { Brain, RotateCcw, Zap } from 'lucide-react';
import Platform from './components/Platform';
import LevelSelection from './components/LevelSelection';
import PuzzleGame from './components/PuzzleGame';
import Funnel from './components/Funnel';
import RevealSequence from './components/RevealSequence';
import EmailGate from './components/EmailGate';
import Landing from './components/Landing';
import PersonalityFlow from './components/PersonalityFlow';
import CareerFlow from './components/CareerFlow';
import QuestionView from './components/QuestionView';
import IQResult from './components/IQResult';
import ResultsPreview from './components/ResultsPreview';
import DevScreens from './components/DevScreens';
import PaymentReturn from './components/PaymentReturn';
import { Question } from './quiz/types';
import { buildQuiz, TYPE_LABEL } from './quiz/build';
import { GameState, Level, QuestionResult } from './types/game';
import { calculateIQFromResults, getIQClassification, getIQPercentile } from './utils/iqCalculator';
import { loadGameData, updateHighScore, updateBestIQ, markLevelCompleted } from './utils/localStorage';
import { trackTestStart } from './lib/tracking';

// A single question in a test = which difficulty level + which puzzle variant to show.
interface PlannedQuestion {
  level: Level;
  puzzleIndex: number;
}

// The full IQ test is now a MIXED, multi-type quiz (see quiz/build). Practice
// mode still uses a single-level matrix plan.
const buildLevelPlan = (level: Level, count = 5): PlannedQuestion[] => {
  const plan: PlannedQuestion[] = [];
  for (let i = 0; i < count; i++) {
    plan.push({ level, puzzleIndex: i });
  }
  return plan;
};

type Mode = 'landing' | 'menu' | 'level' | 'full';

function App() {
  const [mode, setMode] = useState<Mode>('landing');
  const [plan, setPlan] = useState<PlannedQuestion[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: null,
    currentPuzzle: 0,
    score: 0,
    totalPuzzles: 0,
    showResults: false,
    iq: 0,
    timeSpent: [],
  });

  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [storedData, setStoredData] = useState(loadGameData());
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [isNewBestIQ, setIsNewBestIQ] = useState(false);
  const [paid, setPaid] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [email, setEmail] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [activeTest, setActiveTest] = useState<'personality' | 'career' | null>(null);
  const [route, setRoute] = useState(typeof window !== 'undefined' ? window.location.hash : '');

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // DEV preview: open /#preview to see the 3 result screens with sample data.
  // Gated por import.meta.env.DEV, não vai no bundle de produção.
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location.hash === '#preview') {
    return <ResultsPreview />;
  }

  // DEV: /#screens = índice com TODAS as telas (landing, onboarding, reveal, paywall, resultado, plataforma).
  if (import.meta.env.DEV && route === '#screens') {
    return <DevScreens />;
  }

  // Return from Stripe Checkout, PaymentReturn verifies the session server-side
  // (asks Stripe) before granting access, so ?paid=1 alone can't unlock.
  if (typeof window !== 'undefined') {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('session_id') || sp.get('paid') === '1') {
      return <PaymentReturn />;
    }
  }

  const startTest = (newMode: Mode, newPlan: PlannedQuestion[]) => {
    setMode(newMode);
    setPlan(newPlan);
    setQuestions([]);
    setPaid(false);
    setRevealed(false);
    setEmailCaptured(false);
    setGameState({
      currentLevel: newPlan[0]?.level ?? null,
      currentPuzzle: 0,
      score: 0,
      totalPuzzles: newPlan.length,
      showResults: false,
      iq: 0,
      timeSpent: [],
    });
    setQuestionResults([]);
    setIsNewHighScore(false);
    setIsNewBestIQ(false);
  };

  const startFullTest = () => {
    const qs = buildQuiz();
    trackTestStart('teste_qi'); // ViewContent — início do teste de QI (funil pago)
    setMode('full');
    setPlan([]);
    setQuestions(qs);
    setPaid(false);
    setRevealed(false);
    setEmailCaptured(false);
    setGameState({
      currentLevel: (qs[0]?.difficulty ?? 1) as Level,
      currentPuzzle: 0,
      score: 0,
      totalPuzzles: qs.length,
      showResults: false,
      iq: 0,
      timeSpent: [],
    });
    setQuestionResults([]);
    setIsNewHighScore(false);
    setIsNewBestIQ(false);
  };
  const startLevel = (level: Level) => startTest('level', buildLevelPlan(level));

  const nextPuzzle = (result: QuestionResult) => {
    const newScore = result.correct ? gameState.score + 1 : gameState.score;
    const nextPuzzleIndex = gameState.currentPuzzle + 1;
    const newQuestionResults = [...questionResults, result];
    const newTimeSpent = [...gameState.timeSpent, result.timeSpent];

    setQuestionResults(newQuestionResults);

    if (nextPuzzleIndex >= gameState.totalPuzzles) {
      // Weight the IQ by the difficulty of the questions actually answered.
      const overallIQ = calculateIQFromResults(newQuestionResults);

      const newHigh = updateHighScore(newScore);
      const newBestIQ = updateBestIQ(overallIQ);

      if (mode === 'level' && newScore >= Math.ceil(gameState.totalPuzzles * 0.6)) {
        markLevelCompleted(gameState.currentLevel!);
      }

      setIsNewHighScore(newHigh);
      setIsNewBestIQ(newBestIQ);
      setStoredData(loadGameData());

      setGameState((prev) => ({
        ...prev,
        score: newScore,
        iq: overallIQ,
        timeSpent: newTimeSpent,
        showResults: true,
      }));
    } else {
      const nextLevel = (mode === 'full'
        ? questions[nextPuzzleIndex]?.difficulty
        : plan[nextPuzzleIndex]?.level) as Level;
      setGameState((prev) => ({
        ...prev,
        currentLevel: nextLevel,
        score: newScore,
        timeSpent: newTimeSpent,
        currentPuzzle: nextPuzzleIndex,
      }));
    }
  };

  const backToMenu = () => {
    setMode('landing');
    setPlan([]);
    setQuestions([]);
    setPaid(false);
    setRevealed(false);
    setEmailCaptured(false);
    setGameState({
      currentLevel: null,
      currentPuzzle: 0,
      score: 0,
      totalPuzzles: 0,
      showResults: false,
      iq: 0,
      timeSpent: [],
    });
    setQuestionResults([]);
    setIsNewHighScore(false);
    setIsNewBestIQ(false);
    setActiveTest(null);
  };

  // Sai da plataforma pra landing de forma limpa (reseta estado + limpa hash),
  // senão cai numa tela de resultado obsoleta.
  const exitPlatform = () => {
    backToMenu();
    if (typeof window !== 'undefined') window.location.hash = '';
  };

  // Inicia um teste a partir da plataforma (limpa o hash e dispara o fluxo certo).
  const startTestFromPlatform = (t: 'iq' | 'personality' | 'career') => {
    if (typeof window !== 'undefined') window.location.hash = '';
    if (t === 'iq') startFullTest();
    else setActiveTest(t);
  };

  const retry = () => {
    if (mode === 'full') startFullTest();
    else if (gameState.currentLevel) startLevel(gameState.currentLevel);
  };

  // ---------- PLATAFORMA (entregável de LTV pós-compra) ----------
  // Vem depois das funções de estado pra poder resetar corretamente na saída.
  if (route === '#plataforma') {
    return <Platform onExit={exitPlatform} onStartTest={startTestFromPlatform} />;
  }

  // ---------- OTHER TESTS (personality / career) ----------
  if (activeTest === 'personality') {
    return <PersonalityFlow onExit={() => setActiveTest(null)} />;
  }
  if (activeTest === 'career') {
    return <CareerFlow onExit={() => setActiveTest(null)} />;
  }

  // ---------- REVEAL + FUNNEL (full IQ test only, before payment) ----------
  if (gameState.showResults && mode === 'full' && !paid) {
    const accuracyPct = Math.round((gameState.score / gameState.totalPuzzles) * 100);
    const avgSeconds = gameState.timeSpent.length
      ? gameState.timeSpent.reduce((a, b) => a + b, 0) / gameState.timeSpent.length
      : 20;

    // Captura o e-mail antes do reveal (recupera o lead mesmo sem pagar).
    if (!emailCaptured) {
      return (
        <EmailGate
          onSubmit={(e) => { setEmail(e); setEmailCaptured(true); }}
          onBack={backToMenu}
        />
      );
    }

    // The ego reveal plays the tease; the paywall follows.
    if (!revealed) {
      return (
        <RevealSequence
          percentile={getIQPercentile(gameState.iq)}
          accuracyPct={accuracyPct}
          avgSeconds={avgSeconds}
          onUnlock={() => setRevealed(true)}
          onBack={backToMenu}
        />
      );
    }

    return (
      <Funnel
        initialStage="paywall"
        email={email}
        headline="Teste de QI concluído, veja seu resultado!"
        lockedLabel="Seu QI"
        lockedValue={String(gameState.iq)}
        bullets={[
          'Seu QI exato e a classificação',
          'Seu percentil (entre os X% melhores)',
          'Análise por tipo de raciocínio',
          'Certificado em PDF',
        ]}
        onUnlock={() => setPaid(true)}
        onBack={backToMenu}
      />
    );
  }

  // ---------- RESULTS ----------
  if (gameState.showResults) {
    const byType = mode === 'full'
      ? Object.values(
          questionResults.reduce<Record<string, { type: string; label: string; correct: number; total: number }>>((agg, r, i) => {
            const t = questions[i]?.type;
            if (!t) return agg;
            (agg[t] ||= { type: t, label: TYPE_LABEL[t], correct: 0, total: 0 });
            agg[t].total += 1;
            if (r.correct) agg[t].correct += 1;
            return agg;
          }, {}),
        )
      : undefined;

    return (
      <IQResult
        iq={gameState.iq}
        classification={getIQClassification(gameState.iq)}
        percentile={getIQPercentile(gameState.iq)}
        score={gameState.score}
        total={gameState.totalPuzzles}
        bestScore={storedData.highScore}
        bestIQ={storedData.bestIQ}
        isNewBestIQ={isNewBestIQ}
        isNewHighScore={isNewHighScore}
        byType={byType}
        retryLabel={mode === 'full' ? 'Refazer teste' : 'Repetir nível'}
        onBack={backToMenu}
        onRetry={retry}
      />
    );
  }

  // ---------- LANDING ----------
  if (mode === 'landing') {
    return (
      <Landing
        onStartIQ={startFullTest}
        onStartPersonality={() => setActiveTest('personality')}
        onStartCareer={() => setActiveTest('career')}
        onPractice={() => setMode('menu')}
        onEnter={() => { window.location.hash = '#plataforma'; }}
      />
    );
  }

  // ---------- MENU ----------
  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-12 h-12 text-teal-600" />
              <h1 className="text-4xl font-bold text-gray-800">Teste de QI</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              30 questões de raciocínio, padrões, séries, analogias e lógica, em dificuldade crescente. Descubra sua pontuação, classificação e percentil.
            </p>
          </div>

          {/* Primary CTA, the full test */}
          <div className="max-w-md mx-auto mb-10">
            <button
              onClick={startFullTest}
              className="w-full bg-teal-600 text-white py-5 px-6 rounded-2xl hover:bg-teal-700 transition-colors font-semibold text-lg shadow-xl flex items-center justify-center gap-3"
            >
              <Zap className="w-6 h-6" />
              Começar teste completo (30 questões)
            </button>
            <p className="text-center text-gray-500 text-sm mt-3">
              Leva ~15 minutos · sem pressão de tempo · pense com calma
            </p>
          </div>

          {/* Secondary, practice by difficulty */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Ou pratique um nível de dificuldade</h2>
          </div>
          <LevelSelection onSelectLevel={startLevel} />

          <div className="text-center mt-8">
            <button onClick={backToMenu} className="text-gray-500 hover:text-gray-700 text-sm underline">
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- IN-TEST ----------
  const currentQ = mode === 'full' ? questions[gameState.currentPuzzle] : null;
  const currentP = mode !== 'full' ? plan[gameState.currentPuzzle] : null;
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7FD] to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={backToMenu} className="text-gray-600 hover:text-gray-800 transition-colors">
              <RotateCcw className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {mode === 'full' ? 'Teste de QI' : `Nível ${gameState.currentLevel}`}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <span className="text-sm">
              Pergunta {gameState.currentPuzzle + 1}/{gameState.totalPuzzles}
            </span>
            {currentQ && (
              <span className="text-xs font-medium bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full">
                {TYPE_LABEL[currentQ.type]}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar across the whole test */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(gameState.currentPuzzle / gameState.totalPuzzles) * 100}%` }}
            ></div>
          </div>
        </div>

        {mode === 'full' && currentQ ? (
          <QuestionView key={gameState.currentPuzzle} question={currentQ} index={gameState.currentPuzzle} onAnswer={nextPuzzle} />
        ) : currentP ? (
          <PuzzleGame
            key={gameState.currentPuzzle}
            level={currentP.level}
            puzzleIndex={currentP.puzzleIndex}
            onAnswer={nextPuzzle}
          />
        ) : null}
      </div>
    </div>
  );
}

export default App;
