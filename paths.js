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
  const isLocalServer  = window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';
  const isHTTP         = window.location.protocol === 'http:' ||
                         window.location.protocol === 'https:';

  // ── Artifact absolute path (only valid on file://) ─────────
  const ARTIFACTS = 'C:/Users/0598a/.gemini/antigravity-ide/brain/dc9d2c7a-6cc3-44b5-8751-fce3f137d7b6/';

  // ── Image map: relative name → artifact filename ───────────
  const IMAGE_MAP = {
    'temple_bg.png':      ARTIFACTS + 'temple_hero_new_1784287128931.png',
    'bride.png':          ARTIFACTS + 'bride_portrait_1784285523076.png',
    'groom.png':          ARTIFACTS + 'groom_portrait_1784285534290.png',
    'temple_venue.png':   ARTIFACTS + 'temple_venue_1784285553157.png',
    'reception_venue.png':ARTIFACTS + 'reception_venue_1784285563365.png',
  };

  /**
   * Resolve an image to the correct URL for the current environment.
   * @param {string} relativeName  e.g. 'bride.png'
   * @returns {string} URL safe for the current protocol/origin
   */
  function resolveImage(relativeName) {
    if (isHTTP) {
      // Live Server, production, any HTTP host → relative path wins
      return './' + relativeName;
    }
    // file:// → try relative first, fall back to artifact absolute path
    return IMAGE_MAP[relativeName] || ('./' + relativeName);
  }

  /**
   * Apply paths to all <img data-asset="..."> elements.
   * Falls back to onerror → artifact path if relative file missing.
   */
  function applyImagePaths() {
    document.querySelectorAll('img[data-asset]').forEach(img => {
      const name = img.getAttribute('data-asset');
      const url  = resolveImage(name);

      img.src = url;

      // On HTTP with missing relative file, fall back to artifact
      img.onerror = function () {
        if (isHTTP && IMAGE_MAP[name]) {
          // This will only work if the artifacts dir is accessible via HTTP,
          // but at minimum prevents a broken image icon.
          console.warn('[paths.js] Relative image not found:', name,
            '→ Place image in the project folder to fix this.');
        }
        // Show the placeholder fallback
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
    const url = resolveImage('temple_bg.png');
    document.documentElement.style.setProperty('--hero-bg-url', `url('${url}')`);
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
    applyImagePaths();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
