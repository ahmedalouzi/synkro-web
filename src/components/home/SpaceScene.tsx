'use client';

import { useEffect, useRef } from 'react';
import type { Material, Mesh, Texture } from 'three';
import {
  EARTH_VERT,
  GAS_FRAG,
  RING_FRAG,
  RING_TEX_FRAG,
  RING_VERT,
  ROCK_FRAG,
  SPHERE_VERT,
  SUN_FRAG,
  SUN_TEX_FRAG,
  TEX_PLANET_FRAG,
} from './planetShaders';
import { loadThree } from './threeLoader';

/**
 * The home hero's 3D world (three.js): a black sky of twinkling stars, a sun with a boiling
 * surface and a lens streak, Saturn (banded clouds, rings in its shadow), Jupiter, Mars, Uranus,
 * Neptune and a cratered moon (all procedural shaders, see planetShaders.ts), small meteors streaking past,
 * and a bank of fog low along the bottom. The glass atom (the Atomvs mark) floats
 * above the fog.
 *
 * Entrance: the camera flies in from deep space, the fog rises, the atom assembles
 * (nucleus, then each orbit) and the electrons spin up. Then it leans with the pointer
 * (depth parallax) and drifts down into the fog as you scroll.
 *
 * - three.js loads on demand, after first paint; the canvas fades in once ready.
 * - Renders only while on screen and the tab is visible; pixel ratio capped at 1.5.
 * - prefers-reduced-motion: gentle motion only (orbits, twinkle, slow spin); no fly-in, camera
 *   movement or meteors.
 * - Weak devices (html.lowfx) and failures show the static poster; a speed guard degrades, then
 *   falls back to it. `?fx=full` disables the guard for testing.
 * - No WebGL: nothing renders; the CSS sky gradient behind still reads as space.
 */

