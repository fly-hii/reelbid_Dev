'use client';

import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function TranslateWidget() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize the callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,te,hi,ta,ml,kn',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      }
    };

    // Load the script only once
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <>
      <div className={`translate-floating-container ${isOpen ? 'open' : ''}`}>
        <div className="translate-header" onClick={() => setIsOpen(!isOpen)}>
          <Globe size={20} />
          <span>Translate</span>
        </div>
        <div id="google_translate_element"></div>
      </div>
      
      <style jsx global>{`
        .translate-floating-container {
          position: fixed;
          top: 88px;
          right: 24px;
          z-index: 9999;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 48px;
          height: 48px;
          display: flex;
          flex-direction: column;
        }

        .translate-floating-container.open {
          width: auto;
          height: auto;
          min-width: 200px;
        }

        .translate-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px;
          cursor: pointer;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9rem;
          background: var(--bg-card-hover);
          transition: background 0.2s;
        }
        
        .translate-floating-container:not(.open) .translate-header {
          justify-content: center;
          padding: 14px 0;
        }
        
        .translate-floating-container:not(.open) .translate-header span {
          display: none;
        }

        .translate-header:hover {
          background: var(--accent-soft);
          color: var(--accent-text);
        }

        #google_translate_element {
          padding: 12px;
          display: ${isOpen ? 'block' : 'none'};
          border-top: 1px solid var(--border-primary);
        }

        .goog-te-gadget {
          font-family: inherit !important;
          color: transparent !important;
          font-size: 0 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        
        .goog-te-gadget .goog-te-combo {
          color: var(--text-primary) !important;
          background: var(--bg-card) !important;
          border: 1px solid var(--border-primary) !important;
          border-radius: var(--radius-sm) !important;
          padding: 8px 12px !important;
          font-family: inherit !important;
          font-size: 0.9rem !important;
          outline: none !important;
          cursor: pointer;
          width: 100%;
          margin: 0 !important;
        }

        .goog-te-gadget-icon {
          display: none !important;
        }
        
        .goog-te-banner-frame {
          display: none !important;
        }
        
        body {
          top: 0 !important;
        }
        
        #goog-gt-tt {
          display: none !important;
        }
      `}</style>
    </>
  );
}
