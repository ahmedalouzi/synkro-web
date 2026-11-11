'use client';

import { useEffect, useRef } from 'react';
import type { Material, Mesh, Texture } from 'three';
import { ATMO_FRAG, EARTH_FRAG, EARTH_VERT, RING_FRAG, RING_VERT } from './planetShaders';
import { loadThree } from './threeLoader';

/**
 * The closing section's planet: Earth from real 4K satellite maps (public/textures/earth, from
 * Solar System Scope, CC BY 4.0, based on NASA imagery — credited in the footer), lit from behind
 * so a sunlit crescent and a blue atmosphere glow along the top while city lights spread across
 * the night side, wearing a thin Saturn-style ring that catches the planet's shadow. It leans toward the pointer; GSAP (HomeMotion) raises and grows the whole stage
 * as the section scrolls in.
 *
 * - Loads the maps (~2.2 MB) and builds only when the section comes near the viewport; renders only
 *   while on screen. If the maps fail to load, nothing renders and the CSS glow remains.
 * - prefers-reduced-motion: a single still frame.
 * - No WebGL: nothing renders; the section still has its glow and copy.
 */
export function RingedEarth() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || !loadThree) return;
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;

    let disposed = false;
    let teardown = () => {};

    const build = async () => {
      const [THREE] = await loadThree!;
      if (disposed) return;

      // Real Earth maps first; without them there is nothing worth drawing.
      let maps: Texture[];
      try {
        const loader = new THREE.TextureLoader();
        maps = await Promise.all(
          ['earth_day_4096.jpg', 'earth_night_4096.jpg', 'earth_bump_roughness_clouds_4096.jpg'].map((f) =>
            loader.loadAsync(`/textures/earth/${f}`),
          ),
        );
      } catch {
        return;
      }
      if (disposed) {
        maps.forEach((m) => m.dispose());
        return;
      }
      const [dayMap, nightMap, brcMap] = maps;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth > 1600 ? 1.25 : 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      el.appendChild(renderer.domElement);

      const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      dayMap.colorSpace = THREE.SRGBColorSpace;
      nightMap.colorSpace = THREE.SRGBColorSpace;
      maps.forEach((m) => (m.anisotropy = aniso));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
      // The sun sits behind and above the planet (as in orbital night photography): a lit crescent
      // along the top, twilight below it, and the night side full of city lights facing us.
      const sunDir = new THREE.Vector3(0.55, 0.72, -0.42).normalize();
      const sunPos = sunDir.clone().multiplyScalar(1000);
      const atmoDay = new THREE.Color('#4db2ff');
      const atmoTwilight = new THREE.Color('#bc490b');

      const R = 4;
      const planet = new THREE.Group();
      scene.add(planet);

      const earthMat = new THREE.ShaderMaterial({
        vertexShader: EARTH_VERT,
        fragmentShader: EARTH_FRAG,
        uniforms: {
          uDay: { value: dayMap },
          uNight: { value: nightMap },
          uBRC: { value: brcMap },
          uSunDir: { value: sunDir },
          uAtmoDay: { value: atmoDay },
          uAtmoTwilight: { value: atmoTwilight },
        },
      });
      const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 192, 192), earthMat);
      planet.add(earth);

      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.045, 128, 128),
        new THREE.ShaderMaterial({
          vertexShader: EARTH_VERT,
          fragmentShader: ATMO_FRAG,
          uniforms: { uSunDir: { value: sunDir }, uAtmoDay: { value: atmoDay }, uAtmoTwilight: { value: atmoTwilight } },
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      planet.add(atmo);

      // A thin, icy Saturn-style ring.
      const INNER = R * 1.55;
      const OUTER = R * 2.05;
      const ringMat = new THREE.ShaderMaterial({
        vertexShader: RING_VERT,
        fragmentShader: RING_FRAG,
        uniforms: {
          uSunPos: { value: sunPos },
          uPlanetPos: { value: new THREE.Vector3() },
          uPlanetR: { value: R },
          uInner: { value: INNER },
          uOuter: { value: OUTER },
          uTint: { value: new THREE.Color(0.86, 0.92, 1.0) },
          uOpacity: { value: 0.5 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(INNER, OUTER, 256, 1), ringMat);
      ring.rotation.x = -Math.PI / 2 + 0.2;
      planet.add(ring);
      planet.rotation.z = -0.12;

      const view = { y: -3.6, z: 16 };
      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const tanHalf = Math.tan((15 * Math.PI) / 180);
        // On tall screens pull back so the globe still fits the width.
        view.z = camera.aspect < 0.9 ? (R * 1.12) / (tanHalf * camera.aspect) : 16;
        const halfH = view.z * tanHalf;
        view.y = -R - halfH * 0.14; // the horizon sits below the middle, clear of the copy and buttons
        camera.position.set(0, 0, view.z);
        camera.updateProjectionMatrix();
      };
      resize();

      const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      let reduced = reduceQuery.matches;
      let time = 0;
      let last = performance.now();
      let raf = 0;
      let onScreen = true;
      const pointer = { x: 0, y: 0 };
      const lean = { x: 0, y: 0 };

      const draw = (t: number, live: boolean) => {
        if (live) {
          lean.x += (pointer.x - lean.x) * 0.04;
          lean.y += (pointer.y - lean.y) * 0.04;
        }
        // Europe, the Middle East and Africa face the camera; the globe turns very slowly eastward.
        earth.rotation.set(0.26, -2.36 + t * 0.012, 0);
        planet.position.set(0, view.y, 0);
        planet.rotation.x = lean.y * 0.12;
        planet.rotation.y = lean.x * 0.25;
        planet.updateMatrixWorld();
        (ringMat.uniforms.uPlanetPos.value as InstanceType<typeof THREE.Vector3>).setFromMatrixPosition(earth.matrixWorld);
        renderer.render(scene, camera);
      };

      const loop = (now: number) => {
        raf = 0;
        if (disposed || reduced || !onScreen || document.hidden) return;
        time += Math.min(now - last, 50) / 1000;
        last = now;
        draw(time, true);
        raf = requestAnimationFrame(loop);
      };
      const start = () => {
        if (reduced) return draw(4, false);
        if (!raf && onScreen && !document.hidden) {
          last = performance.now();
          raf = requestAnimationFrame(loop);
        }
      };

      const onPointer = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      const onReduce = () => {
        reduced = reduceQuery.matches;
        start();
      };
      const io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        start();
      });
      const ro = new ResizeObserver(() => {
        resize();
        if (reduced) draw(4, false);
      });
      io.observe(el);
      ro.observe(el);
      window.addEventListener('pointermove', onPointer, { passive: true });
      document.addEventListener('visibilitychange', start);
      reduceQuery.addEventListener('change', onReduce);

      try {
        await renderer.compileAsync(scene, camera);
      } catch {
        /* shaders compile on the first render instead */
      }
      if (!disposed) {
        start();
        el.classList.add('is-ready');
      }

      teardown = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener('pointermove', onPointer);
        document.removeEventListener('visibilitychange', start);
        reduceQuery.removeEventListener('change', onReduce);
        scene.traverse((o) => {
          const m = o as Mesh;
          m.geometry?.dispose();
          const mats: Material[] = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
          mats.forEach((mat) => mat.dispose());
        });
        maps.forEach((m) => m.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
      if (disposed) teardown();
    };

    // Build only once the section is within ~one screen of the viewport.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          near.disconnect();
          void build();
        }
      },
      { rootMargin: '200% 0px' },
    );
    near.observe(el);

    return () => {
      disposed = true;
      near.disconnect();
      teardown();
    };
  }, []);

  return <div ref={host} className="ringed-earth" aria-hidden="true" />;
}
