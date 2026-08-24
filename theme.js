(() => {
  const KEY = 'kincore-theme';
  const ORDER = ['system', 'light', 'dark'];
  const LABELS = {
    system: 'System',
    light: 'Light Mode',
    dark: 'Dark Mode',
  };
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const storedPref = () => {
    const value = localStorage.getItem(KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
    return 'system';
  };

  const resolved = (pref) => {
    if (pref === 'light' || pref === 'dark') return pref;
    return media.matches ? 'dark' : 'light';
  };

  const apply = () => {
    const pref = storedPref();
    const theme = resolved(pref);
    root.setAttribute('data-theme-pref', pref);
    root.setAttribute('data-theme', theme);
    return { pref, theme };
  };

  apply();

  const onSystemChange = () => {
    if (storedPref() === 'system') apply();
  };
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', onSystemChange);
  } else if (typeof media.addListener === 'function') {
    media.addListener(onSystemChange);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;

    const sync = () => {
      const { pref, theme } = apply();
      btn.textContent = LABELS[pref];
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        pref === 'system'
          ? `Theme: System (currently ${theme})`
          : `Theme: ${LABELS[pref]}`
      );
      btn.title =
        pref === 'system'
          ? 'Follows your device setting. Click to switch Light or Dark.'
          : 'Click to cycle System, Light, and Dark.';
    };

    sync();
    btn.addEventListener('click', () => {
      const current = storedPref();
      const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
      localStorage.setItem(KEY, next);
      sync();
    });
  });
})();
