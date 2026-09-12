"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * WebGL2 dalga arka planı (fbm + domain warp) + hafif cursor trail.
 *
 * İki kullanım:
 *  - <WavyBackground>…</WavyBackground>  → kendi kutusunu dolduran bölüm
 *  - <WavyBackground fixed />            → viewport'a sabit, site geneli zemin
 *    (layout'ta; hero video opak olduğu için dalgalar hero bittikten sonra
 *    görünür ve tüm sayfalarda içeriğin altında akar)
 *
 * `brightness` shader içinde rengi çarpar, `opacity` canvas'ı soluklaştırır.
 * En koyu ton alpha=0 → altındaki zemin rengi (--color-canvas) görünür.
 * Performans: canvas viewport'un 0.4 çözünürlüğünde çizilir (fbm 6 oktav),
 * ~30 fps ile sınırlı; sekme gizliyken, hareket azaltma tercihinde ve hero
 * (opak video) viewport'tayken ("as:hero-visible" olayı) durur; sayfa
 * kayarken dalga zamanı yarı hızda akar. Canvas `contain: strict`.
 *
 * CURSOR TRAIL (kaynak: cursor-trail örneği, three.js'siz uyarlama):
 *  - Viewport'un 1/4 çözünürlüğünde iki framebuffer (ping-pong, RGBA16F;
 *    EXT_color_buffer_float yoksa RGBA8). Her karede "trail pass": önceki
 *    dokuyu curl-noise ile hafif kaydırarak okur, `1 - dt*2` ile söndürür,
 *    cursor'a mesafeye göre üç katman boyar (lacivert → mavi → aqua).
 *  - Ana dalga pass'i trail dokusunu okur; luminance'ı kadar dalga rengine
 *    HAFİF karışır (TRAIL_STRENGTH) ve domain warp'ı yerel olarak büker
 *    (TRAIL_WARP). Alpha = max(dalga alfa, lum * 0.5).
 *  - Yalnızca fare (pointerType "mouse"); dokunmatik / kaba işaretçi ve
 *    prefers-reduced-motion'da trail pass hiç çalışmaz. Ayrı rAF yok;
 *    mevcut döngü kullanılır. pointermove yalnızca yerel değişken yazar.
 */

// ---------------------------------------------------------------- CONFIG
const ZOOM_FACTOR = 0.3;
const BASE_WAVE_AMPLITUDE = 0.2;
const RANDOM_WAVE_FACTOR = 0.15;
const WAVE_FREQUENCY = 4.0;
const TIME_FACTOR = 0.25;
const BASE_SWIRL_STRENGTH = 1.2;
const SWIRL_TIME_MULT = 5.0;
const NOISE_SWIRL_FACTOR = 0.2;
const FBM_OCTAVES = 6; // 10 → 6: scroll jank ölçümü sonrası
/** Çizim çözünürlüğü çarpanı (1 = tam). Site geneli için 0.4 yeterli. */
const RENDER_SCALE = 0.4;
/** Dalga + trail pass kare sınırı (ms): ~30 fps */
const FRAME_MIN_MS = 33;
/** Sayfa kayarken dalga zaman hızı çarpanı (Lenis/scroll aktifken yavaşlar) */
const SCROLL_TIME_SCALE = 0.5;

/** Trail: dalga rengine karışma oranı (0 = kapalı, 1 = tam). Belli belirsiz için 0.35 */
const TRAIL_STRENGTH = 0.35;
/** Trail: izin dalgayı yerel bükme miktarı (uv kayması) */
const TRAIL_WARP = 0.03;
/** Trail dokusu çözünürlük çarpanı (viewport'a göre) */
const TRAIL_SCALE = 0.25;
/** Trail renkleri — dış halka lacivert, orta mavi, çekirdek açık aqua (palet) */
const TRAIL_OUTER: [number, number, number] = [0.09, 0.255, 0.631]; // #1741a1
const TRAIL_MID: [number, number, number] = [0.125, 0.553, 0.847]; // #208dd8
const TRAIL_CORE: [number, number, number] = [0.702, 0.929, 0.922]; // #b3edeb

