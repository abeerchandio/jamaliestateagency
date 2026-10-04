import React, { useState } from 'react';
import { Calculator, ArrowRight, RefreshCw, Layers, DollarSign } from 'lucide-react';

interface PropertyCalculatorProps {
  onApplyCalculation: (details: string) => void;
}

export const PropertyCalculator: React.FC<PropertyCalculatorProps> = ({ onApplyCalculation }) => {
  const [calcMode, setCalcMode] = useState<'converter' | 'installment'>('converter');

  // Land converter state
  const [inputValue, setInputValue] = useState<number>(200); // 200 Sq. Yards
  const [fromUnit, setFromUnit] = useState<string>('sq_yards');

  // Installment state
  const [totalPrice, setTotalPrice] = useState<number>(8500000); // PKR 85 Lacs
  const [downPaymentPct, setDownPaymentPct] = useState<number>(25); // 25%
  const [months, setMonths] = useState<number>(24); // 24 months

  // Conversion calculations
  // Base unit: Square Feet
  // 1 Sq Yard = 9 Sq Ft
  // 1 Marla (Sindh standard urban) = 225 Sq Ft (= 25 Sq Yards)
  // 1 Kanal = 4500 Sq Ft (= 500 Sq Yards = 20 Marlas)
  // 1 Acre = 43,560 Sq Ft (= 4,840 Sq Yards = 9.68 Kanals)
  // 1 Ghunta / Jareeb (Sindh traditional) = 1/40 Acre = ~1,089 Sq Ft = 121 Sq Yards

  const getBaseSqFt = (val: number, unit: string): number => {
    switch (unit) {
      case 'sq_yards': return val * 9;
      case 'sq_feet': return val;
      case 'marla': return val * 225;
      case 'kanal': return val * 4500;
      case 'acre': return val * 43560;
      case 'ghunta': return val * 1089;
      default: return val * 9;
    }
  };

  const baseSqFt = getBaseSqFt(inputValue, fromUnit);
  const resSqYards = (baseSqFt / 9).toFixed(1);
  const resMarla = (baseSqFt / 225).toFixed(2);
  const resKanal = (baseSqFt / 4500).toFixed(3);
  const resAcre = (baseSqFt / 43560).toFixed(3);
  const resSqFeet = Math.round(baseSqFt).toLocaleString();

  // Installment calculations
  const downPaymentAmount = Math.round((totalPrice * downPaymentPct) / 100);
  const remainingBalance = totalPrice - downPaymentAmount;
  const monthlyInstallment = Math.round(remainingBalance / (months || 1));

  const handleInquireFromCalc = () => {
    let summary = '';
    if (calcMode === 'converter') {
      summary = `Land Measurement Query: ${inputValue} ${fromUnit.replace('_', ' ')} (~${resSqYards} Sq. Yards / ${resMarla} Marla / ${resAcre} Acres). Inquiring about available plots/land matching this size in Nawabshah.`;
    } else {
      summary = `Installment Plan Inquiry: Property Price PKR ${(totalPrice / 100000).toFixed(1)} Lacs, Down Payment PKR ${(downPaymentAmount / 100000).toFixed(1)} Lacs (${downPaymentPct}%), Monthly Installment PKR ${monthlyInstallment.toLocaleString()} over ${months} Months.`;
    }
    onApplyCalculation(summary);
  };

  return (
    <section id="calculator" className="py-20 bg-slate-100 text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
            <Calculator className="w-3.5 h-3.5 text-emerald-700" />
            Nawabshah Property Tools
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 text-balance">
            Sindh Land Area Converter & Installment Estimator
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Convert between Square Yards, Marla, Kanal, and Acres instantly, or plan your flexible plot down payment and monthly installment schedules.
          </p>

          {/* Mode Switcher */}
          <div className="mt-6 inline-flex p-1 bg-slate-200 rounded-xl">
            <button
              onClick={() => setCalcMode('converter')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                calcMode === 'converter'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Land Measurement Converter</span>
            </button>
            <button
              onClick={() => setCalcMode('installment')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                calcMode === 'installment'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Plot Installment Estimator</span>
            </button>
          </div>
        </div>

        {/* Main Box */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          
          {calcMode === 'converter' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Inputs */}
              <div className="md:col-span-6 space-y-5">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Enter Property Dimensions
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Value / Quantity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inputValue}
                    onChange={(e) => setInputValue(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit of Measurement:
                  </label>
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="sq_yards">Square Yards (Gaz / Sq. Yds)</option>
                    <option value="marla">Marla (225 Sq. Ft)</option>
                    <option value="kanal">Kanal (20 Marlas / 500 Sq. Yds)</option>
                    <option value="acre">Acres (4,840 Sq. Yds / 8 Kanals)</option>
                    <option value="sq_feet">Square Feet (Sq. Ft)</option>
                    <option value="ghunta">Ghunta / Jareeb (Sindh Revenue)</option>
                  </select>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                  <span className="font-semibold">Nawabshah Standard:</span> Urban housing societies in Nawabshah primarily trade in 120, 200, 400 & 600 Sq. Yards. Agricultural land is measured in Acres & Jareebs.
                </div>
              </div>

              {/* Conversion Outputs */}
              <div className="md:col-span-6 bg-slate-950 text-white rounded-xl p-6 border border-slate-800 space-y-3.5">
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Calculated Equivalent Sizing
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Square Yards (Gaz):</span>
                    <span className="text-lg font-bold font-mono text-white mt-0.5 block">{resSqYards}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Marla Equivalent:</span>
                    <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">{resMarla}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Kanal Fraction:</span>
                    <span className="text-lg font-bold font-mono text-white mt-0.5 block">{resKanal}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Acres Fraction:</span>
                    <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">{resAcre}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300 flex justify-between">
                  <span>Total Square Feet:</span>
                  <span className="font-mono font-bold text-white">{resSqFeet} Sq. Ft</span>
                </div>

                <button
                  onClick={handleInquireFromCalc}
                  className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Find Available Plots Matching This Size</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Installment Inputs */}
              <div className="md:col-span-6 space-y-5">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Installment Plan Parameters
                </h3>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Total Property Price (PKR):</span>
                    <span className="font-mono text-emerald-700 font-bold">PKR {(totalPrice / 100000).toFixed(1)} Lacs</span>
                  </div>
                  <input
                    type="range"
                    min="1500000"
                    max="50000000"
                    step="500000"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>PKR 15 Lacs (Plot)</span>
                    <span>PKR 5 Crore (Commercial / House)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Initial Down Payment:</span>
                    <span className="font-mono text-slate-900 font-bold">{downPaymentPct}% (PKR {(downPaymentAmount / 100000).toFixed(1)} Lacs)</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>15% Minimum</span>
                    <span>60%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Installment Duration:</span>
                    <span className="font-mono text-slate-900 font-bold">{months} Months ({(months / 12).toFixed(1)} Years)</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    step="6"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>12 Months</span>
                    <span>48 Months</span>
                  </div>
                </div>
              </div>

              {/* Installment Outputs */}
              <div className="md:col-span-6 bg-slate-950 text-white rounded-xl p-6 border border-slate-800 space-y-4">
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Payment Schedule Breakdown
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400">Initial Down Payment</div>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      PKR {(downPaymentAmount / 100000).toFixed(1)} <span className="text-xs font-normal text-slate-400">Lacs</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{downPaymentPct}% Booking Amount</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400">Monthly Installment</div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      PKR {monthlyInstallment.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">For {months} Months</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Remaining Balance:</span>
                    <span className="font-mono text-white">PKR {(remainingBalance / 100000).toFixed(1)} Lacs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transfer/Possession:</span>
                    <span className="text-emerald-400 font-semibold">Upon Final Clearance</span>
                  </div>
                </div>

                <button
                  onClick={handleInquireFromCalc}
                  className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Inquire for Installment Plots in Nawabshah</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
};
