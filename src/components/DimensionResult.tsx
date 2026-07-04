import { Trophy, RotateCcw } from 'lucide-react';
import { DimensionScore } from '../data/bigFive';

interface DimensionResultProps {
  title: string;
  headline: string;
  subtitle?: string;
  dims: DimensionScore[];
  extra?: string[];
  onRetake: () => void;
  onBack: () => void;
}

export default function DimensionResult({
  title,
  headline,
  subtitle,
  dims,
  extra,
  onRetake,
  onBack,
}: DimensionResultProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <Trophy className="w-14 h-14 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <div className="text-3xl font-extrabold text-blue-700 mt-2">{headline}</div>
          {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
        </div>

        <div className="space-y-4 mb-6">
          {dims.map((d) => (
            <div key={d.key}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-gray-800">{d.label}</span>
                <span className="text-sm font-semibold text-blue-700">{d.pct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${d.pct}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{d.desc}</p>
            </div>
          ))}
        </div>

        {extra && extra.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800 text-sm mb-2">Carreiras que combinam com você</h3>
            <ul className="space-y-1">
              {extra.map((e, i) => (
                <li key={i} className="text-sm text-gray-700">
                  • {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onBack}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Voltar ao início
          </button>
          <button
            onClick={onRetake}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Refazer teste
          </button>
        </div>
      </div>
    </div>
  );
}
