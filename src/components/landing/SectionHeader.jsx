import React from 'react';

const SectionHeader = ({
  title,
  id,
  subtitle,
  Icon,
  accentClass = 'from-primary-500 to-secondary-700',
  badge,
  eyebrow,
  helpText,
  meta,
  contextLabel = '',
  actions = null,
  prominent = false,
  className = ''
}) => {
  return (
    <div className={`relative flex flex-col gap-4 mb-6 lg:mb-8 ${prominent ? 'p-4 sm:p-5 rounded-3xl bg-white/70 border border-gray-100 shadow-sm backdrop-blur-sm' : ''} ${className}`}>
      {prominent && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/90 via-white/70 to-transparent pointer-events-none" />
      )}
      <div className={prominent ? 'relative z-10' : ''}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-gray-100 text-gray-700 text-xs font-semibold shadow-sm w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
          {eyebrow}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${accentClass} flex items-center justify-center shadow-sm`}>
            {Icon && <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" aria-hidden />}
          </div>
          <div>
            <h2 id={id} className={`${prominent ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl sm:text-2xl lg:text-3xl'} font-extrabold text-gray-900`}>
              {title}
            </h2>
            {subtitle && <p className={`${prominent ? 'text-base sm:text-lg' : 'text-sm'} text-gray-600`}>{subtitle}</p>}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap">{actions}</div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {badge && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-gray-100 text-gray-700 text-xs font-semibold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            {badge}
          </span>
        )}
        {contextLabel && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-gray-100 text-gray-700 text-xs font-semibold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            {contextLabel}
          </span>
        )}
        {meta && <span className="text-xs text-gray-500">{meta}</span>}
        {helpText && <span className="text-xs text-gray-400">{helpText}</span>}
      </div>
      </div>
    </div>
  );
};

export default SectionHeader;
