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
  actions = null
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6 lg:mb-8">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-gray-100 text-gray-700 text-xs font-semibold shadow-sm w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
          {eyebrow}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${accentClass} flex items-center justify-center shadow-sm`}>
            {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden />}
          </div>
          <div>
            <h2 id={id} className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
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
  );
};

export default SectionHeader;