const seaColors = [
  [0.0, 0.02, 0.05],
  [0.0, 0.04, 0.08],
  [0.0, 0.06, 0.12],
  [0.0, 0.08, 0.18],
  [0.0, 0.1, 0.24],
  [0.0, 0.14, 0.32],
  [0.0, 0.2, 0.4],
  [0.0, 0.24, 0.48],
  [0.0, 0.3, 0.55],
  [0.05, 0.35, 0.6],
  [0.08, 0.4, 0.65],
  [0.1, 0.45, 0.7],
  [0.15, 0.5, 0.75],
  [0.2, 0.58, 0.8],
  [0.25, 0.65, 0.85],
  [0.3, 0.72, 0.9],
  [0.4, 0.78, 0.92],
  [0.5, 0.85, 0.95],
  [0.7, 0.9, 0.97],
  [0.85, 0.95, 1.0],
];

const vec3 = (c: [number, number, number]) => `vec3(${c[0]}, ${c[1]}, ${c[2]})`;

function buildFragmentShader(): string {
  const fbmOctavesInt = Math.floor(FBM_OCTAVES);
  const colorArraySrc = seaColors
    .map((c) => `vec3(${c[0]}, ${c[1]}, ${c[2]})`)
    .join(",\n  ");

  return `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uResolution;
uniform float uTime;
uniform float uBrightness;
/** Cursor trail dokusu (ping-pong FBO çıktısı) ve karışım gücü */
uniform sampler2D uTrail;
uniform float uTrailStrength;
uniform float uTrailWarp;

#define NUM_COLORS 20

vec3 seaColors[NUM_COLORS] = vec3[](
  ${colorArraySrc}
);

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float noise2D(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) +
    i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.792843 - 0.853734 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  float freq = 1.0;
  for (int i = 0; i < ${fbmOctavesInt}; i++) {
    value += amplitude * noise2D(st * freq);
    freq *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 screenUv = gl_FragCoord.xy / uResolution.xy;
  vec3 trail = texture(uTrail, screenUv).rgb;
  float trailLum = dot(trail, vec3(0.299, 0.587, 0.114));

  vec2 uv = screenUv * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;
  uv *= float(${ZOOM_FACTOR});

  float t = uTime * float(${TIME_FACTOR});
  float waveAmp = float(${BASE_WAVE_AMPLITUDE}) + float(${RANDOM_WAVE_FACTOR})
                  * noise2D(vec2(t, 27.7));
  float waveX = waveAmp * sin(uv.y * float(${WAVE_FREQUENCY}) + t);
  float waveY = waveAmp * sin(uv.x * float(${WAVE_FREQUENCY}) - t);
  uv.x += waveX;
  uv.y += waveY;

  float r = length(uv);
  float angle = atan(uv.y, uv.x);
  float swirlStrength = float(${BASE_SWIRL_STRENGTH})
                        * (1.0 - smoothstep(0.0, 1.0, r));
  angle += swirlStrength * sin(uTime + r * float(${SWIRL_TIME_MULT}));
  uv = vec2(cos(angle), sin(angle)) * r;

  // Cursor izi dalgayı yerel olarak hafifçe büker
  uv += trailLum * uTrailWarp;

  float n = fbm(uv);
  n += float(${NOISE_SWIRL_FACTOR}) * sin(t + n * 3.0);
  float noiseVal = 0.5 * (n + 1.0);

  float idx = clamp(noiseVal, 0.0, 1.0) * float(NUM_COLORS - 1);
  int iLow = int(floor(idx));
  int iHigh = int(min(float(iLow + 1), float(NUM_COLORS - 1)));
  float f = fract(idx);

  vec3 waveColor = mix(seaColors[iLow], seaColors[iHigh], f) * uBrightness;
  float waveAlpha = (iLow == 0 && iHigh == 0) ? 0.0 : 1.0;

  // İz dalganın üstünde belli belirsiz: luminance kadar karışır
  vec3 finalColor = mix(waveColor, trail, trailLum * uTrailStrength);
  float alpha = max(waveAlpha, trailLum * 0.5);
  outColor = vec4(finalColor, alpha);
}
`;
}