/** Deterministic random numbers so the sky looks the same on every visit. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeOut = (p: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 4);
const easeBack = (p: number) => {
  const x = Math.min(1, Math.max(0, p));
  const c1 = 1.5;
  return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export function SpaceScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const html = document.documentElement;
    const hero = el.closest('.space-hero');
    // ?poster=hero renders the composed still frame alone, for capturing public/posters/*.
    const posterMode = new URLSearchParams(window.location.search).get('poster') === 'hero';
    if (posterMode) html.classList.add('poster-capture');
    // Weak devices (html.lowfx, set before first paint) keep the static poster instead.
    if (!posterMode && html.classList.contains('lowfx')) return;
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
      html.classList.add('lowfx');
      return;
    }

    let disposed = false;
    let teardown = () => {};

    (async () => {
      const [THREE, { RoomEnvironment }] = await loadThree!;
      if (disposed) return;

      const rand = rng(7);
      const textures: Texture[] = [];
      const canvasTex = (w: number, h: number, paint: (g: CanvasRenderingContext2D) => void) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        paint(c.getContext('2d')!);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        textures.push(t);
        return t;
      };

      // ── Textures (all procedural, no image downloads) ─────────────────────
      const glowTex = canvasTex(128, 128, (g) => {
        const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.2, 'rgba(255,255,255,.6)');
        grad.addColorStop(0.5, 'rgba(255,255,255,.15)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 128, 128);
      });
      const cloudTex = canvasTex(256, 256, (g) => {
        for (let i = 0; i < 46; i++) {
          const x = 128 + (rand() - 0.5) * 150;
          const y = 140 + (rand() - 0.5) * 70;
          const r = 30 + rand() * 60;
          const grad = g.createRadialGradient(x, y, 0, x, y, r);
          grad.addColorStop(0, 'rgba(255,255,255,.22)');
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = grad;
          g.fillRect(0, 0, 256, 256);
        }
      });
      const streakTex = canvasTex(256, 8, (g) => {
        const grad = g.createLinearGradient(0, 0, 256, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.85, 'rgba(255,255,255,.9)');
        grad.addColorStop(1, 'rgba(255,255,255,1)');
        g.fillStyle = grad;
        g.fillRect(0, 2, 256, 4);
      });

      // ── Renderer, scene, camera ───────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: posterMode,
      });
      // Pixel budget: ~2.1 MP whatever the screen (a 5K iMac at full ratio would be ~7 MP a frame).
      let quality = 1;
      const ratioFor = (w: number, h: number) =>
        posterMode ? window.devicePixelRatio : Math.min(window.devicePixelRatio, 1.5, Math.sqrt(2.1e6 / Math.max(1, w * h))) * quality;
      renderer.setPixelRatio(ratioFor(window.innerWidth, window.innerHeight));
      renderer.transmissionResolutionScale = 0.5; // the glass refraction pass at half resolution
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 500);
      const sprite = (map: Texture, color: string, opacity: number, additive = true) =>
        new THREE.Sprite(
          new THREE.SpriteMaterial({
            map,
            color,
            opacity,
            transparent: true,
            depthWrite: false,
            toneMapped: false,
            blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
          }),
        );

      // ── Stars (twinkling, shader points) ──────────────────────────────────
      const STARS = 3200;
      const sPos = new Float32Array(STARS * 3);
      const sSize = new Float32Array(STARS);
      const sPhase = new Float32Array(STARS);
      const sColor = new Float32Array(STARS * 3);
      const tints = [new THREE.Color('#ffffff'), new THREE.Color('#cdd6ff'), new THREE.Color('#ffe7c4'), new THREE.Color('#d9c8ff')];
      for (let i = 0; i < STARS; i++) {
        const r = 120 + rand() * 120;
        const th = rand() * Math.PI * 2;
        const ph = Math.acos(2 * rand() - 1);
        sPos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.8 + 20, -Math.abs(r * Math.sin(ph) * Math.sin(th)) - 20], i * 3);
        sSize[i] = 1.3 + Math.pow(rand(), 2.5) * 3.8;
        sPhase[i] = rand();
        const c = tints[Math.floor(rand() * tints.length)];
        sColor.set([c.r, c.g, c.b], i * 3);
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
      starGeo.setAttribute('aSize', new THREE.BufferAttribute(sSize, 1));
      starGeo.setAttribute('aPhase', new THREE.BufferAttribute(sPhase, 1));
      starGeo.setAttribute('aColor', new THREE.BufferAttribute(sColor, 3));
      const starMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() }, uOpacity: { value: 0 } },
        vertexShader: `
          attribute float aSize; attribute float aPhase; attribute vec3 aColor;
          uniform float uTime; uniform float uPixelRatio;
          varying float vTw; varying vec3 vColor;
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vTw = 0.55 + 0.45 * sin(uTime * (0.5 + aPhase * 1.6) + aPhase * 40.0);
            vColor = aColor;
            gl_PointSize = aSize * uPixelRatio * (0.75 + 0.35 * vTw);
          }`,
        fragmentShader: `
          uniform float uOpacity; varying float vTw; varying vec3 vColor;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(vColor, a * a * vTw * uOpacity);
          }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      // ── Nebula wash ───────────────────────────────────────────────────────
      const nebula = new THREE.Group();
      (
        [
          ['#3a33a8', 0.07, -60, 30, 150],
          ['#1e5fa6', 0.05, 70, 10, 140],
          ['#7a3b78', 0.04, 0, -10, 170],
        ] as const
      ).forEach(([color, op, x, y, s]) => {
        const n = sprite(glowTex, color, op);
        n.position.set(x, y, -200);
        n.scale.set(s * 1.4, s, 1);
        nebula.add(n);
      });
      scene.add(nebula);

      // ── Sun, Saturn, an ice giant, a moon (procedural shaders) ────────────
      const sunPos = new THREE.Vector3();
      const sphereMat = (frag: string, uniforms: Record<string, { value: unknown }>) =>
        new THREE.ShaderMaterial({ vertexShader: SPHERE_VERT, fragmentShader: frag, uniforms: { uSunPos: { value: sunPos }, uTime: { value: 0 }, ...uniforms } });
      const timed: InstanceType<typeof THREE.ShaderMaterial>[] = [];

      const sun = new THREE.Group();
      const sunMat = sphereMat(SUN_FRAG, {});
      timed.push(sunMat);
      const sunCore = new THREE.Mesh(new THREE.SphereGeometry(2.4, 64, 64), sunMat);
      const halo1 = sprite(glowTex, '#ffd29a', 0.6);
      halo1.scale.setScalar(16);
      const halo2 = sprite(glowTex, '#ff9a6a', 0.16);
      halo2.scale.setScalar(60);
      const streak = sprite(glowTex, '#ffe2bf', 0.3);
      streak.scale.set(150, 1.6, 1);
      sun.add(halo2, halo1, sunCore, streak);
      scene.add(sun);
      scene.add(new THREE.HemisphereLight('#5d62c9', '#2b1530', 0.4)); // for the atom's glass

      const saturn = new THREE.Group();
      const SAT_R = 4.2;
      const saturnMat = sphereMat(GAS_FRAG, {
        uC1: { value: new THREE.Color('#c8a878') },
        uC2: { value: new THREE.Color('#e6d3ab') },
        uC3: { value: new THREE.Color('#b08a5e') },
        uC4: { value: new THREE.Color('#9a9886') },
        uAtmo: { value: new THREE.Color('#f3d9a8') },
        uBands: { value: 22 },
        uKind: { value: 0 },
      });
      timed.push(saturnMat);
      const saturnBody = new THREE.Mesh(new THREE.SphereGeometry(SAT_R, 96, 96), saturnMat);
      saturnBody.scale.y = 0.91; // Saturn is visibly flattened at the poles
      const ringMatS = new THREE.ShaderMaterial({
        vertexShader: RING_VERT,
        fragmentShader: RING_FRAG,
        uniforms: {
          uSunPos: { value: sunPos },
          uPlanetPos: { value: new THREE.Vector3() },
          uPlanetR: { value: SAT_R },
          uInner: { value: 5.6 },
          uOuter: { value: 10.4 },
          uTint: { value: new THREE.Color(1, 1, 1) },
          uOpacity: { value: 1 },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(5.6, 10.4, 256, 1), ringMatS);
      ring.rotation.x = -Math.PI / 2 + 0.42;
      saturn.add(saturnBody, ring);
      saturn.rotation.z = 0.32;
      scene.add(saturn);

      const blue = new THREE.Group();
      const blueMat = sphereMat(GAS_FRAG, {
        uC1: { value: new THREE.Color('#2f62b8') },
        uC2: { value: new THREE.Color('#5b95d8') },
        uC3: { value: new THREE.Color('#a9d4f0') },
        uC4: { value: new THREE.Color('#1c3f86') },
        uAtmo: { value: new THREE.Color('#7fc4ff') },
        uBands: { value: 18 },
        uKind: { value: 1 },
      });
      timed.push(blueMat);
      const blueBody = new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 64), blueMat);
      blue.add(blueBody);
      scene.add(blue);

      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 48), sphereMat(ROCK_FRAG, {}));
      scene.add(moon);

      // Jupiter, Mars and Uranus: banded procedural stand-ins until their real maps load.
      const gas = (c1: string, c2: string, c3: string, c4: string, atmo: string, bands: number) => {
        const m = sphereMat(GAS_FRAG, {
          uC1: { value: new THREE.Color(c1) },
          uC2: { value: new THREE.Color(c2) },
          uC3: { value: new THREE.Color(c3) },
          uC4: { value: new THREE.Color(c4) },
          uAtmo: { value: new THREE.Color(atmo) },
          uBands: { value: bands },
          uKind: { value: 0 },
        });
        timed.push(m);
        return m;
      };
      const jupiter = new THREE.Mesh(new THREE.SphereGeometry(8, 96, 96), gas('#c9a27a', '#efe1c8', '#a8724b', '#8f8a7c', '#f0d6b0', 26));
      jupiter.scale.y = 0.935; // Jupiter is flattened by its fast spin
      jupiter.rotation.z = 0.05;
      scene.add(jupiter);
      const mars = new THREE.Mesh(new THREE.SphereGeometry(1.15, 64, 64), gas('#b5562f', '#d07a4a', '#8a3a22', '#e9d8cf', '#ffb48a', 5));
      mars.rotation.z = 0.44;
      scene.add(mars);
      const uranus = new THREE.Mesh(new THREE.SphereGeometry(3.4, 64, 64), gas('#9fd8de', '#b8eef2', '#8cc7cf', '#7fb9c2', '#a8eef5', 8));
      uranus.rotation.z = 1.71; // Uranus rolls on its side
      scene.add(uranus);

      // ── Meteors: small streaks with a glowing head, a few at a time ──────
      const tailGeo = new THREE.PlaneGeometry(1, 1).translate(-0.5, 0, 0); // head at the origin, tail behind
      const meteors = Array.from({ length: 6 }, () => {
        const tail = new THREE.Mesh(
          tailGeo,
          new THREE.MeshBasicMaterial({ map: streakTex, color: '#dfe6ff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
        );
        const head = sprite(glowTex, '#e9eeff', 1);
        const m = new THREE.Group();
        m.add(tail, head);
        m.visible = false;
        scene.add(m);
        return { m, tail, head, start: 0, dur: 1, len: 6, from: new THREE.Vector3(), dir: new THREE.Vector3(), dist: 30 };
      });
      let nextMeteor = 2.2;
      const launch = (t: number) => {
        const free = meteors.find((x) => !x.m.visible);
        if (!free) return;
        const big = rand() < 0.15;
        const z = -45 - rand() * 40;
        free.start = t;
        free.dur = 0.55 + rand() * 0.6;
        free.len = big ? 12 + rand() * 6 : 3 + rand() * 4;
        free.dist = big ? 45 : 18 + rand() * 18;
        free.from.set(-60 + rand() * 120, 8 + rand() * 32, z);
        const ang = Math.PI + 0.25 + rand() * 0.5; // falling down-left
        free.dir.set(Math.cos(ang), Math.sin(ang), 0);
        free.tail.rotation.z = ang;
        free.tail.scale.set(free.len, big ? 0.16 : 0.07, 1);
        free.head.scale.setScalar(big ? 1.6 : 0.7);
        free.m.visible = true;
      };

      // ── The glass atom ────────────────────────────────────────────────────
      const atom = new THREE.Group();
      scene.add(atom);
      const atomLights: [string, number, [number, number, number]][] = [
        ['#7c83ff', 60, [-4, 2, 3]],
        ['#47c5fb', 50, [4, -1, 3]],
        ['#f0abfc', 40, [0, 3, -3]],
      ];
      for (const [color, intensity, p] of atomLights) {
        const l = new THREE.PointLight(color, intensity, 20, 2);
        l.position.set(...p);
        atom.add(l);
      }
      const nucleus = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.9, 24),
        new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          roughness: 0.05,
          transmission: 1,
          thickness: 1.8,
          ior: 1.45,
          iridescence: 1,
          iridescenceIOR: 1.3,
          iridescenceThicknessRange: [120, 520],
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          attenuationColor: new THREE.Color('#b8bcff'),
          attenuationDistance: 3,
          envMapIntensity: 1.5,
        }),
      );
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 6), new THREE.MeshBasicMaterial({ color: '#8b91ff' }));
      const coreGlow = sprite(glowTex, '#8b91ff', 0.9);
      coreGlow.scale.setScalar(3.2);
      atom.add(coreGlow, nucleus, core);

      const RX = 2.6;
      const RY = 0.95;
      const ringMat = new THREE.MeshPhysicalMaterial({
        color: '#d4d6ff',
        metalness: 0.1,
        roughness: 0.12,
        clearcoat: 1,
        transparent: true,
        opacity: 0.65,
        iridescence: 0.8,
        envMapIntensity: 1.6,
      });
      const ellipse = new THREE.EllipseCurve(0, 0, RX, RY, 0, Math.PI * 2, false, 0);
      const path = new THREE.CatmullRomCurve3(ellipse.getPoints(240).map((p) => new THREE.Vector3(p.x, p.y, 0)), true);
      const orbitGeo = new THREE.TubeGeometry(path, 360, 0.022, 10, true);
      const orbits: { group: InstanceType<typeof THREE.Group>; electron: InstanceType<typeof THREE.Group>; speed: number; phase: number }[] = [];
      ['#9ea3ff', '#47c5fb', '#f0abfc'].forEach((color, i) => {
        const group = new THREE.Group();
        group.rotation.z = (i * Math.PI) / 3;
        group.rotation.x = 0.12 * (i - 1);
        group.add(new THREE.Mesh(orbitGeo, ringMat));
        const electron = new THREE.Group();
        electron.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 24), new THREE.MeshBasicMaterial({ color: '#ffffff' })));
        const g = sprite(glowTex, color, 1);
        g.scale.setScalar(1.3);
        electron.add(g);
        group.add(electron);
        atom.add(group);
        orbits.push({ group, electron, speed: 0.9 + i * 0.22, phase: (i * Math.PI * 2) / 3 });
      });

      // ── Fog bank ──────────────────────────────────────────────────────────
      const fog = new THREE.Group();
      scene.add(fog);
      const fogTints = ['#b48fc4', '#9a88d6', '#c9a0c0', '#7d74c9', '#d6b0c8'];
      const puffs: { s: InstanceType<typeof THREE.Sprite>; speed: number; bob: number; baseY: number }[] = [];
      for (let i = 0; i < 26; i++) {
        const front = i < 10; // the nearest puffs sit in front of the atom's base
        const s = sprite(cloudTex, fogTints[i % fogTints.length], front ? 0.15 + rand() * 0.12 : 0.16 + rand() * 0.14, false);
        const size = front ? 7 + rand() * 6 : 12 + rand() * 12;
        s.scale.set(size * 1.7, size, 1);
        const baseY = front ? -4 + rand() * 0.7 : -5.6 + rand() * 1.9;
        s.position.set(-30 + rand() * 60, baseY, front ? 1 + rand() * 4 : -24 + rand() * 22);
        fog.add(s);
        puffs.push({ s, speed: (0.08 + rand() * 0.18) * (rand() > 0.5 ? 1 : -1), bob: rand() * Math.PI * 2, baseY });
      }
      const fogGlow = sprite(glowTex, '#a98bd8', 0.2);
      fogGlow.scale.set(70, 14, 1);
      fogGlow.position.set(0, -4, -12);
      fog.add(fogGlow);

      // ── Layout per screen shape ───────────────────────────────────────────
      const view = { camZ: 11, camY: 0.4, atomY: 1.75, atomScale: 0.72, fogY: 0 };
      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setPixelRatio(ratioFor(w, h));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const narrow = camera.aspect < 0.9;
        view.camZ = narrow ? 15.5 : 11;
        view.atomY = narrow ? 3.2 : 1.75;
        view.atomScale = 0.72;
        view.fogY = narrow ? -0.6 : 0;
        // Keep the planets inside the frame on both wide and tall screens.
        sun.position.set(narrow ? 16 : 52, narrow ? 34 : 26, -130);
        saturn.position.set(narrow ? -14 : -44, narrow ? 22 : 14, -95);
        blue.position.set(narrow ? 9 : 26, narrow ? 8 : 7, -60);
        moon.position.set(narrow ? -6 : -46, narrow ? 27 : 26, narrow ? -80 : -90);
        jupiter.position.set(narrow ? -14 : -41, narrow ? 52 : 31, narrow ? -200 : -150);
        mars.position.set(narrow ? -10 : 24, narrow ? 14 : 12, -70);
        uranus.position.set(-60, -2, -110);
        uranus.visible = !narrow; // no room on phones
        // Shade from the sun's direction but from in front of the planets, so they read three-quarter
        // lit (as in space photography) instead of showing us their night side.
        sunPos.set(sun.position.x * 1.4, sun.position.y * 1.2, 30);
        (ringMatS.uniforms.uPlanetPos.value as InstanceType<typeof THREE.Vector3>).copy(saturn.position);
      };
      resize();

      // ── Motion ────────────────────────────────────────────────────────────
      const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      // posterMode draws one still frame. Reduced motion keeps the scene alive but gentle: no
      // fly-in, no camera movement on scroll or pointer, no meteors (vestibular triggers removed).
      const reduced = posterMode;
      let gentle = reduceQuery.matches;
      const forceFull = new URLSearchParams(window.location.search).get('fx') === 'full';
      let time = 0;
      let stopped = false;
      let last = performance.now();
      const pointer = { x: 0, y: 0 };
      const lean = { x: 0, y: 0 };
      let onScreen = true;
      let raf = 0;
      const target = new THREE.Vector3();

      const draw = (t: number, live: boolean) => {
        const dt = live ? 1 / 60 : 0;
        const scroll = live && !gentle ? Math.min(1, window.scrollY / window.innerHeight) : 0;
        if (live && !gentle) {
          lean.x += (pointer.x - lean.x) * 0.04;
          lean.y += (pointer.y - lean.y) * 0.04;
        }

        // Fly-in: from deep space to the resting shot.
        const fly = easeOut(t / 2.4);
        const camZ = view.camZ + (1 - fly) * 26 - scroll * 3;
        const camY = view.camY + (1 - fly) * 4 - scroll * 2.4;
        camera.position.set(lean.x * 0.7, camY - lean.y * 0.4, camZ);
        target.set(0, view.camY + 0.4 - scroll * 1.2, 0);
        camera.lookAt(target);
        camera.rotation.z = (1 - fly) * -0.12;

        starMat.uniforms.uTime.value = t;
        starMat.uniforms.uOpacity.value = easeOut(t / 0.5);
        stars.rotation.y = t * 0.004;
        nebula.position.x = -lean.x * 2;

        // Atom: nucleus pops in, then each orbit unfolds, electrons accelerate in.
        const pop = easeBack((t - 0.2) / 1.1);
        atom.scale.setScalar(view.atomScale * Math.max(0.0001, pop));
        atom.position.set(0, view.atomY + scroll * 2, 0);
        atom.rotation.set(0.28 + lean.y * 0.25 + scroll * 0.6, Math.sin(t * 0.32) * 0.55 + lean.x * 0.4 + scroll * 1.6, Math.sin(t * 0.21) * 0.08);
        nucleus.rotation.set(t * 0.18, t * 0.27, 0);
        core.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06);
        coreGlow.material.opacity = 0.55 + 0.25 * Math.sin(t * 2.2) + (1 - easeOut((t - 0.6) / 1.2)) * 0.8;
        orbits.forEach((o, i) => {
          o.group.scale.setScalar(Math.max(0.0001, easeBack((t - 0.55 - i * 0.18) / 1)));
          const spin = Math.min(1, Math.max(0, (t - 0.7) / 1.6)); // electrons ramp up to speed
          const a = (t * o.speed + o.phase) * (0.4 + 0.6 * spin) + (1 - spin) * 2;
          o.electron.position.set(Math.cos(a) * RX, Math.sin(a) * RY, 0);
        });

        // Fog rises in, then drifts.
        fog.position.y = view.fogY - (1 - easeOut(t / 2)) * 3.2;
        for (const p of puffs) {
          if (dt) {
            p.s.position.x += p.speed * dt;
            if (p.s.position.x > 32) p.s.position.x = -32;
            if (p.s.position.x < -32) p.s.position.x = 32;
          }
          p.s.position.y = p.baseY + Math.sin(t * 0.25 + p.bob) * 0.15;
        }

        // Planets: slow spin, cloud bands drift, sun surface boils.
        for (const m of timed) m.uniforms.uTime.value = t;
        saturnBody.rotation.y = t * 0.04;
        blueBody.rotation.y = t * 0.06;
        jupiter.rotation.y = t * 0.05;
        mars.rotation.y = 1.2 + t * 0.04;
        uranus.rotation.y = t * 0.03;
        halo1.material.opacity = 0.55 + 0.08 * Math.sin(t * 0.8);
        streak.material.opacity = 0.26 * easeOut((t - 1) / 2);

        // Meteors.
        if (live && !gentle) {
          if (t > nextMeteor) {
            launch(t);
            nextMeteor = t + 0.9 + rand() * 2.6;
          }
          for (const x of meteors) {
            if (!x.m.visible) continue;
            const k = (t - x.start) / x.dur;
            if (k > 1) {
              x.m.visible = false;
              continue;
            }
            x.m.position.copy(x.from).addScaledVector(x.dir, easeOut(k) * x.dist);
            const fade = Math.sin(Math.min(1, k) * Math.PI);
            (x.tail.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = fade;
            x.head.material.opacity = fade;
          }
        }

        renderer.render(scene, camera);
      };

      const STILL_T = 7; // a composed frame after the entrance has settled

      // Speed guard. Ignore the first 3 s after (re)starting (shader compile, big texture uploads),
      // then judge windows of 90 frames by their MEDIAN frame time, so one-off spikes never count.
      // Median > 21 ms (< ~48 fps): lower the resolution 15% per window, down to 60%.
      // Median > 45 ms (< ~22 fps): drop the pixel ratio, the glass transmission pass and half the
      // fog. Then two windows in a row at > 66 ms (< 15 fps): stop, show the poster, free the GPU.
      const perf = { started: 0, samples: [] as number[], level: 0, strikes: 0 };
      const degrade = () => {
        perf.level += 1;
        if (perf.level === 1) {
          quality = Math.min(quality, 0.6);
          resize();
          const glassMat = nucleus.material as InstanceType<typeof THREE.MeshPhysicalMaterial>;
          glassMat.transmission = 0;
          glassMat.transparent = true;
          glassMat.opacity = 0.9;
          glassMat.needsUpdate = true;
          puffs.forEach((p, i) => (p.s.visible = i % 2 === 0));
          return;
        }
        stopped = true;
        cancelAnimationFrame(raf);
        raf = 0;
        hero?.classList.remove('is-live');
        hero?.classList.add('poster-on');
        html.classList.add('lowfx');
        window.setTimeout(() => teardown(), 900);
      };

      const loop = (now: number) => {
        raf = 0;
        if (disposed || stopped || reduced || !onScreen || document.hidden) return;
        const frameMs = now - last;
        time += Math.min(frameMs, 50) / 1000;
        last = now;
        draw(time, true);
        if (!forceFull && perf.level < 2 && now - perf.started > 3000) {
          perf.samples.push(frameMs);
          if (perf.samples.length === 90) {
            const sorted = perf.samples.sort((a, b) => a - b);
            const median = sorted[45];
            perf.samples = [];
            if (perf.level === 0 && median > 45) degrade();
            else if (perf.level === 0 && median > 21 && quality > 0.62) {
              // Adaptive resolution: under ~48 fps, render 15% fewer pixels per step (down to 60%)
              // until the frame rate is smooth. Nothing else changes, so the design stays intact.
              quality = Math.max(0.6, quality * 0.85);
              resize();
            } else if (perf.level === 1) {
              perf.strikes = median > 66 ? perf.strikes + 1 : 0;
              if (perf.strikes >= 2) degrade();
            }
          }
        }
        if (!stopped) raf = requestAnimationFrame(loop);
      };
      const start = () => {
        if (reduced) {
          meteors.forEach((x) => (x.m.visible = false));
          draw(STILL_T, false);
          return;
        }
        if (!raf && !stopped && onScreen && !document.hidden) {
          last = performance.now();
          perf.started = last;
          perf.samples = [];
          if (gentle && time < STILL_T) time = STILL_T; // reduced motion: skip the fly-in
          raf = requestAnimationFrame(loop);
        }
      };

      const onPointer = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      const onReduce = () => {
        gentle = reduceQuery.matches;
        start();
      };
      const io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        start();
      });
      const ro = new ResizeObserver(() => {
        resize();
        if (reduced) draw(STILL_T, false);
      });
      io.observe(el);
      ro.observe(el);
      window.addEventListener('pointermove', onPointer, { passive: true });
      document.addEventListener('visibilitychange', start);
      reduceQuery.addEventListener('change', onReduce);

      try {
        await renderer.compileAsync(scene, camera);
      } catch {
        /* older drivers: shaders compile on the first render instead */
      }
      if (!disposed) {
        if (!posterMode) {
          // The CSS poster fades in ~3 s after load on slow starts; if we are that late, pick up
          // from the poster's exact frame instead of replaying the fly-in, then cross-fade.
          if (performance.now() > 2800) time = STILL_T;
          hero?.classList.add('is-live');
        }
        start();
        el.classList.add('is-ready');
      }

      // Progressive upgrade: swap each body to its real map (public/textures/planets) once it has
      // loaded. The procedural shaders above stay as the instant first frame and as the fallback
      // for any map that is missing.
      const upgraded = (async () => {
        const loader = new THREE.TextureLoader();
        const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        const tryLoad = (f: string) =>
          loader
            .loadAsync(`/textures/planets/${f}`)
            .then((tex) => {
              if (disposed) {
                tex.dispose();
                return null;
              }
              tex.anisotropy = aniso;
              textures.push(tex);
              return tex;
            })
            .catch(() => null);
        const [satTex, ringTex2, nepTex, moonTex, sunTex, jupTex, marsTex, uraTex] = await Promise.all(
          [
            'saturn_2k.jpg',
            'saturn_ring.png',
            'neptune_2k.jpg',
            'moon_4k.jpg',
            'sun_2k.jpg',
            'jupiter_2k.jpg',
            'mars_2k.jpg',
            'uranus_2k.jpg',
          ].map(tryLoad),
        );
        if (disposed) return;
        const swap = (mesh: InstanceType<typeof THREE.Mesh>, mat: InstanceType<typeof THREE.ShaderMaterial>) => {
          (mesh.material as InstanceType<typeof THREE.Material>).dispose();
          mesh.material = mat;
        };
        const planetMat = (map: Texture, atmo: string, soft: number, atmoStrength: number, limb: number) => {
          map.colorSpace = THREE.SRGBColorSpace;
          return new THREE.ShaderMaterial({
            vertexShader: EARTH_VERT,
            fragmentShader: TEX_PLANET_FRAG,
            uniforms: {
              uMap: { value: map },
              uSunPos: { value: sunPos },
              uAtmo: { value: new THREE.Color(atmo) },
              uSoft: { value: soft },
              uAtmoStrength: { value: atmoStrength },
              uLimb: { value: limb },
            },
          });
        };
        if (satTex) swap(saturnBody, planetMat(satTex, '#f3dcb0', 0.12, 0.7, 0.4));
        if (nepTex) swap(blueBody, planetMat(nepTex, '#7fc4ff', 0.1, 1.1, 0.35));
        if (moonTex) swap(moon, planetMat(moonTex, '#000000', 0.02, 0, 0.15));
        if (jupTex) swap(jupiter, planetMat(jupTex, '#f0d6b0', 0.12, 0.6, 0.4));
        if (marsTex) swap(mars, planetMat(marsTex, '#ffb48a', 0.05, 0.35, 0.25));
        if (uraTex) swap(uranus, planetMat(uraTex, '#a8eef5', 0.1, 1.0, 0.35));
        if (sunTex) {
          sunTex.colorSpace = THREE.SRGBColorSpace;
          swap(sunCore, new THREE.ShaderMaterial({ vertexShader: EARTH_VERT, fragmentShader: SUN_TEX_FRAG, uniforms: { uMap: { value: sunTex } } }));
        }
        if (ringTex2) {
          ringTex2.colorSpace = THREE.SRGBColorSpace;
          // The real ring map spans from the inner C ring (1.11 R) to the outer A ring (2.33 R).
          ringMatS.uniforms.uInner.value = SAT_R * 1.11;
          ringMatS.uniforms.uOuter.value = SAT_R * 2.33;
          ring.geometry.dispose();
          ring.geometry = new THREE.RingGeometry(SAT_R * 1.11, SAT_R * 2.33, 256, 1);
          swap(ring, new THREE.ShaderMaterial({
            vertexShader: RING_VERT,
            fragmentShader: RING_TEX_FRAG,
            uniforms: { ...ringMatS.uniforms, uRingMap: { value: ringTex2 } }, // shares the live shadow uniforms
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
          }));
        }
        if (reduced) draw(STILL_T, false);
      })();
      if (posterMode) {
        void upgraded.then(() => {
          draw(STILL_T, false);
          html.dataset.posterReady = '1';
        });
      }

      let tornDown = false;
      teardown = () => {
        if (tornDown) return;
        tornDown = true;
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
        textures.forEach((t) => t.dispose());
        envTex.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
      if (disposed) teardown(); // unmounted while shaders were compiling
    })();

    return () => {
      disposed = true;
      teardown();
    };
  }, []);

  return <div ref={host} className="space-scene" aria-hidden="true" />;
}
