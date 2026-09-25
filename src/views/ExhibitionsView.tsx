import React, { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Exhibition } from '../types';
import { ExternalLink } from 'lucide-react';

export const ExhibitionsView: React.FC = () => {
  const { data } = usePortfolio();
  const exhibitions = data?.exhibitions || [];

  // Group exhibitions by year
  const groupedByYear = useMemo(() => {
    const groups: { [year: string]: Exhibition[] } = {};
    exhibitions.forEach(ex => {
      const y = String(ex.year || 'Selected');
      if (!groups[y]) groups[y] = [];
      groups[y].push(ex);
    });
    return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
  }, [exhibitions]);

  return (
    <div id="exhibitions-view" className="w-full max-w-3xl pb-24">
      <div className="border-b border-neutral-100 pb-6 mb-10">
        <h1 className="text-xl sm:text-2xl font-normal text-neutral-950 tracking-tight">
          Exhibitions
        </h1>
        <p className="text-xs text-neutral-400 font-light mt-1">
          Solo shows, institutional presentations, and select group exhibitions
        </p>
      </div>

      <div className="space-y-12">
        {groupedByYear.map(([year, list]) => (
          <div key={year} className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b border-neutral-100 pb-8 last:border-b-0">
            <div className="md:col-span-3">
              <span className="text-sm font-mono text-neutral-400 font-light sticky top-24">
                {year}
              </span>
            </div>

            <div className="md:col-span-9 space-y-6">
              {list.map(ex => (
                <div key={ex.id} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-medium text-neutral-950">
                      {ex.title}
                    </h3>
                    {ex.type && (
                      <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
                        {ex.type}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-600">
                    {ex.venue}
                    {ex.location && `, ${ex.location}`}
                  </p>

                  {ex.curator && (
                    <p className="text-[11px] text-neutral-400 font-light">
                      Curated by {ex.curator}
                    </p>
                  )}

                  {ex.link && (
                    <a
                      href={ex.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 underline underline-offset-2 pt-1"
                    >
                      <span>Press / Documentation</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
