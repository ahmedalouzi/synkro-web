/**
 * One shared three.js download for every 3D scene on the page.
 *
 * three.js is ~190 KB gzipped (~760 KB of JavaScript to parse), so it only loads when a scene will
 * actually run: not on weak devices (html.lowfx, set before first paint in layout.tsx) and not with
 * prefers-reduced-motion. Those viewers get the static posters instead. When it does load, the
 * download starts as soon as this module is evaluated (in parallel with hydration), not when a
 * component mounts.
 */

/** Whether the 3D scenes should run on this device. `?poster=...` (poster capture) always runs them. */
export function threeAllowed() {
  if (typeof window === 'undefined') return false;
  if (/[?&]poster=/.test(window.location.search)) return true;
  if (document.documentElement.classList.contains('lowfx')) return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let pending: Promise<[typeof import('three'), typeof import('three/examples/jsm/environments/RoomEnvironment.js')]> | null = null;

/** Starts (once) and returns the three.js download. Call only after threeAllowed(). */
export function loadThree() {
  pending ??= Promise.all([import('three'), import('three/examples/jsm/environments/RoomEnvironment.js')]);
  return pending;
}

if (threeAllowed()) void loadThree();
