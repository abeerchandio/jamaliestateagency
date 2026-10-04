import React, { useState } from 'react';
import { recentDealsData, DealProjectItem } from '../data/companyData';
import { ArrowUpRight, CheckCircle, MapPin, Building2, TrendingUp, X } from 'lucide-react';

export const RecentDealsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedDeal, setSelectedDeal] = useState<DealProjectItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Closed Deals' },
    { id: 'residential', label: 'Residential Villas & Plots' },
    { id: 'commercial', label: 'VIP Road Commercial' },
    { id: 'agricultural', label: 'Agricultural Farmland' },
  ];

  const filteredDeals = activeFilter === 'all'
    ? recentDealsData
    : recentDealsData.filter(d => d.category === activeFilter);

  return (
    <section id="deals" className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="max-w-2xl">
            <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1">
              Proven Track Record & Client Success
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
              Recent Notable Deals & Land Transactions
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300">
              Explore recent high-value commercial leases, overseas farmland acquisitions, and society plot transfers safely executed by our licensed team.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-800/80 rounded-lg shrink-0 self-start md:self-auto">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveFilter(c.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeFilter === c.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deals Bento / Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col justify-between group transition-all"
            >
              <div>
                {/* Visual Image container */}
                <div className="relative h-52 overflow-hidden bg-slate-900">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Category & Location Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="px-2 py-1 bg-slate-900/90 text-emerald-400 font-semibold rounded border border-slate-700/60 backdrop-blur-xs">
                      {deal.categoryLabel}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-slate-900/90 text-slate-300 rounded border border-slate-700/60 backdrop-blur-xs">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {deal.location}
                    </span>
                  </div>

                  {/* Impact Highlight Bar */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-slate-950/90 py-1.5 px-2.5 rounded border border-emerald-500/30 backdrop-blur-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{deal.impact}</span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{deal.clientType}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {deal.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {deal.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                    {deal.highlights.slice(0, 2).map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => setSelectedDeal(deal)}
                  className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View Transaction Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Deal Details Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl text-white relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedDeal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md bg-slate-800 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              Verified Property Transaction
            </div>
            
            <h3 className="text-xl font-bold text-white pr-8">
              {selectedDeal.title}
            </h3>

            <div className="mt-4 relative h-64 rounded-lg overflow-hidden border border-slate-800">
              <img
                src={selectedDeal.image}
                alt={selectedDeal.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur-md p-2 rounded text-xs text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Result: {selectedDeal.impact}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400">Parties Involved:</div>
                <div className="font-semibold text-white mt-0.5">{selectedDeal.clientType}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400">Property Sizing:</div>
                <div className="font-semibold text-white mt-0.5">{selectedDeal.scale}</div>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              {selectedDeal.description}
            </p>

            <div className="mt-4">
              <h4 className="text-xs font-bold text-emerald-400 mb-2">Transaction Milestones:</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedDeal.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDeal(null)}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
              >
                Close Transaction Record
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
