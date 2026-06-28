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

      <div className="w-full overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-2 text-left w-[45%]"></th>
              {RATING_OPTIONS.map((opt) => (
                <th key={opt.value} className="py-4 px-0.5 text-center text-[10px] uppercase tracking-wider font-black text-gray-400">
                  <div className="flex flex-col items-center justify-center text-center w-full min-w-0">
                    <span className="block w-full text-[9px] md:text-[10px] font-bold uppercase tracking-tight text-gray-400 break-words leading-tight">                      {opt.label}
                    
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {questions.map((q, idx) => (
              <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-5 px-2 text-sm font-medium text-gray-700 leading-snug">
                  {q.text}
                </td>
                {RATING_OPTIONS.map((opt) => {
                  const isSelected = currentRatings[q.id] === opt.value;
                  return (
                    <td key={opt.value} className="py-5 px-0.5 text-center">
                      <div className="flex items-center justify-center w-full">
                        <button
                          type="button"
                          onClick={() => onRate(q.id, opt.value)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer flex-shrink-0 ${
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
                      </div>
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