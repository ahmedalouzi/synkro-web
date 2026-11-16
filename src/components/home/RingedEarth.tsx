'use client';

import { useEffect, useRef } from 'react';
import type { Material, Mesh, Texture } from 'three';
import { ATMO_FRAG, EARTH_FRAG, EARTH_VERT, RING_FRAG, RING_VERT } from './planetShaders';
import { loadThree, prefersReducedMotion, threeAllowed } from './threeLoader';

/**
 * The closing section's planet: Earth from real 2K satellite maps (public/textures/earth, from
 * Solar System Scope, CC BY 4.0, based on NASA imagery — credited in the footer), lit from behind
 * so a sunlit crescent and a blue atmosphere glow along the top while city lights spread across
 * the night side, wearing a thin Saturn-style ring that catches the planet's shadow. It leans toward the pointer; GSAP (HomeMotion) raises and grows the whole stage
 * as the section scrolls in.
 *
 * - Loads the maps (~1.1 MB) and builds only when the section comes near the viewport; renders only
 *   while on screen.
 * - Weak devices (html.lowfx), prefers-reduced-motion at load, no WebGL, maps that fail to load and
 *   a lost WebGL context show the static poster (.planet-stage.poster-on, public/posters/earth-*.webp)
 *   instead; on weak devices three.js is not downloaded at all (threeLoader.ts).
 * - `?poster=earth` renders one still frame and puts it on <html data-earth-poster> as a PNG data
 *   URL, for capturing public/posters/earth-*.webp (desktop at 2560×1080, mobile at 860×1864).
 */
export function RingedEarth() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const stage = el.closest('.planet-stage');
    const showPoster = (on: boolean) => stage?.classList.toggle('poster-on', on);
    const posterMode = new URLSearchParams(window.location.search).get('poster') === 'earth';
    // Reduced motion: the Earth stays a still (only the hero runs, in calm mode).
    if (!threeAllowed() || (!posterMode && prefersReducedMotion())) {
      showPoster(true);
      return;
    }
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
      showPoster(true);
      return;
    }

    let disposed = false;
    let teardown = () => {};

    const build = async () => {
      // The hero's speed guard may have switched to light mode (html.lowfx) since the page loaded.
      if (!threeAllowed()) {
        showPoster(true);
        return;
      }
      const [THREE] = await loadThree();
      if (disposed) return;

      // Real Earth maps first; without them there is nothing worth drawing. The packed
      // bump/roughness/clouds map stays JPEG (4:4:4): WebP's colour subsampling blurs the clouds channel.
      let maps: Texture[];
      try {
        const loader = new THREE.TextureLoader();
        maps = await Promise.all(
          ['earth_day_2048.webp', 'earth_night_2048.webp', 'earth_bump_roughness_clouds_2048.jpg'].map((f) =>
            loader.loadAsync(`/textures/earth/${f}`),
          ),
        );
      } catch {
        showPoster(true);
        return;
      }
      if (disposed) {
        maps.forEach((m) => m.dispose());
        return;
      }
      const [dayMap, nightMap, brcMap] = maps;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: posterMode });
      const ratioFor = (w: number, h: number) => (posterMode ? 1 : Math.min(window.devicePixelRatio, 1.5, Math.sqrt(2.1e6 / Math.max(1, w * h))));
      renderer.setPixelRatio(ratioFor(window.innerWidth, window.innerHeight));
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
        renderer.setPixelRatio(ratioFor(w, h));
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
      // Weak devices (html.lowfx) get one still frame instead of a running scene.
      const lowfx = () => document.documentElement.classList.contains('lowfx');
      let reduced = lowfx() || posterMode;
      let gentle = reduceQuery.matches; // reduced motion switched on later: keep turning, drop the pointer lean
      let time = 0;
      let last = performance.now();
      let raf = 0;
      let onScreen = true;
      let contextLost = false;
      const pointer = { x: 0, y: 0 };
      const lean = { x: 0, y: 0 };

      const draw = (t: number, live: boolean) => {
        if (live && !gentle) {
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
        if (disposed || contextLost || reduced || !onScreen || document.hidden) return;
        time += Math.min(now - last, 50) / 1000;
        last = now;
        draw(time, true);
        raf = requestAnimationFrame(loop);
      };
      const start = () => {
        if (contextLost) return;
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
        gentle = reduceQuery.matches;
        reduced = lowfx();
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
      // Context loss (GPU reset, out of video memory): show the poster until the browser restores the
      // context (three.js calls preventDefault() itself, then re-uploads everything on the next render).
      const canvas = renderer.domElement;
      const onContextLost = () => {
        contextLost = true;
        cancelAnimationFrame(raf);
        raf = 0;
        el.classList.remove('is-ready');
        showPoster(true);
      };
      const onContextRestored = () => {
        contextLost = false;
        if (disposed) return;
        start();
        el.classList.add('is-ready');
        showPoster(false);
      };

      io.observe(el);
      ro.observe(el);
      window.addEventListener('pointermove', onPointer, { passive: true });
      document.addEventListener('visibilitychange', start);
      reduceQuery.addEventListener('change', onReduce);
      canvas.addEventListener('webglcontextlost', onContextLost);
      canvas.addEventListener('webglcontextrestored', onContextRestored);

      try {
        await renderer.compileAsync(scene, camera);
      } catch {
        /* shaders compile on the first render instead */
      }
      if (!disposed) {
        start();
        el.classList.add('is-ready');
        if (posterMode) {
          draw(4, false);
          document.documentElement.dataset.earthPoster = canvas.toDataURL('image/png');
        }
      }

      teardown = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener('pointermove', onPointer);
        document.removeEventListener('visibilitychange', start);
        reduceQuery.removeEventListener('change', onReduce);
        canvas.removeEventListener('webglcontextlost', onContextLost); // forceContextLoss() below fires it
        canvas.removeEventListener('webglcontextrestored', onContextRestored);
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

    if (posterMode) {
      void build();
      return () => {
        disposed = true;
        teardown();
      };
    }

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
