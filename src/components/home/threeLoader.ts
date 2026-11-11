/**
 * One shared three.js download for every 3D scene on the page. It starts as soon as this module
 * is evaluated in the browser (in parallel with hydration), not when a component mounts.
 */
export const loadThree =
  typeof window === 'undefined'
    ? null
    : Promise.all([import('three'), import('three/examples/jsm/environments/RoomEnvironment.js')]);
