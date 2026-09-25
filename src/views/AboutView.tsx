import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';

export const AboutView: React.FC = () => {
  const { data } = usePortfolio();
  const about = data?.about;
  const settings = data?.settings;

  return (
    <div id="about-view" className="w-full max-w-3xl pb-24">
      <div className="border-b border-neutral-100 pb-6 mb-10">
        <h1 className="text-xl sm:text-2xl font-normal text-neutral-950 tracking-tight">
          About
        </h1>
        {settings?.studioLocation && (
          <p className="text-xs text-neutral-400 font-light mt-1">
            Studio in {settings.studioLocation}
          </p>
        )}
      </div>

      <div className="space-y-12">
        {/* Portrait image if available */}
        {about?.portraitUrl && (
          <div className="max-w-md aspect-4/5 overflow-hidden bg-neutral-100 mb-8">
            <img
              src={about.portraitUrl}
              alt={settings?.artistName || 'Artist Portrait'}
              className="w-full h-full object-cover grayscale contrast-110"
            />
          </div>
        )}

        {/* Biography */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-medium">
            Biography
          </h2>
          <div className="text-sm sm:text-base text-neutral-800 leading-relaxed font-light whitespace-pre-line space-y-4">
            {about?.artistBio ||
              'Oliva Biswas is a contemporary visual artist exploring materiality, spatial silence, and the tactile relationship between organic pigments and structural surfaces.'}
          </div>
        </section>

        {/* Statement */}
        {about?.artistStatement && (
          <section className="space-y-4 pt-6 border-t border-neutral-100">
            <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-medium">
              Artist Statement
            </h2>
            <div className="text-sm sm:text-base text-neutral-800 leading-relaxed font-light whitespace-pre-line space-y-4 italic">
              {about.artistStatement}
            </div>
          </section>
        )}

        {/* Representation & Studio Details */}
        {(about?.representation || settings?.studioLocation) && (
          <section className="pt-6 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {about?.representation && (
              <div>
                <span className="text-neutral-400 block mb-1 uppercase tracking-wider">
                  Gallery Representation
                </span>
                <span className="text-neutral-900 font-medium">{about.representation}</span>
              </div>
            )}
            {settings?.studioLocation && (
              <div>
                <span className="text-neutral-400 block mb-1 uppercase tracking-wider">
                  Studio Location
                </span>
                <span className="text-neutral-900 font-medium">{settings.studioLocation}</span>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