/** Trail pass — cursor-trail örneğinin fragment.glsl'i, GLSL 300 es'e uyarlandı */
function buildTrailShader(): string {
  return `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uResolution;
uniform sampler2D uMap;
uniform vec2 uPointer;
uniform float uDt;
uniform float uSpeed;
uniform float uTime;
/** Hareket etkinliği (1 = fare hareket ediyor, 0 = durdu): duran cursor iz boyamaz */
uniform float uActivity;

vec4 permute(vec4 x) { return mod(x * x * 34.0 + x, 289.0); }
float snoise(vec3 v) {
  const vec2 C = 1.0 / vec2(6.0, 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.x;
  vec3 x2 = x0 - i2 + C.y;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  vec3 ns = 0.142857142857 * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = floor(j - 7.0 * x_) * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + (floor(b0) * 2.0 + 1.0).xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + (floor(b1) * 2.0 + 1.0).xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = inversesqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  return 0.5 + 12.0 * dot(m * m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 x) {
  return vec3(
    snoise(vec3(x)) * 2.0 - 1.0,
    snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)) * 2.0 - 1.0,
    snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4)) * 2.0 - 1.0
  );
}

vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  vec3 p_x0 = snoiseVec3(p - dx);
  vec3 p_x1 = snoiseVec3(p + dx);
  vec3 p_y0 = snoiseVec3(p - dy);
  vec3 p_y1 = snoiseVec3(p + dy);
  vec3 p_z0 = snoiseVec3(p - dz);
  vec3 p_z1 = snoiseVec3(p + dz);
  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
  const float divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // Önceki izi iki frekansta curl-noise ile kaydırarak oku (kıvrılarak dağılır)
  vec2 uv2 = uv + curlNoise(vec3(uv * 4.0 + uTime * 0.1, uTime * 0.1)).xy * uDt * 0.3;
  uv += curlNoise(vec3(uv * 2.0 + uTime * 0.1, uTime * 0.1)).xy * uDt * 0.15;
  vec3 mapColor = texture(uMap, uv).rgb;
  vec3 mapColor2 = texture(uMap, uv2).rgb;

  uv -= 0.5;
  uv *= 2.0;
  uv.x *= uResolution.x / uResolution.y;
  vec2 pointer = uPointer;
  pointer.x *= uResolution.x / uResolution.y;
  float d = distance(uv, pointer);

  vec3 color = mix(mapColor, mapColor2, 0.5);
  color *= 1.0 - uDt * 2.0; // sönüm: ~1–2 sn

  float speed = clamp(uSpeed * 2.0, 0.075, 0.25);
  float t = smoothstep(speed, 0.0, d);
  float t3 = pow(t, 4.0);
  float t2 = pow(t, 10.0);
  float scale = speed * 5.0 * uActivity;
  t *= scale; t3 *= scale; t2 *= scale;

  color = mix(color, ${vec3(TRAIL_OUTER)}, t);
  color = mix(color, ${vec3(TRAIL_MID)}, t3);
  color = mix(color, ${vec3(TRAIL_CORE)}, t2);
  color = clamp(color, 0.0, 1.0);

  outColor = vec4(color, 1.0);
}
`;
}

const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

function createShaderProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
): WebGLProgram | null {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader) return null;
  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("Vertex shader error:", gl.getShaderInfoLog(vertexShader));
    gl.deleteShader(vertexShader);
    return null;
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragmentShader) {
    gl.deleteShader(vertexShader);
    return null;
  }
  gl.shaderSource(fragmentShader, fsSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("Fragment shader error:", gl.getShaderInfoLog(fragmentShader));
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Could not link WebGL program:", gl.getProgramInfoLog(program));
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/** Ping-pong hedefi: texture + framebuffer */
interface RenderTarget {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
}

function createRenderTarget(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  halfFloat: boolean,
): RenderTarget | null {
  const texture = gl.createTexture();
  const fbo = gl.createFramebuffer();
  if (!texture || !fbo) return null;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  allocateTexture(gl, width, height, halfFloat);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  if (!ok) {
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(fbo);
    return null;
  }
  return { texture, fbo };
}

function allocateTexture(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  halfFloat: boolean,
) {
  if (halfFloat) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
}

export interface WavyBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  /** Viewport'a sabit, içeriğin altında (site geneli zemin). */
  fixed?: boolean;
  /** Renk çarpanı, 0–1. 1 = orijinal parlaklık. */
  brightness?: number;
  /** Canvas opaklığı, 0–1. */
  opacity?: number;
}

