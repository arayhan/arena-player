"use client";

import { useEffect, useRef } from "react";

/**
 * THE ONE WEBGL MOMENT. Hero only, and built to be deletable.
 *
 * architecture.md permits exactly one WebGL effect under conditions that are
 * the whole point of the permission:
 *
 *   - hero only, never in or adjacent to the order section
 *   - loaded through `next/dynamic` with `ssr: false`, never in the critical
 *     path and NEVER the LCP element — the headline is the LCP element
 *   - a static fallback renders first and stays if context creation fails
 *   - disabled under `prefers-reduced-motion` and under `saveData`
 *   - ≤ 40KB gzip for the lazy chunk
 *   - removable in one commit: nothing imports from this file except the
 *     `next/dynamic` call in hero.tsx
 *
 * NO THREE.JS, NO OGL, NO LIBRARY AT ALL. three.js is ~150KB gzip — larger
 * than the entire remaining budget on `/` and 3.75× the 40KB cap. This is a
 * fragment shader on a fullscreen triangle, which is what most light-theme
 * generative heroes actually are underneath. architecture.md said it first:
 * "Reach for the shader, not the engine."
 *
 * The client asked for three.js by name. They get the moving gradient they
 * wanted; what changed is the vehicle, and the reason is arithmetic.
 */

const VERTEX = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

// A slow blue-white flow field. The palette is the product's own — blue-50
// ground, Signal Blue and a navy hint — so the hero reads as the same world as
// everything below it rather than as a stock gradient parked on top.
const FRAGMENT = `#version 300 es
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
out vec4 outColor;

// Cheap value noise. No texture fetch, no derivatives, so this stays fast on
// the mid-range Android in an in-app webview that is the design target.
float hash(vec2 v) { return fract(sin(dot(v, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 v) {
  vec2 i = floor(v), f = fract(v);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 q = uv * 2.2;
  float t = uTime * 0.04;

  // Two octaves is enough for a soft field and costs half of four.
  float n = noise(q + vec2(t, t * 0.7));
  n += 0.5 * noise(q * 2.1 - vec2(t * 1.3, t));
  n /= 1.5;

  vec3 ground = vec3(0.937, 0.965, 1.0);   // blue-50  #EFF6FF
  vec3 signal = vec3(0.145, 0.388, 0.922); // blue-600 #2563EB
  vec3 ink    = vec3(0.004, 0.102, 0.263); // navy-900 #011A43

  // Kept pale on purpose: the headline sits on top and must stay the most
  // contrasted thing in the viewport. A hero that wins against its own text
  // has failed the one job the LCP element has.
  vec3 col = mix(ground, signal, smoothstep(0.45, 0.95, n) * 0.22);
  col = mix(col, ink, smoothstep(0.75, 1.0, n) * 0.06);

  // Fade out toward the bottom so the section boundary is a gradient rather
  // than a hard edge against the page ground.
  col = mix(col, ground, smoothstep(0.55, 1.0, uv.y));

  outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // BOTH GATES, NOT ONE. Reduced motion is the accessibility contract;
    // saveData is the visitor telling the browser they are paying per
    // megabyte, which on this audience's connections is a real statement.
    // Either one means the static fallback underneath is the final answer.
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    // Context creation failing is routine, not exceptional: older in-app
    // webviews, blocklisted drivers, too many live contexts. The fallback is
    // already on screen, so returning here is the whole error path.
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // One oversized triangle rather than two triangles for a quad: fewer
    // vertices, no seam down the diagonal, and it is the standard trick.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");

    // DPR is capped at 1.5. A 3× phone screen would otherwise shade nine times
    // the pixels for a soft gradient nobody can resolve at that density, and
    // the Lighthouse gate is CPU-per-frame rather than kilobytes.
    const resize = () => {
      const dpr = Math.min(globalThis.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let frame = 0;
    // Starts FALSE, not true. The hero is almost always on screen at mount
    // (it is the first thing on the page), but "almost always" is not
    // "always" — a deep link to #ketentuan or #lokasi can mount this
    // component scrolled fully out of view, and starting the loop
    // unconditionally here would burn a frame budget on a canvas nobody is
    // looking at until the IntersectionObserver below gets its first
    // callback. The observer decides when the loop actually starts.
    let running = false;
    const start = performance.now();

    const draw = (now: number) => {
      if (!running) return;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(draw);
    };

    // THE OFF-SCREEN-IS-OFF RULE (DESIGN.md, added in the 2026-08-12
    // redesign). This loop and the marquee are the only two continuously
    // running animations on the page, and the two things that can burn CPU
    // while the visitor is reading something else. `visible` tracks the
    // IntersectionObserver below; `running` is the actual rAF state, and the
    // two are combined rather than merged into one flag because a tab that
    // goes hidden while the hero happens to be off-screen must not restart
    // the loop the moment the hero scrolls back into view of a still-hidden
    // tab. Two uncapped rAF loops on a mid-range Android is named in
    // DESIGN.md as the likeliest way this page fails a Lighthouse gate it
    // would otherwise pass.
    let visible = false;

    const startLoop = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(draw);
    };
    const stopLoop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible && !document.hidden) startLoop();
        else stopLoop();
      },
      // A small negative-free threshold — the loop only needs to be off
      // while NOTHING of the hero is on screen, not while it is merely
      // partially scrolled.
      { threshold: 0 },
    );
    io.observe(canvas);

    // Stop when the tab is hidden. A gradient nobody is looking at is pure
    // battery cost on a phone, and this audience is mid-conversation in
    // another app more often than not.
    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else if (visible) startLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    canvas.style.opacity = "1";

    return () => {
      stopLoop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      // Free the context outright. Browsers cap live WebGL contexts per page,
      // and a route change that leaks one is how the second visit gets no
      // hero at all.
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
    />
  );
}
