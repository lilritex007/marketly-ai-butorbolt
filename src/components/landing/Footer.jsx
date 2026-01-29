import React from 'react';
import { Home, Camera, Move, ExternalLink, Mail, Phone } from 'lucide-react';

const WEBSHOP_DOMAIN = 'https://www.marketly.hu';

/**
 * Footer – linkek, ügyfélszolgálat, copyright
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-24">
      <div className="container-app py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Navigáció */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Navigáció</h3>
            <ul className="space-y-3">
              <li>
                <a href="#mkt-butorbolt-app" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Home className="w-4 h-4" />
                  Főoldal
                </a>
              </li>
              <li>
                <a href="#products-section" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Camera className="w-4 h-4" />
                  Képkereső
                </a>
              </li>
              <li>
                <a href="#products-section" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Move className="w-4 h-4" />
                  Szobatervező
                </a>
              </li>
            </ul>
          </div>

          {/* Webshop */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Webshop</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={WEBSHOP_DOMAIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Marketly.hu
                </a>
              </li>
              <li>
                <a href={`${WEBSHOP_DOMAIN}/adatvedelem`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Adatvédelem
                </a>
              </li>
              <li>
                <a href={`${WEBSHOP_DOMAIN}/aszf`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  ÁSZF
                </a>
              </li>
            </ul>
          </div>

          {/* Ügyfélszolgálat */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Ügyfélszolgálat</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@marketly.hu" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  info@marketly.hu
                </a>
              </li>
              <li>
                <a href="tel:+36123456789" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  +36 1 234 5678
                </a>
              </li>
            </ul>
          </div>

          {/* AI Bútorbolt */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Marketly.AI</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              AI segítségével találd meg az ideális bútort. Képkereső, szobatervező és intelligens asszisztens egy helyen.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
          &copy; {currentYear} Marketly. Minden jog fenntartva.
        </div>
      </div>
    </footer>
  );
};
