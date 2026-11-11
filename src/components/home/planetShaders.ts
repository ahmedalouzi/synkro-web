/**
 * GLSL for the hero's planets and sun. Everything is procedural (fbm noise), so there are no
 * texture downloads, and the look holds up at any size:
 *  - gas giants: turbulent latitude bands, a soft terminator, limb darkening and an
 *    atmosphere rim lit from the sun side;
 *  - rocky moon: cratered noise with a hard terminator;
 *  - rings: radial bands with the Cassini gap, and the planet's shadow falling across them;
 *  - sun: boiling granulation, limb darkening from white-gold centre to orange edge.
 * Each shader ends with three's tone-mapping and colour-space chunks so it matches the scene.
 */

const NOISE = /* glsl */ `
  float hash3(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise3(p);
      p = p * 2.03 + vec3(1.7, 9.2, 4.1);
      a *= 0.5;
    }
    return v;
  }
`;

const SPHERE_VERT = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vObj = position;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vPosW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

/** Gas giant (Saturn, Neptune). uKind 0 = Saturn tones, 1 = icy blue with a dark storm. */
export const GAS_FRAG = /* glsl */ `
  uniform vec3 uSunPos;
  uniform float uTime;
  uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4;
  uniform vec3 uAtmo;
  uniform float uBands;
  uniform float uKind;
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  ${NOISE}
  void main() {
    vec3 p = normalize(vObj);
    // Bands follow latitude, bent by slow turbulence.
    float warp = fbm(p * 3.0 + vec3(uTime * 0.01, 0.0, 0.0)) - 0.5;
    float lat = p.y + warp * 0.07 + (fbm(p * 14.0) - 0.5) * 0.015;
    float b = sin(lat * uBands) * 0.5 + 0.5;
    float b2 = sin(lat * uBands * 2.7 + 1.3) * 0.5 + 0.5;
    vec3 col = mix(uC1, uC2, smoothstep(0.15, 0.85, b));
    col = mix(col, uC3, smoothstep(0.6, 1.0, b2) * 0.4);
    col = mix(col, uC4, smoothstep(0.75, 1.0, abs(p.y)) * 0.6); // darker, cooler poles
    col *= 0.9 + 0.2 * fbm(p * 30.0);
    if (uKind > 0.5) {
      // A dark oval storm, as on Neptune.
      vec3 spot = normalize(vec3(0.55, -0.32, 0.77));
      float d = length((p - spot) * vec3(1.0, 1.9, 1.0));
      col = mix(col, uC4 * 0.55, smoothstep(0.2, 0.08, d));
    }

    vec3 N = normalize(vNormalW);
    vec3 L = normalize(uSunPos - vPosW);
    vec3 V = normalize(cameraPosition - vPosW);
    float ndl = dot(N, L);
    float diff = smoothstep(-0.12, 0.65, ndl);              // soft terminator of a thick atmosphere
    float limb = pow(max(dot(N, V), 0.0), 0.42);            // limb darkening
    vec3 lit = col * (diff * limb * 1.35 + 0.025);
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    lit += uAtmo * rim * smoothstep(-0.25, 0.6, ndl) * 1.1; // sunlit atmosphere halo
    gl_FragColor = vec4(lit, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Cratered rocky moon. */
export const ROCK_FRAG = /* glsl */ `
  uniform vec3 uSunPos;
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  ${NOISE}
  void main() {
    vec3 p = normalize(vObj);
    float n = fbm(p * 5.0);
    float craters = smoothstep(0.62, 0.7, fbm(p * 11.0 + 3.0)) * 0.35;
    float maria = smoothstep(0.45, 0.62, fbm(p * 2.2 + 7.0)) * 0.3;
    vec3 col = vec3(0.62, 0.6, 0.58) * (0.75 + n * 0.5) - craters - maria;
    vec3 N = normalize(vNormalW);
    vec3 L = normalize(uSunPos - vPosW);
    float diff = smoothstep(-0.02, 0.25, dot(N, L));
    gl_FragColor = vec4(col * (diff * 1.25 + 0.02), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** The sun's photosphere. */
export const SUN_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  ${NOISE}
  void main() {
    vec3 p = normalize(vObj);
    float g = fbm(p * 9.0 + vec3(0.0, uTime * 0.05, uTime * 0.03));
    float g2 = fbm(p * 26.0 - vec3(uTime * 0.08));
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    float mu = max(dot(N, V), 0.0);
    vec3 centre = vec3(1.0, 0.93, 0.78);
    vec3 edge = vec3(1.0, 0.45, 0.12);
    vec3 col = mix(edge, centre, pow(mu, 0.55));
    col *= 0.82 + 0.3 * g + 0.12 * g2;
    gl_FragColor = vec4(col * 3.2, 1.0); // over-bright; tone mapping rolls it into a glow
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Earth from real satellite maps (Solar System Scope, CC BY 4.0, from NASA imagery):
 * the day map on the lit side, city lights on the night side, clouds, a sun glint that only the
 * water reflects (roughness map), and an atmosphere tint at the limb — blue by day, orange at
 * the terminator. uDay / uNight are sRGB; uBRC packs bump (r), roughness (g) and clouds (b).
 */
export const EARTH_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vPosW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

export const EARTH_FRAG = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uBRC;
  uniform vec3 uSunDir;
  uniform vec3 uAtmoDay;
  uniform vec3 uAtmoTwilight;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(vPosW - cameraPosition);
    float sunO = dot(uSunDir, N);
    float dayMix = smoothstep(-0.25, 0.5, sunO);

    vec3 day = texture2D(uDay, vUv).rgb;
    vec3 night = texture2D(uNight, vUv).rgb * 1.6;
    vec3 col = mix(night, day * 1.15, dayMix);

    vec3 brc = texture2D(uBRC, vUv).rgb;
    float clouds = smoothstep(0.2, 1.0, brc.b) * dayMix;
    col = mix(col, vec3(1.0), clouds);

    // Atmosphere tint at the limb.
    float fresnel = pow(1.0 + dot(V, N), 2.0);
    vec3 atmo = mix(uAtmoTwilight, uAtmoDay, smoothstep(-0.25, 0.75, sunO));
    col = mix(col, atmo, fresnel * smoothstep(-0.5, 1.0, sunO));

    // Sun glint on water only (low roughness), not on land or clouds.
    vec3 R = reflect(-uSunDir, N);
    float spec = pow(max(-dot(R, V), 0.0), 32.0) * (1.0 - brc.g) * (1.0 - clouds);
    col += spec * mix(uAtmoTwilight, vec3(1.0), smoothstep(0.0, 0.5, sunO)) * 0.9;

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** The atmosphere shell: a slightly larger back-faced sphere that glows just beyond the limb. */
export const ATMO_FRAG = /* glsl */ `
  uniform vec3 uSunDir;
  uniform vec3 uAtmoDay;
  uniform vec3 uAtmoTwilight;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(vPosW - cameraPosition);
    float sunO = dot(uSunDir, N);
    vec3 atmo = mix(uAtmoTwilight, uAtmoDay, smoothstep(-0.25, 0.75, sunO));
    float edge = smoothstep(0.0, 0.32, dot(V, N));     // 0 at the shell's rim, 1 toward the planet
    float a = edge * edge * smoothstep(-0.5, 1.0, sunO);
    gl_FragColor = vec4(atmo, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const RING_VERT = /* glsl */ `
  varying vec3 vPosW;
  varying vec2 vLocal;
  void main() {
    vLocal = position.xy;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vPosW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

/** Saturn's rings, with the planet's shadow cast across them. */
export const RING_FRAG = /* glsl */ `
  uniform vec3 uSunPos;
  uniform vec3 uPlanetPos;
  uniform float uPlanetR;
  uniform float uInner;
  uniform float uOuter;
  uniform vec3 uTint;
  uniform float uOpacity;
  varying vec3 vPosW;
  varying vec2 vLocal;
  ${NOISE}
  void main() {
    float r = (length(vLocal) - uInner) / (uOuter - uInner);
    if (r < 0.0 || r > 1.0) discard;
    float fine = noise3(vec3(r * 180.0, 0.0, 0.0)) * 0.5 + noise3(vec3(r * 47.0, 3.0, 0.0)) * 0.5;
    float a = (0.25 + 0.75 * fine) * smoothstep(0.0, 0.05, r) * smoothstep(1.0, 0.93, r);
    a *= 1.0 - smoothstep(0.54, 0.56, r) * (1.0 - smoothstep(0.6, 0.62, r)) * 0.92; // Cassini division
    a *= mix(0.55, 1.0, smoothstep(0.0, 0.3, r));                                   // faint inner C ring
    vec3 col = mix(vec3(0.62, 0.55, 0.45), vec3(0.93, 0.86, 0.72), fine);

    // Shadow: does the ray from this point toward the sun hit the planet?
    vec3 L = normalize(uSunPos - vPosW);
    vec3 oc = vPosW - uPlanetPos;
    float b = dot(oc, L);
    float c = dot(oc, oc) - uPlanetR * uPlanetR;
    float shadow = (b < 0.0 && b * b - c > 0.0) ? 0.12 : 1.0;
    gl_FragColor = vec4(col * uTint * shadow * 1.05, a * 0.95 * uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export { SPHERE_VERT };

/**
 * Real planet maps (public/textures/planets, Solar System Scope, CC BY 4.0, from NASA imagery).
 * uSoft sets the terminator: wide for gas giants' thick atmospheres, tight for the airless Moon.
 */
export const TEX_PLANET_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uSunPos;
  uniform vec3 uAtmo;
  uniform float uSoft;
  uniform float uAtmoStrength;
  uniform float uLimb;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 col = texture2D(uMap, vUv).rgb;
    vec3 N = normalize(vNormalW);
    vec3 L = normalize(uSunPos - vPosW);
    vec3 V = normalize(cameraPosition - vPosW);
    float ndl = dot(N, L);
    float diff = smoothstep(-uSoft, 0.55 + uSoft, ndl);
    float limb = pow(max(dot(N, V), 0.0), uLimb);
    vec3 lit = col * diff * limb * 1.3 + col * 0.012;
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    lit += uAtmo * rim * smoothstep(-0.25, 0.6, ndl) * uAtmoStrength;
    gl_FragColor = vec4(lit, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** The sun from its real map: limb-darkened and over-bright so tone mapping turns it into a glow. */
export const SUN_TEX_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 tex = texture2D(uMap, vUv).rgb;
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);
    float mu = max(dot(N, V), 0.0);
    vec3 col = tex * mix(vec3(1.0, 0.5, 0.18), vec3(1.0, 0.95, 0.85), pow(mu, 0.5));
    gl_FragColor = vec4(col * 3.4, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Saturn's rings from the real colour + transparency strip (inner edge at u = 0), with the planet's shadow. */
export const RING_TEX_FRAG = /* glsl */ `
  uniform sampler2D uRingMap;
  uniform vec3 uSunPos;
  uniform vec3 uPlanetPos;
  uniform float uPlanetR;
  uniform float uInner;
  uniform float uOuter;
  varying vec3 vPosW;
  varying vec2 vLocal;
  void main() {
    float r = (length(vLocal) - uInner) / (uOuter - uInner);
    if (r < 0.0 || r > 1.0) discard;
    vec4 tex = texture2D(uRingMap, vec2(r, 0.5));
    vec3 L = normalize(uSunPos - vPosW);
    vec3 oc = vPosW - uPlanetPos;
    float b = dot(oc, L);
    float c = dot(oc, oc) - uPlanetR * uPlanetR;
    float shadow = (b < 0.0 && b * b - c > 0.0) ? 0.1 : 1.0;
    gl_FragColor = vec4(tex.rgb * shadow * 1.1, tex.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