export const WavyBackground = ({
  children,
  className,
  fixed = false,
  brightness = 1,
  opacity = 1,
}: WavyBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) {
      console.error("WebGL2 is not supported by your browser.");
      return;
    }

    gl.clearColor(0, 0, 0, 0);

    const program = createShaderProgram(gl, vertexShaderSource, buildFragmentShader());
    if (!program) return;
    const trailProgram = createShaderProgram(gl, vertexShaderSource, buildTrailShader());

    const quadVertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
    // İki program da aynı "aPosition" attribute'unu kullanır (tek VAO)
    const aPositionLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // --- Ana pass uniform'ları ---
    gl.useProgram(program);
    const uResolutionLoc = gl.getUniformLocation(program, "uResolution");
    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uBrightnessLoc = gl.getUniformLocation(program, "uBrightness");
    const uTrailLoc = gl.getUniformLocation(program, "uTrail");
    const uTrailStrengthLoc = gl.getUniformLocation(program, "uTrailStrength");
    const uTrailWarpLoc = gl.getUniformLocation(program, "uTrailWarp");
    gl.uniform1f(uBrightnessLoc, brightness);
    gl.uniform1i(uTrailLoc, 0);
    gl.uniform1f(uTrailStrengthLoc, 0);
    gl.uniform1f(uTrailWarpLoc, 0);

    // --- Trail pass uniform'ları ---
    let tResolutionLoc: WebGLUniformLocation | null = null;
    let tMapLoc: WebGLUniformLocation | null = null;
    let tPointerLoc: WebGLUniformLocation | null = null;
    let tDtLoc: WebGLUniformLocation | null = null;
    let tSpeedLoc: WebGLUniformLocation | null = null;
    let tTimeLoc: WebGLUniformLocation | null = null;
    let tActivityLoc: WebGLUniformLocation | null = null;
    if (trailProgram) {
      gl.useProgram(trailProgram);
      tResolutionLoc = gl.getUniformLocation(trailProgram, "uResolution");
      tMapLoc = gl.getUniformLocation(trailProgram, "uMap");
      tPointerLoc = gl.getUniformLocation(trailProgram, "uPointer");
      tDtLoc = gl.getUniformLocation(trailProgram, "uDt");
      tSpeedLoc = gl.getUniformLocation(trailProgram, "uSpeed");
      tTimeLoc = gl.getUniformLocation(trailProgram, "uTime");
      tActivityLoc = gl.getUniformLocation(trailProgram, "uActivity");
      gl.uniform1i(tMapLoc, 0);
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Dokunmatik / kaba işaretçi: trail hiç kurulmaz
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const trailEnabled = Boolean(trailProgram) && !reduced && !coarse;

    // Boş 1×1 doku: trail kapalıyken uTrail bunu okur (lum 0 → etki yok)
    const emptyTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, emptyTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Ping-pong hedefleri (RGBA16F, desteklenmiyorsa RGBA8)
    const halfFloat = trailEnabled && Boolean(gl.getExtension("EXT_color_buffer_float"));
    let trailW = 1;
    let trailH = 1;
    let rt1: RenderTarget | null = null;
    let rt2: RenderTarget | null = null;
    let inputRT: RenderTarget | null = null;
    let outputRT: RenderTarget | null = null;

    const trailSize = () => ({
      w: Math.max(1, Math.floor(window.innerWidth * TRAIL_SCALE)),
      h: Math.max(1, Math.floor(window.innerHeight * TRAIL_SCALE)),
    });

    const destroyTargets = () => {
      for (const rt of [rt1, rt2]) {
        if (!rt) continue;
        gl.deleteFramebuffer(rt.fbo);
        gl.deleteTexture(rt.texture);
      }
      rt1 = rt2 = inputRT = outputRT = null;
    };

    const setupTargets = () => {
      if (!trailEnabled) return;
      const { w, h } = trailSize();
      if (rt1 && rt2 && w === trailW && h === trailH) return;
      destroyTargets();
      trailW = w;
      trailH = h;
      rt1 = createRenderTarget(gl, w, h, halfFloat) ?? createRenderTarget(gl, w, h, false);
      rt2 = createRenderTarget(gl, w, h, halfFloat) ?? createRenderTarget(gl, w, h, false);
      if (!rt1 || !rt2) {
        destroyTargets();
        return;
      }
      // İki hedef de siyahla başlar
      for (const rt of [rt1, rt2]) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, rt.fbo);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      inputRT = rt1;
      outputRT = rt2;
    };

    // --- Cursor durumu (yalnızca yerel değişken; re-render yok) ---
    const pointer = { targetX: 0, targetY: 0, x: 0, y: 0, speed: 0, activity: 0, lastMove: -Infinity };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.lastMove = performance.now();
    };

    const resize = () => {
      const w = Math.max(1, Math.floor(window.innerWidth * RENDER_SCALE));
      const h = Math.max(1, Math.floor(window.innerHeight * RENDER_SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      setupTargets();
    };

    let last = performance.now();
    let lastDraw = -Infinity;
    let raf = 0;
    let running = true;
    let heroVisible = false;
    let lastScroll = -Infinity;
    // Dalga zamanı biriktirilir: scroll sırasında yarı hızda akar
    let waveTime = 0;

    const draw = () => {
      resize();
      const now = performance.now();
      const dt = Math.min((now - last) * 0.001, 0.05); // duraklama sonrası sıçrama yok
      last = now;
      const scrolling = now - lastScroll < 150;
      waveTime += dt * (scrolling ? SCROLL_TIME_SCALE : 1);
      const time = waveTime;

      // --- Trail pass (1/4 çözünürlük, ping-pong) ---
      const trailActive = trailEnabled && trailProgram && inputRT && outputRT;
      if (trailActive) {
        pointer.speed +=
          (Math.hypot(pointer.targetX - pointer.x, pointer.targetY - pointer.y) - pointer.speed) *
          Math.min(1, dt * 3);
        pointer.x += (pointer.targetX - pointer.x) * Math.min(1, dt * 15);
        pointer.y += (pointer.targetY - pointer.y) * Math.min(1, dt * 15);
        // Hareket kesilince boyama ~1 sn'de söner; iz de 1 - dt*2 ile dağılır
        const moving = now - pointer.lastMove < 120 ? 1 : 0;
        pointer.activity += (moving - pointer.activity) * Math.min(1, dt * (moving ? 12 : 3));

        gl.disable(gl.BLEND);
        gl.bindFramebuffer(gl.FRAMEBUFFER, outputRT!.fbo);
        gl.viewport(0, 0, trailW, trailH);
        gl.useProgram(trailProgram!);
        gl.bindVertexArray(vao);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inputRT!.texture);
        gl.uniform2f(tResolutionLoc, trailW, trailH);
        gl.uniform2f(tPointerLoc, pointer.x, pointer.y);
        gl.uniform1f(tDtLoc, dt);
        gl.uniform1f(tSpeedLoc, pointer.speed);
        gl.uniform1f(tTimeLoc, time);
        gl.uniform1f(tActivityLoc, pointer.activity);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }

      // --- Ana dalga pass'i ---
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, trailActive ? outputRT!.texture : emptyTexture);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(uTimeLoc, time);
      gl.uniform1f(uTrailStrengthLoc, trailActive ? TRAIL_STRENGTH : 0);
      gl.uniform1f(uTrailWarpLoc, trailActive ? TRAIL_WARP : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (trailActive) {
        const tmp = inputRT;
        inputRT = outputRT;
        outputRT = tmp;
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      // ~30 fps: kare sınırı altındaysa çizme
      if (now - lastDraw < FRAME_MIN_MS) return;
      lastDraw = now;
      draw();
    };

    const syncRunning = () => {
      const next = !document.hidden && !reduced && !heroVisible;
      if (next === running) return;
      running = next;
      cancelAnimationFrame(raf);
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const onVisibility = () => syncRunning();
    const onHeroVisible = (e: Event) => {
      heroVisible = Boolean((e as CustomEvent<boolean>).detail);
      syncRunning();
    };
    const onScroll = () => {
      lastScroll = performance.now();
    };

    resize();
    // Isınma: ilk kare (her iki pass) yüklemede çizilir; Metal/ANGLE pipeline
    // derlemesi ilk scroll'a kalmasın. Hero görünürse sonra duraklar.
    draw();
    if (!reduced) {
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("as:hero-visible", onHeroVisible);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (trailEnabled) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("as:hero-visible", onHeroVisible);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      destroyTargets();
      gl.deleteTexture(emptyTexture);
      if (trailProgram) gl.deleteProgram(trailProgram);
      gl.deleteProgram(program);
      gl.deleteBuffer(vbo);
      gl.deleteVertexArray(vao);
    };
  }, [brightness]);

  if (fixed) {
    return (
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn("pointer-events-none fixed inset-0 z-[1] h-full w-full", className)}
        style={{ background: "transparent", opacity, contain: "strict" }}
      />
    );
  }

  return (
    <div className={cn("relative h-screen w-full overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full"
        style={{ background: "transparent", opacity, contain: "strict" }}
      />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
};
