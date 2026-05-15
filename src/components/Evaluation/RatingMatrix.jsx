import React from 'react';
import { RATING_OPTIONS } from '../../pages/SelfEvaluation/constants/evaluationData';

export const RatingMatrix = ({ title, questions, currentRatings, onRate }) => {
  return (
    <div className="mb-10 bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
      <div className="mb-6">
        <h3 className="font-bold text-lg leading-snug text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-500 text-sm italic">
          Evalúe las siguientes afirmaciones <span className="text-red-500 font-bold">*</span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-4 text-left w-1/2"></th>
              {RATING_OPTIONS.map((opt) => (
                <th key={opt.value} className="py-4 px-2 text-center text-[10px] uppercase tracking-wider font-bold text-gray-400">
                  {opt.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {questions.map((q, idx) => (
              <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-5 px-4 text-sm font-medium text-gray-700 leading-snug">
                  {q.text}
                </td>
                {RATING_OPTIONS.map((opt) => {
                  const isSelected = currentRatings[q.id] === opt.value;
                  return (
                    <td key={opt.value} className="py-5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => onRate(q.id, opt.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                          isSelected 
                            ? 'bg-[#d22864] border-[#d22864] shadow-md shadow-[#d22864]/20' 
                            : 'bg-gray-100 border-transparent hover:border-[#d22864]/30'
                        }`}
                        aria-label={`Rate ${opt.label} for ${q.text}`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-300"></div>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
