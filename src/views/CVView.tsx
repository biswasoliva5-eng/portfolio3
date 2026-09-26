import React, { useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Download, ExternalLink } from 'lucide-react';
import { Exhibition } from '../types';

export const CVView: React.FC = () => {
  const { data } = usePortfolio();
  const cv = data?.cv;
  const about = data?.about;
  const settings = data?.settings;
  const exhibitions = data?.exhibitions || [];

  const rawUrl = cv?.url || '';
  const downloadUrl = rawUrl.startsWith('http') || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')
    ? rawUrl
    : rawUrl ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}` : '';

  // Helpers to parse multiline string or array into string items
  const parseList = (val?: string[] | string): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
    return String(val)
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
  };

  const educationList = useMemo(() => parseList(about?.education), [about?.education]);
  const awardsList = useMemo(() => parseList(about?.awards), [about?.awards]);
  const residenciesList = useMemo(() => parseList(about?.residencies), [about?.residencies]);
  const collectionsList = useMemo(() => parseList(about?.collections), [about?.collections]);
  const pressList = useMemo(() => parseList(about?.press), [about?.press]);

  // Solo Exhibitions from real data
  const soloExhibitions = useMemo(() => {
    return exhibitions
      .filter(e => e.type?.toLowerCase() === 'solo')
      .sort((a, b) => (a.order || 9999) - (b.order || 9999) || (b.year || 0) - (a.year || 0));
  }, [exhibitions]);

  // Group / Biennial Exhibitions from real data
  const groupExhibitions = useMemo(() => {
    return exhibitions
      .filter(e => e.type?.toLowerCase() !== 'solo')
      .sort((a, b) => (a.order || 9999) - (b.order || 9999) || (b.year || 0) - (a.year || 0));
  }, [exhibitions]);

  const hasAnyContent =
    educationList.length > 0 ||
    soloExhibitions.length > 0 ||
    groupExhibitions.length > 0 ||
    awardsList.length > 0 ||
    residenciesList.length > 0 ||
    collectionsList.length > 0 ||
    pressList.length > 0 ||
    Boolean(cv?.url);

  return (
    <div id="cv-view" className="w-full max-w-3xl pb-24">
      {/* Header with Download CV button */}
      <div className="border-b border-neutral-100 pb-6 mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-normal text-neutral-950 tracking-tight">
            Curriculum Vitae
          </h1>
          {settings?.studioLocation && (
            <p className="text-xs text-neutral-400 font-light mt-1">
              Studio: {settings.studioLocation}
            </p>
          )}
        </div>

        {/* Download PDF Button */}
        {downloadUrl && (
          <div>
            <a
              id="download-cv-btn"
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={cv?.filename || 'Artist_CV.pdf'}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-900 underline underline-offset-4 hover:text-neutral-600 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          </div>
        )}
      </div>

      {!hasAnyContent ? (
        <div className="py-20 text-center text-neutral-400 text-xs">
          Curriculum Vitae details will appear here once added in the Admin panel.
        </div>
      ) : (
        /* Structured CV Sections */
        <div className="space-y-16 text-neutral-800">
          {/* Education */}
          {educationList.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
                Education
              </h2>
              <div className="space-y-3">
                {educationList.map((item, idx) => (
                  <div key={idx} className="text-sm font-normal text-neutral-900 leading-relaxed">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Selected Solo Exhibitions */}
          {soloExhibitions.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
                Selected Solo Exhibitions
              </h2>
              <div className="space-y-3">
                {soloExhibitions.map((ex: Exhibition) => (
                  <div
                    key={ex.id}
                    className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm"
                  >
                    <div>
                      <span className="font-medium text-neutral-950">{ex.title}</span>
                      {ex.venue && `, ${ex.venue}`}
                      {ex.location && ` (${ex.location})`}
                      {ex.curator && (
                        <span className="text-xs text-neutral-400 block font-light">
                          Curated by {ex.curator}
                        </span>
                      )}
                    </div>
                    {ex.year && (
                      <span className="text-xs text-neutral-500 font-mono shrink-0">
                        {ex.year}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Selected Group & Biennial Exhibitions */}
          {groupExhibitions.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
                Selected Group & Biennial Exhibitions
              </h2>
              <div className="space-y-3">
                {groupExhibitions.map((ex: Exhibition) => (
                  <div
                    key={ex.id}
                    className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-sm"
                  >
                    <div>
                      <span className="font-medium text-neutral-950">{ex.title}</span>
                      {ex.venue && `, ${ex.venue}`}
                      {ex.location && ` (${ex.location})`}
                      {ex.type && ex.type !== 'Group' && (
                        <span className="text-[11px] text-neutral-400 ml-1.5 uppercase tracking-wider">
                          [{ex.type}]
                        </span>
                      )}
                    </div>
                    {ex.year && (
                      <span className="text-xs text-neutral-500 font-mono shrink-0">
                        {ex.year}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Grants & Awards */}
          {awardsList.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
                Awards, Grants & Fellowships
              </h2>
              <div className="space-y-3 text-sm">
                {awardsList.map((item, idx) => (
                  <div key={idx} className="text-neutral-900 leading-relaxed">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Residencies */}
          {residenciesList.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
                Residencies
              </h2>
              <div className="space-y-3 text-sm">
                {residenciesList.map((item, idx) => (
                  <div key={idx} className="text-neutral-900 leading-relaxed">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Public & Private Collections */}
          {collectionsList.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
                Selected Permanent Collections
              </h2>
              <div className="space-y-3 text-sm">
                {collectionsList.map((item, idx) => (
                  <div key={idx} className="text-neutral-900 leading-relaxed">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Press / Bibliography */}
          {pressList.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.35em] text-neutral-400 font-semibold border-b border-neutral-200 pb-2">
                Selected Bibliography & Press
              </h2>
              <div className="space-y-3 text-sm">
                {pressList.map((item, idx) => (
                  <div key={idx} className="text-neutral-900 leading-relaxed">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Bottom Download Reminder */}
      {downloadUrl && (
        <div className="mt-20 pt-8 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-xs text-neutral-500 font-light">
            Complete archival documentation available upon request.
          </span>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={cv?.filename || 'Artist_CV.pdf'}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-900 hover:text-neutral-500 underline underline-offset-4"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </a>
        </div>
      )}
    </div>
  );
};
