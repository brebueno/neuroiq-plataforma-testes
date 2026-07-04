# NeuroIQ — Plataforma de Testes

Plataforma de testes psicométricos (QI, Personalidade e Vocacional) com funil de
conversão e paywall. Front-end em React + Vite + TypeScript + Tailwind.

> **NeuroIQ** é um nome placeholder — troque em `src/components/Landing.tsx` e `src/components/Funnel.tsx`.

## Testes incluídos
- **QI / Inteligência** — 35 questões (Raven's Progressive Matrices) geradas por regra (variedade infinita), QI ~55–150 com classificação e percentil.
- **Personalidade** — Big Five (30 itens, base IPIP — domínio público).
- **Vocacional / Carreira** — RIASEC / Holland (36 itens, domínio público).

Todos passam pelo mesmo funil: teste → resultado "borrado" (tease) → paywall → desbloqueio.

## Rodar localmente
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de produção
```

## Stack
React 18 · Vite · TypeScript · Tailwind CSS · lucide-react

## Estrutura
```
src/
├── App.tsx                    # roteamento (landing / testes / funil / resultado)
├── components/
│   ├── Landing.tsx            # landing (hero c/ curva de sino, cards, preços, FAQ)
│   ├── Funnel.tsx             # tease + paywall (genérico, serve os 3 testes)
│   ├── LikertTest.tsx         # questionário de concordância
│   ├── DimensionResult.tsx    # resultado em barras
│   ├── PersonalityFlow.tsx    # fluxo do teste de personalidade
│   ├── CareerFlow.tsx         # fluxo do teste vocacional
│   ├── PuzzleGame.tsx         # teste de QI
│   └── PatternDisplay.tsx     # render SVG dos puzzles
├── utils/
│   ├── puzzleGenerator.ts     # gerador paramétrico de puzzles
│   └── iqCalculator.ts        # cálculo de QI
└── data/
    ├── bigFive.ts             # itens IPIP + scoring
    └── riasec.ts              # itens RIASEC + scoring
```

## Pagamento
O checkout em `Funnel.tsx` é **demonstração**. Para cobrar de verdade, conecte o
**Stripe via back-end** (a chave secreta nunca deve ficar no front-end).

## Licença
Baseado no projeto [rpm-iq-exam](https://github.com/didvc/rpm-iq-exam) (MIT).
Conteúdo dos testes: IPIP e RIASEC markers (domínio público). Veja `LICENSE`.
