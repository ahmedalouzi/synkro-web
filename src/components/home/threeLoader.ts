/**
 * One shared three.js download for every 3D scene on the page.
 *
 * three.js is ~190 KB gzipped (~760 KB of JavaScript to parse), so it only loads when a scene will
 * actually run: not on weak devices (html.lowfx, set before first paint in layout.tsx), which get the
 * static posters instead. With prefers-reduced-motion the hero still runs, in calm mode
 * (SpaceScene.tsx); the Earth shows its poster (RingedEarth.tsx). When it does load, the download
 * starts as soon as this module is evaluated (in parallel with hydration), not when a component mounts.
 */

/** Whether the 3D scenes may run on this device. `?poster=...` (poster capture) always runs them. */
export function threeAllowed() {
  if (typeof window === 'undefined') return false;
  if (/[?&]poster=/.test(window.location.search)) return true;
  return !document.documentElement.classList.contains('lowfx');
}

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let pending: Promise<[typeof import('three'), typeof import('three/examples/jsm/environments/RoomEnvironment.js')]> | null = null;

/** Starts (once) and returns the three.js download. Call only after threeAllowed(). */
export function loadThree() {
  pending ??= Promise.all([import('three'), import('three/examples/jsm/environments/RoomEnvironment.js')]);
  return pending;
}

if (threeAllowed()) void loadThree();
