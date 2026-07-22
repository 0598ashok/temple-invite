/**
 * ══════════════════════════════════════════════════════════════
 * paths.js — Universal Asset Path Resolver
 * ══════════════════════════════════════════════════════════════
 *
 * ROOT CAUSE OF THE BUG:
 * ──────────────────────
 * The project originally used hardcoded absolute Windows paths:
 *   C:/Users/0598a/.gemini/.../image.png
 *
 * WHY IT WORKED ON file:// (Run & Debug / direct open):
 *   The browser resolved "C:/..." as file:///C:/... — a valid
 *   local filesystem URL. Images loaded fine.
 *
 * WHY IT BROKE ON http:// (Live Server):
 *   Live Server serves from http://127.0.0.1:5500
 *   The browser treated "C:/..." as a RELATIVE HTTP URL path:
 *     → http://127.0.0.1:5500/C:/Users/...
 *   That path doesn't exist on the server → HTTP 404 Not Found.
 *   Result: all images/backgrounds fail to load → broken UI.
 *
 * THE FIX — RUNTIME ENVIRONMENT DETECTION:
 * ─────────────────────────────────────────
 * 1. Detect whether we're on file:// or http://
 * 2. On file:// → use the absolute artifact path (dev fallback)
 * 3. On http:// or https:// → use relative paths (./image.png)
 *    which resolve correctly against the server root.
 * 4. Set CSS variable --hero-bg-url so the hero background works.
 * 5. Patch all <img> elements via data-src attributes.
 * ══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── Environment detection ──────────────────────────────────
  const isFileProtocol = window.location.protocol === 'file:';
  const isLocalServer = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  const isHTTP = window.location.protocol === 'http:' ||
    window.location.protocol === 'https:';

  // ── Image resolutions (ordered by priority) ─────────────────
  const IMAGE_RESOLUTIONS = {
    'temple_bg.png': [
      './temple_bg_ultra.png',
      './temple_bg_hd.png',
      './temple_bg_8k.png',
      './temple_bg.png',
      './temple_bg.jpg',
      'https://i.pinimg.com/1200x/ae/a7/6c/aea76c4d4dcf65d2fa1a0d625975d73a.jpg'
    ],
    'couple_bg.png': [
      './couple_bg.png',
      'C:/Users/ADMIN/.gemini/antigravity-ide/brain/69c08ad7-a44f-4a04-9d16-113ae0381560/media__1784301838828.jpg',
      'C:/Users/0598a/.gemini/antigravity-ide/brain/69c08ad7-a44f-4a04-9d16-113ae0381560/media__1784301838828.jpg'
    ],
    'bride.png': [
      './bride.png',
      './bride_ghibli.png',
      'C:/Users/0598a/.gemini/antigravity-ide/brain/dc9d2c7a-6cc3-44b5-8751-fce3f137d7b6/bride_portrait_1784285523076.png'
    ],
    'groom.png': [
      './groom.png',
      './groom_ghibli.png',
      'C:/Users/0598a/.gemini/antigravity-ide/brain/dc9d2c7a-6cc3-44b5-8751-fce3f137d7b6/groom_portrait_1784285534290.png'
    ],
    'bride_ghibli.png': [
      './bride_ghibli.png',
      'C:/Users/ADMIN/.gemini/antigravity-ide/brain/f96ff7a4-dcd8-4210-bb6d-eebecd985957/bride_ghibli_1784350176157.png'
    ],
    'groom_ghibli.png': [
      './groom_ghibli.png',
      'C:/Users/ADMIN/.gemini/antigravity-ide/brain/f96ff7a4-dcd8-4210-bb6d-eebecd985957/groom_ghibli_1784350192670.png'
    ],
    'temple_venue.png': [
      './temple_venue.png',
      'C:/Users/ADMIN/.gemini/antigravity-ide/brain/ccaa9753-80bf-4409-b6eb-3661cd5a8212/temple_venue_1784566751435.png'
    ],
    'reception_venue.png': [
      './reception_venue.png',
      'C:/Users/ADMIN/.gemini/antigravity-ide/brain/ccaa9753-80bf-4409-b6eb-3661cd5a8212/reception_venue_1784566772634.png'
    ]
  };

  /**
   * Resolve an image to the correct URL for the current environment.
   * Runs asynchronously to test file existence on file:// before usage.
   * @param {string} relativeName  e.g. 'bride.png'
   * @param {function} callback    called with the resolved URL
   */
  function resolveImage(relativeName, callback) {
    if (isHTTP) {
      // Live Server, production, any HTTP host → relative path wins
      callback('./' + relativeName);
      return;
    }

    const urls = IMAGE_RESOLUTIONS[relativeName] || ['./' + relativeName];
    let index = 0;

    function tryNext() {
      if (index >= urls.length - 1) {
        // Fallback to the last URL if everything else failed
        callback(urls[urls.length - 1]);
        return;
      }

      const url = urls[index];
      const img = new Image();
      img.onload = () => callback(url);
      img.onerror = () => {
        index++;
        tryNext();
      };
      img.src = url;
    }

    tryNext();
  }

  /**
   * Apply paths to all <img data-asset="..."> elements.
   * Falls back to onerror → artifact path if relative file missing.
   */
  function applyImagePaths() {
    document.querySelectorAll('img[data-asset]').forEach(img => {
      const name = img.getAttribute('data-asset');
      resolveImage(name, (url) => {
        img.src = url;
      });

      // On error, show fallback
      img.onerror = function () {
        const fallback = this.nextElementSibling;
        if (fallback && fallback.classList.contains('portrait-fallback')) {
          this.style.display = 'none';
          fallback.style.display = 'flex';
        }
      };
    });
  }

  /**
   * Inject the hero background URL as a CSS custom property.
   * This patches the CSS rule dynamically so it works on all protocols.
   */
  function applyHeroBg() {
    resolveImage('temple_bg.png', (url) => {
      document.documentElement.style.setProperty('--hero-bg-url', `url('${url}')`);
    });
  }

  /**
   * Inject the couple background URL as a CSS custom property.
   */
  function applyCoupleBg() {
    resolveImage('couple_bg.png', (url) => {
      document.documentElement.style.setProperty('--couple-bg-url', `url('${url}')`);
    });
  }

  /**
   * Log environment info to console for debugging.
   */
  function logEnv() {
    const env = isHTTP
      ? (isLocalServer ? 'HTTP / Live Server (localhost)' : 'HTTP / Production')
      : 'file:// protocol (direct open / Run & Debug)';

    console.info(
      '%c[paths.js] Environment: ' + env,
      'color:#d4af37; font-weight:bold; font-size:12px'
    );
    console.info('[paths.js] Image strategy:', isHTTP ? 'Relative paths (./)' : 'Artifact absolute paths');
  }

  // ── Run on DOMContentLoaded ─────────────────────────────────
  function init() {
    logEnv();
    applyHeroBg();
    applyCoupleBg();
    applyImagePaths();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
